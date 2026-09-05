import { PlaygroundNode, PlaygroundConnection } from '../../../types/playground';

export type StyleFormat = 'tailwind' | 'scss' | 'inline';

export function generateReactCode(
  nodes: PlaygroundNode[],
  connections: PlaygroundConnection[],
  appName: string = 'App',
  styleFormat: StyleFormat = 'tailwind'
): string {
  // 1. Identify Hook / Logic nodes
  const hookNodes = nodes.filter((n) => n.type === 'logic');
  const uiNodes = nodes
    .filter((n) => n.type === 'ui')
    .sort((a, b) => {
      const orderA = typeof a.props?.uiOrder === 'number' ? a.props.uiOrder : nodes.indexOf(a);
      const orderB = typeof b.props?.uiOrder === 'number' ? b.props.uiOrder : nodes.indexOf(b);
      return orderA - orderB;
    });

  // Collect imports needed
  const reactHooksUsed = new Set<string>();

  // Generate hook declarations
  const hookDeclarations: string[] = [];

  hookNodes.forEach((node) => {
    if (node.subtype === 'useState') {
      reactHooksUsed.add('useState');
      const stateName = node.props.stateName || 'count';
      const setterName = node.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const initialValue = node.props.initialValue !== undefined ? JSON.stringify(node.props.initialValue) : '0';
      hookDeclarations.push(`  const [${stateName}, ${setterName}] = useState(${initialValue});`);
    } else if (node.subtype === 'useEffect') {
      reactHooksUsed.add('useEffect');
      const depsType = node.props.depsType || 'empty';
      const depsStr = depsType === 'none' ? '' : `[${node.props.deps?.join(', ') || ''}]`;
      const effectCode = node.props.effectCode || 'console.log("Effect executed");';
      const hasCleanup = node.props.hasCleanup !== false;
      const cleanupCode = node.props.cleanupCode || 'console.log("Cleanup executed");';

      if (hasCleanup) {
        hookDeclarations.push(
          `  useEffect(() => {\n    ${effectCode}\n    return () => {\n      ${cleanupCode}\n    };\n  }${depsStr ? `, ${depsStr}` : ''});`
        );
      } else {
        hookDeclarations.push(
          `  useEffect(() => {\n    ${effectCode}\n  }${depsStr ? `, ${depsStr}` : ''});`
        );
      }
    } else if (node.subtype === 'useRef') {
      reactHooksUsed.add('useRef');
      const refName = node.props.stateName || 'myRef';
      const initVal = node.props.initialValue !== undefined ? node.props.initialValue : 'null';
      hookDeclarations.push(`  const ${refName} = useRef(${initVal});`);
    } else if (node.subtype === 'useReducer') {
      reactHooksUsed.add('useReducer');
      const initVal = JSON.stringify(node.props.reducerInitialState ?? 0);
      hookDeclarations.push(`  const [state, dispatch] = useReducer(reducer, ${initVal});`);
    } else if (node.subtype === 'useMemo') {
      reactHooksUsed.add('useMemo');
      const expr = node.props.memoExpression || 'count * 2';
      const deps = node.props.deps?.join(', ') || 'count';
      hookDeclarations.push(`  const memoizedValue = useMemo(() => ${expr}, [${deps}]);`);
    } else if (node.subtype === 'useCallback') {
      reactHooksUsed.add('useCallback');
      const fnName = node.props.callbackFnName || 'handleClick';
      const deps = node.props.deps?.join(', ') || 'count';
      const body = node.props.callbackBody || 'console.log("Callback triggered");';
      hookDeclarations.push(`  const ${fnName} = useCallback(() => {\n    ${body}\n  }, [${deps}]);`);
    } else if (node.subtype === 'useContext') {
      reactHooksUsed.add('useContext');
      reactHooksUsed.add('createContext');
      const ctx = node.props.contextName || 'ThemeContext';
      hookDeclarations.push(`  // Consumes ${ctx} directly from root Provider with zero prop drilling\n  const { theme, toggleTheme } = useContext(${ctx});`);
    } else if (node.subtype === 'useId') {
      reactHooksUsed.add('useId');
      const varName = node.props.elementName || 'inputId';
      hookDeclarations.push(`  const ${varName} = useId();`);
    } else if (node.subtype === 'useTransition') {
      reactHooksUsed.add('useTransition');
      hookDeclarations.push(`  const [isPending, startTransition] = useTransition();`);
    } else if (node.subtype === 'useLayoutEffect') {
      reactHooksUsed.add('useLayoutEffect');
      const deps = node.props.deps?.join(', ') || '';
      hookDeclarations.push(`  useLayoutEffect(() => {\n    // Synchronous layout calculation before browser repaint\n  }, [${deps}]);`);
    } else if (node.subtype === 'useDeferredValue') {
      reactHooksUsed.add('useDeferredValue');
      const valName = node.props.stateName || 'query';
      hookDeclarations.push(`  // Defers expensive result rendering without delaying urgent typing input\n  const deferred${valName.charAt(0).toUpperCase() + valName.slice(1)} = useDeferredValue(${valName});`);
    } else if (node.subtype === 'useOptimistic') {
      reactHooksUsed.add('useOptimistic');
      const stateName = node.props.stateName || 'item';
      hookDeclarations.push(`  // Optimistic UI state updated immediately before server roundtrip\n  const [optimistic${stateName.charAt(0).toUpperCase() + stateName.slice(1)}, setOptimistic${stateName.charAt(0).toUpperCase() + stateName.slice(1)}] = useOptimistic(\n    ${stateName},\n    (current, update) => ({ ...current, ...update })\n  );`);
    } else if (node.subtype === 'useActionState') {
      reactHooksUsed.add('useActionState');
      hookDeclarations.push(`  // Manages async form action pipeline state, validation errors, and pending status\n  const [formState, formAction, isFormPending] = useActionState(async (prev, formData) => {\n    return await handleFormSubmit(formData);\n  }, null);`);
    } else if (node.subtype === 'useFormStatus') {
      reactHooksUsed.add('useFormStatus');
      hookDeclarations.push(`  // Reads parent <form> submission status without prop drilling\n  const { pending, data, method, action } = useFormStatus();`);
    } else if (node.subtype === 'useSyncExternalStore') {
      reactHooksUsed.add('useSyncExternalStore');
      hookDeclarations.push(`  // Subscribes to external store with tearing prevention\n  const storeSnapshot = useSyncExternalStore(\n    externalStore.subscribe,\n    externalStore.getSnapshot,\n    externalStore.getServerSnapshot\n  );`);
    }
  });

  // Map event connections (e.g. Button.onClick -> setCount)
  const eventMap = new Map<string, string>();
  connections
    .filter((c) => c.type === 'event' || c.type === 'data')
    .forEach((c) => {
      const sourceBtn = uiNodes.find((n) => n.id === c.sourceNodeId);
      const targetHook = hookNodes.find((h) => h.id === c.targetNodeId);
      if (sourceBtn && sourceBtn.subtype === 'Button' && targetHook && targetHook.subtype === 'useState') {
        const stateName = targetHook.props.stateName || 'count';
        const setterName = targetHook.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
        const actionType = sourceBtn.props.actionType || 'increment';
        const amount = sourceBtn.props.actionAmount ?? 1;

        if (actionType === 'decrement') {
          eventMap.set(c.sourceNodeId, `() => ${setterName}(${stateName.charAt(0)} => ${stateName.charAt(0)} - ${amount})`);
        } else if (actionType === 'reset') {
          const init = targetHook.props.initialValue !== undefined ? JSON.stringify(targetHook.props.initialValue) : '0';
          eventMap.set(c.sourceNodeId, `() => ${setterName}(${init})`);
        } else if (actionType === 'toggle') {
          eventMap.set(c.sourceNodeId, `() => ${setterName}(${stateName.charAt(0)} => !${stateName.charAt(0)})`);
        } else if (actionType === 'setValue') {
          eventMap.set(c.sourceNodeId, `() => ${setterName}(${JSON.stringify(sourceBtn.props.actionValue ?? 0)})`);
        } else {
          eventMap.set(
            c.sourceNodeId,
            amount === 1
              ? `() => ${setterName}(${stateName.charAt(0)} => ${stateName.charAt(0)} + 1)`
              : `() => ${setterName}(${stateName.charAt(0)} => ${stateName.charAt(0)} + ${amount})`
          );
        }
      }
    });

  const getTargetHook = (nodeId: string) => {
    const conn = connections.find(
      (c) =>
        (c.sourceNodeId === nodeId && (c.type === 'event' || c.type === 'data')) ||
        (c.targetNodeId === nodeId && (c.type === 'event' || c.type === 'data'))
    );
    if (conn) {
      const targetHookId = conn.sourceNodeId === nodeId ? conn.targetNodeId : conn.sourceNodeId;
      return hookNodes.find((h) => h.id === targetHookId && h.subtype === 'useState');
    }
    return hookNodes.find((h) => h.subtype === 'useState');
  };

  // Build JSX tree for individual UI node
  const buildUIJSX = (node: PlaygroundNode, indent: string = '    '): string => {
    const eventHandler = eventMap.get(node.id);
    const content = node.props.content || '';

    // Interpolate state variables: {{count}} -> {count}
    const formattedContent = content.replace(/\{\{(\w+)\}\}/g, '{$1}');

    if (node.subtype === 'Button') {
      const clickProp = eventHandler ? ` onClick={${eventHandler}}` : '';
      let btnBody = formattedContent || 'Button';
      if (node.props.actionType === 'toggle') {
        const boundHook = getTargetHook(node.id);
        if (boundHook && boundHook.props.stateName === 'isRunning') {
          btnBody = `{isRunning ? 'Pause' : 'Start'}`;
        }
      }

      if (styleFormat === 'tailwind') {
        const isSecondary = node.props.variant === 'secondary' || node.props.variant === 'outline';
        const colorClass = isSecondary
          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm';
        return `${indent}<button className="px-4 py-2 ${colorClass} active:scale-95 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm"${clickProp}>\n${indent}  ${btnBody}\n${indent}</button>`;
      } else if (styleFormat === 'scss') {
        return `${indent}<button className={styles.button}${clickProp}>\n${indent}  ${btnBody}\n${indent}</button>`;
      } else {
        const variantClass = node.props.variant ? ` className="btn-${node.props.variant}"` : '';
        return `${indent}<button${variantClass}${clickProp} style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>\n${indent}  ${btnBody}\n${indent}</button>`;
      }
    }

    if (node.subtype === 'Input') {
      const hasTransition = hookNodes.some((h) => h.subtype === 'useTransition');
      const inputType = node.props.inputType || 'text';
      const placeholder = node.props.placeholder || 'Type here...';

      let styleAttr = '';
      if (styleFormat === 'tailwind') {
        styleAttr = ' className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"';
      } else if (styleFormat === 'scss') {
        styleAttr = ' className={styles.input}';
      } else {
        styleAttr = ' style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#f8fafc", fontSize: "14px" }}';
      }

      if (hasTransition) {
        return `${indent}<input\n${indent}  type="${inputType}"\n${indent}  placeholder="${placeholder}"\n${indent}  value={inputQuery}\n${indent}  onChange={(e) => {\n${indent}    setInputQuery(e.target.value);\n${indent}    startTransition(() => {\n${indent}      setDeferredQuery(e.target.value);\n${indent}    });\n${indent}  }}${styleAttr}\n${indent}/>`;
      }
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'text';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      if (targetHook) {
        return `${indent}<input\n${indent}  type="${inputType}"\n${indent}  placeholder="${placeholder}"\n${indent}  value={${stateName}}\n${indent}  onChange={(e) => ${setterName}(e.target.value)}${styleAttr}\n${indent}/>`;
      }
      return `${indent}<input type="${inputType}" placeholder="${placeholder}"${styleAttr} />`;
    }

    if (node.subtype === 'Switch') {
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'isOpen';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const label = node.props.label || formattedContent || 'Toggle Mode';
      const classAttr = styleFormat === 'tailwind' ? ' className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-200"' : styleFormat === 'scss' ? ' className={styles.switch}' : ' style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}';

      if (targetHook) {
        return `${indent}<label${classAttr}>\n${indent}  <span>${label}</span>\n${indent}  <input\n${indent}    type="checkbox"\n${indent}    role="switch"\n${indent}    checked={${stateName}}\n${indent}    onChange={(e) => ${setterName}(e.target.checked)}\n${indent}  />\n${indent}</label>`;
      }
      return `${indent}<label${classAttr}><span>${label}</span><input type="checkbox" role="switch" /></label>`;
    }

    if (node.subtype === 'Dropdown') {
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'selected';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const options = JSON.stringify(node.props.options || ['Light', 'Dark', 'System']);
      const label = node.props.content || node.props.label;
      const labelAttr = label ? `\n${indent}  label="${label}"` : '';
      if (targetHook) {
        return `${indent}{/* Custom Dropdown Select */}\n${indent}<CustomDropdown${labelAttr}\n${indent}  value={${stateName}}\n${indent}  options={${options}}\n${indent}  onChange={(val) => ${setterName}(val)}\n${indent}/>`;
      }
      return `${indent}<CustomDropdown${labelAttr} options={${options}} />`;
    }

    if (node.subtype === 'Slider') {
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'value';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const min = node.props.min ?? 0;
      const max = node.props.max ?? 100;
      const step = node.props.step ?? 1;
      const label = node.props.label || formattedContent || 'Range';
      const sliderClass = styleFormat === 'tailwind' ? ' className="w-full accent-indigo-500 cursor-pointer"' : styleFormat === 'scss' ? ' className={styles.slider}' : ' style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}';
      if (targetHook) {
        return `${indent}<div className="slider-control">\n${indent}  <label>${label}: {${stateName}}</label>\n${indent}  <input\n${indent}    type="range"\n${indent}    min={${min}}\n${indent}    max={${max}}\n${indent}    step={${step}}\n${indent}    value={${stateName}}\n${indent}    onChange={(e) => ${setterName}(Number(e.target.value))}${sliderClass}\n${indent}  />\n${indent}</div>`;
      }
      return `${indent}<input type="range" min={${min}} max={${max}}${sliderClass} />`;
    }

    if (node.subtype === 'Checkbox') {
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'isChecked';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const label = node.props.label || formattedContent || 'Checkbox option';
      const labelClass = styleFormat === 'tailwind' ? ' className="flex items-center gap-2 cursor-pointer text-sm text-slate-200"' : styleFormat === 'scss' ? ' className={styles.checkbox}' : ' style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}';
      if (targetHook) {
        return `${indent}<label${labelClass}>\n${indent}  <input type="checkbox" checked={${stateName}} onChange={(e) => ${setterName}(e.target.checked)} />\n${indent}  <span>${label}</span>\n${indent}</label>`;
      }
      return `${indent}<label${labelClass}><input type="checkbox" /> <span>${label}</span></label>`;
    }

    if (node.subtype === 'Form') {
      const isMultiStep = Boolean(node.props.isMultiStep);
      const steps = node.props.steps || ['Step 1', 'Step 2', 'Step 3'];
      const title = node.props.formTitle || formattedContent || 'Form';
      const childNodes = uiNodes.filter((c) => c.parentId === node.id);

      if (isMultiStep) {
        return `${indent}{/* Multi-Step Wizard Form */}\n${indent}<div className="wizard-form-container">\n${indent}  <div className="wizard-steps-header">\n${indent}    {${JSON.stringify(steps)}.map((step, idx) => (\n${indent}      <div key={step} className={\`step-item \${currentStep === idx + 1 ? 'active' : ''}\`}>\n${indent}        <span>{idx + 1}. {step}</span>\n${indent}      </div>\n${indent}    ))}\n${indent}  </div>\n${indent}  <form onSubmit={(e) => { e.preventDefault(); }}>\n${indent}    {/* Fields rendered conditionally per currentStep */}\n${indent}    <div className="wizard-actions">\n${indent}      <button type="button" disabled={currentStep === 1} onClick={() => setCurrentStep(s => s - 1)}>Back</button>\n${indent}      {currentStep < ${steps.length} ? (\n${indent}        <button type="button" onClick={() => setCurrentStep(s => s + 1)}>Next Step</button>\n${indent}      ) : (\n${indent}        <button type="submit">Complete Registration</button>\n${indent}      )}\n${indent}    </div>\n${indent}  </form>\n${indent}</div>`;
      }

      const childrenJSX = childNodes.length > 0
        ? childNodes.map((c) => buildUIJSX(c, indent + '  ')).join('\n')
        : `${indent}  {/* Form fields */}`;
      return `${indent}<form onSubmit={(e) => { e.preventDefault(); console.log('Submitted'); }}>\n${indent}  <h3>${title}</h3>\n${childrenJSX}\n${indent}  <button type="submit">Submit</button>\n${indent}</form>`;
    }

    if (node.subtype === 'Text') {
      if (styleFormat === 'tailwind') {
        return `${indent}<p className="text-sm text-slate-300 leading-relaxed">${formattedContent || 'Text'}</p>`;
      } else if (styleFormat === 'scss') {
        return `${indent}<p className={styles.text}>${formattedContent || 'Text'}</p>`;
      } else {
        return `${indent}<p style={{ fontSize: '${node.props.fontSize || 14}px', color: '#cbd5e1', lineHeight: 1.5 }}>${formattedContent || 'Text'}</p>`;
      }
    }

    if (node.subtype === 'Heading') {
      if (styleFormat === 'tailwind') {
        return `${indent}<h2 className="text-xl font-bold tracking-tight text-slate-100">${formattedContent || 'Heading'}</h2>`;
      } else if (styleFormat === 'scss') {
        return `${indent}<h2 className={styles.heading}>${formattedContent || 'Heading'}</h2>`;
      } else {
        return `${indent}<h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>${formattedContent || 'Heading'}</h2>`;
      }
    }

    if (node.subtype === 'Badge') {
      const hasTransition = hookNodes.some((h) => h.subtype === 'useTransition');
      if (styleFormat === 'tailwind') {
        const badgeClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
        if (hasTransition) {
          return `${indent}<span className="${badgeClass}">\n${indent}  {isPending ? 'Filtering 10,000 items in background...' : '10,000 Catalog Items Synchronized'}\n${indent}</span>`;
        }
        return `${indent}<span className="${badgeClass}">${formattedContent || 'Badge'}</span>`;
      } else if (styleFormat === 'scss') {
        if (hasTransition) {
          return `${indent}<span className={styles.badge}>\n${indent}  {isPending ? 'Filtering 10,000 items in background...' : '10,000 Catalog Items Synchronized'}\n${indent}</span>`;
        }
        return `${indent}<span className={styles.badge}>${formattedContent || 'Badge'}</span>`;
      } else {
        if (hasTransition) {
          return `${indent}<span className="badge">\n${indent}  {isPending ? 'Filtering 10,000 items in background...' : '10,000 Catalog Items Synchronized'}\n${indent}</span>`;
        }
        return `${indent}<span className="badge">${formattedContent || 'Badge'}</span>`;
      }
    }

    if (node.subtype === 'DummyData') {
      const hasTransition = hookNodes.some((h) => h.subtype === 'useTransition');
      const items = JSON.stringify(
        node.props.items || [
          'MacBook Pro 16" M3 Max',
          'MacBook Air 15" M3',
          'Dell XPS 15 OLED',
          'Lenovo ThinkPad X1 Carbon',
          'Sony WH-1000XM5 Wireless Headphones',
        ]
      );
      const queryVar = hasTransition ? 'deferredQuery' : (getTargetHook(node.id)?.props.stateName || 'debouncedQuery');
      const title = node.props.title || '10,000 Products Catalog';
      const containerStyle = hasTransition ? ` style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 150ms ease' }}` : '';
      return `${indent}{/* 10,000 Catalog Items (Concurrent Transition) */}\n${indent}<div className="data-list-card"${containerStyle}>\n${indent}  <div className="data-list-header">\n${indent}    <h4>${title}</h4>\n${indent}    {isPending && <span className="pending-indicator">Filtering 10,000 items in background...</span>}\n${indent}  </div>\n${indent}  {(() => {\n${indent}    const filtered = ${items}.filter((item) =>\n${indent}      item.toLowerCase().includes((${queryVar} || '').toLowerCase())\n${indent}    );\n${indent}    if (filtered.length === 0) {\n${indent}      return (\n${indent}        <div className="empty-state">\n${indent}          <p>No results found for &ldquo;{${queryVar}}&rdquo;</p>\n${indent}        </div>\n${indent}      );\n${indent}    }\n${indent}    return (\n${indent}      <ul className="results-list">\n${indent}        {filtered.map((item) => (\n${indent}          <li key={item}>{item}</li>\n${indent}        ))}\n${indent}      </ul>\n${indent}    );\n${indent}  })()}\n${indent}</div>`;
    }

    if (node.subtype === 'Card' || node.subtype === 'Container') {
      const variant = node.props.variant as string;
      const title = node.props.title || node.label || 'Card';

      if (variant === 'cart') {
        return `${indent}{/* Shopping Cart Items & Discount Summary */}\n${indent}<div className="cart-card">\n${indent}  <h3>Your Shopping Cart</h3>\n${indent}  <p>Items in Cart: {state}</p>\n${indent}  <div className="cart-summary">\n${indent}    <p>10% VIP Discount Applied (useMemo)</p>\n${indent}    <h4>Total: \${memoizedValue.toFixed(2)}</h4>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'themeConsumer') {
        return `${indent}{/* Deep Child Component consuming ThemeContext directly (0 props drilled) */}\n${indent}<div className={\`themed-profile-card \${theme === 'dark' ? 'theme-dark' : 'theme-light'}\`}>\n${indent}  <div className="card-header">\n${indent}    <h4>Alex Rivera</h4>\n${indent}    <span className="badge">useContext(ThemeContext)</span>\n${indent}  </div>\n${indent}  <p>Active Palette: {theme.toUpperCase()} (0 props drilled)</p>\n${indent}</div>`;
      }
      if (variant === 'optimisticProduct') {
        return `${indent}{/* Optimistic Product Showcase (useOptimistic + useTransition) */}\n${indent}<div className="product-showcase-card">\n${indent}  <div className="product-header">\n${indent}    <h3>${title}</h3>\n${indent}    <span className="badge">\${(optimisticItem?.isFav ?? false) ? '❤️ Favorite' : '🤍 Add to Wishlist'}</span>\n${indent}  </div>\n${indent}  <p className="qty-label">Quantity in Bag: {optimisticItem?.qty ?? 1}</p>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-primary" onClick={() => startTransition(async () => {\n${indent}      setOptimisticItem({ isFav: !optimisticItem?.isFav });\n${indent}      await api.toggleFavorite(!optimisticItem?.isFav);\n${indent}    })}>Toggle Favorite</button>\n${indent}    <button className="btn-secondary" onClick={() => startTransition(async () => {\n${indent}      setOptimisticItem({ qty: (optimisticItem?.qty ?? 1) + 1 });\n${indent}      await api.updateQuantity((optimisticItem?.qty ?? 1) + 1);\n${indent}    })}>Add Quantity (+1)</button>\n${indent}  </div>\n${indent}  {isPending && <span className="sync-badge">Syncing with server in background...</span>}\n${indent}</div>`;
      }
      if (variant === 'formActionPipeline') {
        return `${indent}{/* Async Form Action Pipeline (useActionState + useFormStatus) */}\n${indent}<form action={formAction} className="action-pipeline-form">\n${indent}  <h3>${title}</h3>\n${indent}  <input name="email" type="email" placeholder="architect@enterprise.io" required />\n${indent}  {formState?.error && <div className="error-alert">{formState.error}</div>}\n${indent}  <button type="submit" disabled={isFormPending} className="btn-primary">\n${indent}    {isFormPending ? 'Validating on Server...' : 'Submit Action'}\n${indent}  </button>\n${indent}</form>`;
      }
      if (variant === 'deferredSearch') {
        return `${indent}{/* Deferred Search Results Grid (useDeferredValue + useMemo) */}\n${indent}<div className="deferred-search-container">\n${indent}  <div className="grid-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">10,000 Components Synced</span>\n${indent}  </div>\n${indent}  <div className="results-grid" style={{ opacity: query !== deferredQuery ? 0.6 : 1, transition: 'opacity 150ms ease' }}>\n${indent}    {filteredList.map((item) => (\n${indent}      <div key={item.id} className="grid-item">\n${indent}        <strong>{item.name}</strong>\n${indent}        <span>{item.category}</span>\n${indent}      </div>\n${indent}    ))}\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'externalStore') {
        return `${indent}{/* External Store Subscription (useSyncExternalStore) */}\n${indent}<div className="external-store-card">\n${indent}  <h3>${title}</h3>\n${indent}  <p>Live Store Snapshot: <strong>{storeSnapshot?.count ?? 42}</strong> (v{storeSnapshot?.version ?? 1})</p>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-primary" onClick={() => externalStore.mutate(5)}>Mutate External (+5)</button>\n${indent}    <button className="btn-outline" onClick={() => externalStore.reset()}>Reset Store</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'websocketDashboard') {
        return `${indent}{/* Real-Time WebSocket Telemetry (useRef + useReducer + useEffect) */}\n${indent}<div className="websocket-dashboard">\n${indent}  <div className="stream-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge badge-success">● CONNECTED (12ms ping)</span>\n${indent}  </div>\n${indent}  <div className="packet-stream">\n${indent}    {(state?.packets || [\n${indent}      { seq: 104, sensor: 'US-East-Rack-4', temp: 42.1 },\n${indent}      { seq: 105, sensor: 'EU-West-Rack-1', temp: 39.8 },\n${indent}    ]).map((pkt) => (\n${indent}      <div key={pkt.seq} className="packet-row">\n${indent}        <span>{pkt.sensor}</span>\n${indent}        <strong>{pkt.temp}°C</strong>\n${indent}      </div>\n${indent}    ))}\n${indent}  </div>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-danger" onClick={() => dispatch({ type: 'WS_DISCONNECTED' })}>Drop Connection 🔌</button>\n${indent}    <button className="btn-primary" onClick={() => dispatch({ type: 'WS_CONNECTED' })}>Force Reconnect 🔄</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'collabPresence') {
        return `${indent}{/* Collaborative Editor Presence (useReducer) */}\n${indent}<div className="collab-document-card">\n${indent}  <div className="doc-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">Active Peers: {typeof state === 'number' ? state : 3}</span>\n${indent}  </div>\n${indent}  <textarea defaultValue="React hooks enable declarative synchronization with external side-effects." rows={4} />\n${indent}  <div className="button-group">\n${indent}    <button className="btn-secondary" onClick={() => dispatch({ type: 'PEER_TYPING' })}>Simulate Peer Typing</button>\n${indent}    <button className="btn-primary" onClick={() => dispatch({ type: 'PEER_JOINED' })}>+ Simulate Peer Join</button>\n${indent}    <button className="btn-outline" onClick={() => dispatch({ type: 'PEER_LEFT' })}>Disconnect Peer</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'raceController') {
        return `${indent}{/* Network Request Race Controller (useRef + useReducer) */}\n${indent}<div className="race-controller-card">\n${indent}  <div className="race-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge badge-success">✓ Race Guard: ACTIVE</span>\n${indent}  </div>\n${indent}  <div className="committed-display">\n${indent}    <p>Committed State: <strong>{state?.activeResult || 'Initial Stable Payload'}</strong></p>\n${indent}  </div>\n${indent}  <button className="btn-primary" onClick={() => dispatch({ type: 'REQUEST_START' })}>\n${indent}    Trigger Out-Of-Order Race Burst ⚡\n${indent}  </button>\n${indent}</div>`;
      }
      if (variant === 'paginatedGrid') {
        return `${indent}{/* Enterprise Paginated Data Grid (useState + useMemo) */}\n${indent}<div className="paginated-grid-container">\n${indent}  <div className="grid-toolbar">\n${indent}    <input type="text" placeholder="Filter events by keyword..." />\n${indent}    <select defaultValue="ALL">\n${indent}      <option value="ALL">All Severities</option>\n${indent}      <option value="OK">OK</option>\n${indent}      <option value="WARN">WARN</option>\n${indent}      <option value="CRIT">CRIT</option>\n${indent}    </select>\n${indent}  </div>\n${indent}  <table className="data-table">\n${indent}    <thead>\n${indent}      <tr><th>ID</th><th>Severity</th><th>Event Message</th><th>Latency</th></tr>\n${indent}    </thead>\n${indent}    <tbody>\n${indent}      {(paginatedRows || [\n${indent}        { id: 'EV-101', severity: 'OK', msg: 'Auth token renewed', latency: '4ms' },\n${indent}        { id: 'EV-102', severity: 'WARN', msg: 'Disk cache 85% full', latency: '22ms' },\n${indent}        { id: 'EV-103', severity: 'CRIT', msg: 'DB connection pool timeout', latency: '142ms' },\n${indent}      ]).map((row) => (\n${indent}        <tr key={row.id}>\n${indent}          <td>{row.id}</td>\n${indent}          <td><span className={\`badge badge-\${row.severity.toLowerCase()}\`}>{row.severity}</span></td>\n${indent}          <td>{row.msg}</td>\n${indent}          <td>{row.latency}</td>\n${indent}        </tr>\n${indent}      ))}\n${indent}    </tbody>\n${indent}  </table>\n${indent}  <div className="pagination-footer">\n${indent}    <button className="btn-outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>\n${indent}    <span>Page {page} of 100</span>\n${indent}    <button className="btn-outline" onClick={() => setPage((p) => p + 1)}>Next →</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'virtualizedFeed') {
        return `${indent}{/* Virtualized Activity Feed Windowing (useRef + useMemo) */}\n${indent}<div className="virtualized-feed-card">\n${indent}  <div className="feed-header">\n${indent}    <h4>${title}</h4>\n${indent}    <button className="btn-secondary" onClick={() => { viewportRef.current = 5000; }}>Jump to #5,000</button>\n${indent}  </div>\n${indent}  <div className="scroll-window">\n${indent}    {(visibleItems || [\n${indent}      { id: 1, title: 'Item #0 - Kernel Cluster Initialized', time: '00:00:01' },\n${indent}      { id: 2, title: 'Item #1 - Load Balancer Synchronized', time: '00:00:02' },\n${indent}      { id: 3, title: 'Item #2 - Cache Invalidation Flushed', time: '00:00:03' },\n${indent}    ]).map((item) => (\n${indent}      <div key={item.id} className="feed-row">\n${indent}        <span>{item.title}</span>\n${indent}        <span className="timestamp">{item.time}</span>\n${indent}      </div>\n${indent}    ))}\n${indent}  </div>\n${indent}  <p className="window-footer">Rendering 15 of 10,000 active nodes (0 DOM jank)</p>\n${indent}</div>`;
      }
      if (variant === 'dndKanban') {
        return `${indent}{/* Drag & Drop Sprint Board (useReducer) */}\n${indent}<div className="kanban-engine-card">\n${indent}  <div className="kanban-header">\n${indent}    <h3>${title}</h3>\n${indent}    <button className="btn-primary" onClick={() => dispatch({ type: 'ADD_CARD', col: 'Backlog', title: 'New Task' })}>+ Add Card</button>\n${indent}  </div>\n${indent}  <div className="kanban-columns">\n${indent}    {['Backlog', 'Development', 'Production'].map((col) => (\n${indent}      <div key={col} className="kanban-column">\n${indent}        <h4>{col}</h4>\n${indent}        <div className="task-ticket">\n${indent}          <p>Implement {col} Architecture</p>\n${indent}          <button className="btn-xs" onClick={() => dispatch({ type: 'MOVE_CARD', col })}>Move →</button>\n${indent}        </div>\n${indent}      </div>\n${indent}    ))}\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'commandPalette') {
        return `${indent}{/* Keyboard Command Palette (useEffect + useState) */}\n${indent}<div className="command-palette-view">\n${indent}  <div className="palette-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">Press ⌘K or Esc anytime</span>\n${indent}  </div>\n${indent}  <input type="text" placeholder="Search commands, files, or actions..." className="palette-search" />\n${indent}  <ul className="palette-list">\n${indent}    {['Deploy to Production', 'Toggle Dark Theme', 'Export Profiler Log', 'System Settings'].map((cmd, idx) => (\n${indent}      <li key={cmd} className={\`palette-item \${highlightedIndex === idx ? 'highlighted' : ''}\`}>\n${indent}        <span>{cmd}</span>\n${indent}        <kbd>↵</kbd>\n${indent}      </li>\n${indent}    ))}\n${indent}  </ul>\n${indent}</div>`;
      }
      if (variant === 'undoableForm') {
        return `${indent}{/* Undoable Form Editor (useReducer past/present/future) */}\n${indent}<div className="undoable-form-card">\n${indent}  <div className="history-toolbar">\n${indent}    <button className="btn-outline" onClick={() => dispatch({ type: 'UNDO' })}>↩️ Undo</button>\n${indent}    <button className="btn-outline" onClick={() => dispatch({ type: 'REDO' })}>↪️ Redo</button>\n${indent}    <span className="badge">History Stack Active</span>\n${indent}  </div>\n${indent}  <div className="form-fields">\n${indent}    <label>Full Name</label>\n${indent}    <input type="text" defaultValue={state?.present?.name ?? 'Elena Rostova'} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })} />\n${indent}    <label>Role / Title</label>\n${indent}    <input type="text" defaultValue={state?.present?.role ?? 'Principal Architect'} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'role', value: e.target.value })} />\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'multiSourceDashboard') {
        return `${indent}{/* Multi-Source Dashboard (useReducer + Promise.allSettled) */}\n${indent}<div className="multi-source-dashboard">\n${indent}  <div className="hub-header">\n${indent}    <h3>${title}</h3>\n${indent}    <button className="btn-primary" onClick={() => dispatch({ type: 'FETCH_START' })}>Refresh All (allSettled)</button>\n${indent}  </div>\n${indent}  <div className="streams-grid">\n${indent}    {[\n${indent}      { name: 'User Profile API', status: 'READY', latency: '14ms' },\n${indent}      { name: 'Billing Gateway', status: 'DEGRADED', latency: '503ms' },\n${indent}      { name: 'Telemetry Collector', status: 'READY', latency: '8ms' },\n${indent}      { name: 'Push Dispatcher', status: 'READY', latency: '19ms' },\n${indent}    ].map((s) => (\n${indent}      <div key={s.name} className="stream-card">\n${indent}        <h4>{s.name}</h4>\n${indent}        <span className={\`badge badge-\${s.status.toLowerCase()}\`}>{s.status}</span>\n${indent}        <p>Latency: {s.latency}</p>\n${indent}      </div>\n${indent}    ))}\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'requestDedup') {
        return `${indent}{/* Request Deduplication Cache (useRef Map) */}\n${indent}<div className="request-dedup-card">\n${indent}  <div className="dedup-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">1 Network Call for 5 Listeners</span>\n${indent}  </div>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-secondary" onClick={() => inFlightPromises.current.set('key', fetch('/api/data'))}>Trigger 1 Call</button>\n${indent}    <button className="btn-primary" onClick={() => {\n${indent}      for (let i = 0; i < 5; i++) inFlightPromises.current.set('key', fetch('/api/data'));\n${indent}    }}>Burst 5 Concurrent Calls ⚡</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'resourceCacheTtl') {
        return `${indent}{/* TTL Memory Cache with Expiration (useRef Map) */}\n${indent}<div className="ttl-cache-card">\n${indent}  <div className="cache-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge badge-success">Expires in 5s (FRESH)</span>\n${indent}  </div>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-primary" onClick={() => ttlCache.current.get('QUOTE')}>Read Cache (0ms)</button>\n${indent}    <button className="btn-outline" onClick={() => ttlCache.current.delete('QUOTE')}>Force Invalidate 🔄</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'errorBoundaryRecovery') {
        return `${indent}{/* Isolated Error Boundary Matrix (useState health map) */}\n${indent}<div className="error-boundary-matrix">\n${indent}  <div className="matrix-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">3 Isolated Subtrees Online</span>\n${indent}  </div>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-danger" onClick={() => setWidgetHealth((h) => ({ ...h, w2: false }))}>Simulate Crash 💥</button>\n${indent}    <button className="btn-primary" onClick={() => setWidgetHealth({ w1: true, w2: true, w3: true })}>Recover Widget 🔄</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'suspenseStreaming') {
        return `${indent}{/* Suspense Streaming Dashboard (useTransition) */}\n${indent}<div className="suspense-streaming-card">\n${indent}  <div className="stream-header">\n${indent}    <h4>${title}</h4>\n${indent}    <button className="btn-primary" onClick={() => startStreamTransition(() => {})}>Replay Stream 🌊</button>\n${indent}  </div>\n${indent}  <div className="chunks-pipeline">\n${indent}    <div className="chunk">Fast Metrics: Ready (0ms)</div>\n${indent}    <div className="chunk">Analytics: Ready (400ms)</div>\n${indent}    <div className="chunk">AI Insights: Deferred (1200ms)</div>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'serverClientBoundary') {
        return `${indent}{/* Server / Client Component Boundary (useState) */}\n${indent}<div className="server-client-boundary-card">\n${indent}  <div className="boundary-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">Optimal RSC Island (0kb Client JS)</span>\n${indent}  </div>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-primary" onClick={() => console.log('Serialized wire payload')}>Inspect Serialized Wire Payload 🔍</button>\n${indent}    <button className="btn-outline" onClick={() => setBoundaryMode((m) => m === 'optimal' ? 'error' : 'optimal')}>Toggle Boundary Mode</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'optimisticCheckout') {
        return `${indent}{/* Optimistic Checkout Pipeline (useReducer + useOptimistic) */}\n${indent}<div className="optimistic-checkout-card">\n${indent}  <div className="checkout-summary">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">Order Status: {receipt?.status ?? 'Ready to Checkout'}</span>\n${indent}  </div>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-primary" onClick={() => {\n${indent}      setOptimisticReceipt({ status: 'Processing Order...' });\n${indent}      dispatch({ type: 'PLACE_ORDER' });\n${indent}    }}>Place Order ($249.00) ⚡</button>\n${indent}    <button className="btn-outline" onClick={() => dispatch({ type: 'RESET' })}>Reset Cart</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'offlineNotes') {
        return `${indent}{/* Offline-First Notes Application (useRef + useReducer) */}\n${indent}<div className="offline-notes-card">\n${indent}  <div className="notes-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge badge-success">🟢 Network: ONLINE</span>\n${indent}  </div>\n${indent}  <input type="text" placeholder="Title for new note..." />\n${indent}  <div className="button-group">\n${indent}    <button className="btn-primary" onClick={() => dispatch({ type: 'ADD_NOTE' })}>+ Write New Note</button>\n${indent}    <span>Pending Sync: {pendingSyncQueue.current?.length ?? 0} Actions</span>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'notificationSync') {
        return `${indent}{/* Notification Center with Read/Unread Sync (useReducer) */}\n${indent}<div className="notification-center-card">\n${indent}  <div className="notif-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">Unread: 3 Alerts</span>\n${indent}  </div>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-secondary" onClick={() => dispatch({ type: 'MARK_ALL_READ' })}>Mark All as Read</button>\n${indent}    <button className="btn-primary" onClick={() => dispatch({ type: 'PUSH_ALERT' })}>+ Push Event</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'collabCursorTracker') {
        return `${indent}{/* Collaborative Cursor / Presence Tracker (useRef + useEffect rAF) */}\n${indent}<div className="collab-cursor-tracker-card">\n${indent}  <div className="tracker-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">144 Events / 16 Renders (89% Savings)</span>\n${indent}  </div>\n${indent}  <button className="btn-outline" onClick={() => console.log('Toggle 16ms rAF throttle')}>✓ 16ms rAF Throttle</button>\n${indent}</div>`;
      }
      if (variant === 'fileUploadManager') {
        return `${indent}{/* Multipart File Upload Queue (useReducer) */}\n${indent}<div className="file-upload-manager-card">\n${indent}  <div className="upload-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">2 Uploading, 1 Completed</span>\n${indent}  </div>\n${indent}  <div className="button-group">\n${indent}    <button className="btn-primary" onClick={() => dispatch({ type: 'ADD_FILE' })}>+ Upload File</button>\n${indent}    <button className="btn-outline" onClick={() => dispatch({ type: 'PAUSE_UPLOAD' })}>Pause / Resume ▶️</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'featureFlagRuntime') {
        return `${indent}{/* Feature Flag Runtime Engine (useSyncExternalStore) */}\n${indent}<div className="feature-flag-runtime-card">\n${indent}  <div className="flag-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="badge">Flags Synced via useSyncExternalStore</span>\n${indent}  </div>\n${indent}  <div className="flag-controls">\n${indent}    <select defaultValue="General User">\n${indent}      <option value="General User">General User</option>\n${indent}      <option value="Beta Tester">Beta Tester</option>\n${indent}      <option value="Enterprise Admin">Enterprise Admin</option>\n${indent}    </select>\n${indent}    <button className="btn-primary" onClick={() => console.log('Toggle AI Beta')}>Toggle AI Beta Flag</button>\n${indent}  </div>\n${indent}</div>`;
      }
      if (variant === 'performanceObservatory') {
        return `${indent}{/* Production Performance Observatory (useMemo + useCallback) */}\n${indent}<div className="performance-observatory-card">\n${indent}  <div className="hud-header">\n${indent}    <h4>${title}</h4>\n${indent}    <span className="metrics-badge">254 Renders (82ms Frame)</span>\n${indent}  </div>\n${indent}  <div className="optimizations-grid">\n${indent}    <button className="btn-outline" onClick={() => console.log('Toggle Context Splitting')}>Split Context: OFF</button>\n${indent}    <button className="btn-outline" onClick={() => console.log('Toggle useMemo Filter')}>useMemo Filter: OFF</button>\n${indent}    <button className="btn-outline" onClick={() => console.log('Toggle useCallback Handler')}>useCallback Handler: OFF</button>\n${indent}    <button className="btn-outline" onClick={() => console.log('Toggle Isolate Search')}>Isolate Search State: OFF</button>\n${indent}  </div>\n${indent}  <div className="telemetry-view">\n${indent}    <input type="text" placeholder="Search telemetry logs..." />\n${indent}    <p>Monitoring render lifecycles & frame drops</p>\n${indent}  </div>\n${indent}</div>`;
      }

      const childNodes = uiNodes.filter((c) => c.parentId === node.id);
      const cardClass = styleFormat === 'tailwind'
        ? 'p-5 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-md flex flex-col gap-3'
        : styleFormat === 'scss'
        ? 'styles.card'
        : '';
      const cardStyle = styleFormat === 'inline'
        ? ' style={{ padding: "20px", backgroundColor: "#131b2e", border: "1px solid #334155", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}'
        : '';

      if (childNodes.length > 0) {
        const childrenJSX = childNodes.map((c) => buildUIJSX(c, indent + '  ')).join('\n');
        if (styleFormat === 'tailwind') {
          return `${indent}<div className="${cardClass}">\n${indent}  <div className="font-semibold text-slate-200 text-base"><h4>${title}</h4></div>\n${childrenJSX}\n${indent}</div>`;
        } else if (styleFormat === 'scss') {
          return `${indent}<div className={${cardClass}}>\n${indent}  <div className={styles.cardHeader}><h4>${title}</h4></div>\n${childrenJSX}\n${indent}</div>`;
        } else {
          return `${indent}<div className="card"${cardStyle}>\n${indent}  <div className="card-header"><h4>${title}</h4></div>\n${childrenJSX}\n${indent}</div>`;
        }
      }

      if (styleFormat === 'tailwind') {
        return `${indent}<div className="${cardClass}">\n${indent}  <h4 className="font-semibold text-slate-100">${title}</h4>\n${indent}  <p className="text-sm text-slate-300">${formattedContent || 'Card Content'}</p>\n${indent}</div>`;
      } else if (styleFormat === 'scss') {
        return `${indent}<div className={${cardClass}}>\n${indent}  <h4>${title}</h4>\n${indent}  <p>${formattedContent || 'Card Content'}</p>\n${indent}</div>`;
      } else {
        return `${indent}<div className="card"${cardStyle}>\n${indent}  <h4>${title}</h4>\n${indent}  <p>${formattedContent || 'Card Content'}</p>\n${indent}</div>`;
      }
    }

    if (node.subtype === 'Kanban') {
      return `${indent}{/* Interactive Drag-and-Drop Task Kanban Board */}\n${indent}<KanbanBoard\n${indent}  tasks={tasks}\n${indent}  onTaskMove={(taskId, targetCol) => dispatch({ type: 'MOVE_TASK', taskId, targetCol })}\n${indent}/>`;
    }
    return `${indent}<div>${formattedContent}</div>`;
  };

  // Find root UI nodes (those without parentId or whose parent is not in uiNodes)
  const rootNodes = uiNodes.filter((n) => !n.parentId || !uiNodes.some((p) => p.id === n.parentId));

  // Helper to generate JSX for a container group and its nested containers recursively
  const generateGroupJSX = (group: string, indent: string = '    '): string => {
    const groupNodes = uiNodes.filter((n) => n.props?.layoutGroup === group);
    const realGroupNodes = groupNodes.filter((n) => !n.props?.isContainerHolder);
    const firstNode = groupNodes[0];
    const isRow = (firstNode?.props?.containerDirection || 'row') === 'row';
    const isGrid = firstNode?.props?.containerDisplay === 'grid';
    const justify = firstNode?.props?.containerJustify || 'flex-start';
    const align = firstNode?.props?.containerAlign || 'center';
    const gap = firstNode?.props?.containerGap || '12px';
    const wrap = firstNode?.props?.containerWrap || 'wrap';
    const groupTitle = firstNode?.props?.layoutGroupName || `Flex ${isRow ? 'Row' : 'Column'}`;
    const isCard = firstNode?.props?.containerType === 'card';

    // Find any nested container groups inside this container
    const nestedGroupIds: string[] = [];
    uiNodes.forEach((n) => {
      const lg = n.props?.layoutGroup;
      if (lg && lg !== group && n.props?.parentGroup === group && !nestedGroupIds.includes(lg)) {
        nestedGroupIds.push(lg);
      }
    });

    const innerIndent = indent + '  ';

    // Generate ordered children (nested containers and direct leaf nodes according to document sequence)
    type OrderedChild = { index: number; jsx: string };
    const orderedChildren: OrderedChild[] = [];

    for (const nestedGroupId of nestedGroupIds) {
      const firstNestedNodeIndex = uiNodes.findIndex((n) => n.props?.layoutGroup === nestedGroupId);
      orderedChildren.push({
        index: firstNestedNodeIndex >= 0 ? firstNestedNodeIndex : 9999,
        jsx: generateGroupJSX(nestedGroupId, innerIndent),
      });
    }

    for (const child of realGroupNodes) {
      const childWidth = child.props?.flexWidth;
      const childInner = buildUIJSX(child, innerIndent);
      let leafJSX = '';
      if (styleFormat === 'tailwind') {
        const widthClass =
          childWidth === 'flex-1' || !childWidth
            ? 'flex-1 min-w-0 w-full'
            : childWidth === 'full'
            ? 'w-full'
            : childWidth === '1/2'
            ? 'w-full md:w-[calc(50%-8px)]'
            : childWidth === '1/3'
            ? 'w-full md:w-[calc(33.333%-8px)]'
            : childWidth === '1/4'
            ? 'w-full md:w-[calc(25%-8px)]'
            : isRow
            ? 'w-auto'
            : 'w-full';
        leafJSX = `${innerIndent}<div className="${widthClass} flex flex-col">\n${childInner}\n${innerIndent}</div>`;
      } else if (styleFormat === 'scss') {
        const flexClass =
          childWidth === 'flex-1' || !childWidth
            ? 'styles.flex1'
            : childWidth === 'full'
            ? 'styles.wFull'
            : 'styles.flexAuto';
        leafJSX = `${innerIndent}<div className={${flexClass}}>\n${childInner}\n${innerIndent}</div>`;
      } else {
        const styleItems: string[] = [];
        if (childWidth === 'flex-1' || !childWidth) {
          styleItems.push("flex: '1 1 0%'", 'minWidth: 0', "width: '100%'", "display: 'flex'", "flexDirection: 'column'");
        } else if (childWidth === 'full' || childWidth === '100%') {
          styleItems.push("width: '100%'", "display: 'flex'", "flexDirection: 'column'");
        } else if (childWidth === '1/2' || childWidth === '50%') {
          styleItems.push("width: 'calc(50% - 6px)'", "display: 'flex'", "flexDirection: 'column'");
        } else if (childWidth === '1/3' || childWidth === '33.3%') {
          styleItems.push("width: 'calc(33.333% - 8px)'", "display: 'flex'", "flexDirection: 'column'");
        } else if (childWidth === '1/4' || childWidth === '25%') {
          styleItems.push("width: 'calc(25% - 8px)'", "display: 'flex'", "flexDirection: 'column'");
        } else if (childWidth === 'auto') {
          styleItems.push("width: 'auto'", "display: 'flex'", "flexDirection: 'column'");
        } else if (childWidth) {
          styleItems.push(`width: '${childWidth}'`, "display: 'flex'", "flexDirection: 'column'");
        } else if (!isRow) {
          styleItems.push("width: '100%'", "display: 'flex'", "flexDirection: 'column'");
        }
        const styleAttr = styleItems.length > 0 ? ` style={{ ${styleItems.join(', ')} }}` : '';
        leafJSX = `${innerIndent}<div${styleAttr}>\n${childInner}\n${innerIndent}</div>`;
      }

      const nodeIndex = uiNodes.findIndex((n) => n.id === child.id);
      orderedChildren.push({
        index: nodeIndex >= 0 ? nodeIndex : 9999,
        jsx: leafJSX,
      });
    }

    orderedChildren.sort((a, b) => a.index - b.index);
    const childrenJSX = orderedChildren.length === 0
      ? `${innerIndent}{/* Empty Container */}`
      : orderedChildren.map((c) => c.jsx).join('\n');

    if (styleFormat === 'tailwind') {
      const tailwindJustify =
        justify === 'center'
          ? 'justify-center'
          : justify === 'space-between'
          ? 'justify-between'
          : justify === 'space-around'
          ? 'justify-around'
          : justify === 'space-evenly'
          ? 'justify-evenly'
          : justify === 'flex-end'
          ? 'justify-end'
          : 'justify-start';
      const tailwindAlign =
        align === 'center'
          ? 'items-center'
          : align === 'flex-start'
          ? 'items-start'
          : align === 'flex-end'
          ? 'items-end'
          : 'items-stretch';
      const tailwindGap =
        gap === '4px'
          ? 'gap-1'
          : gap === '8px'
          ? 'gap-2'
          : gap === '16px'
          ? 'gap-4'
          : gap === '24px'
          ? 'gap-6'
          : gap === '32px'
          ? 'gap-8'
          : 'gap-3';
      const tailwindWrap = wrap === 'nowrap' ? 'flex-nowrap' : 'flex-wrap';

      if (isGrid) {
        return `${indent}{/* Flex Container: ${groupTitle} */}\n${indent}<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">\n${childrenJSX}\n${indent}</div>`;
      } else if (isCard) {
        return `${indent}{/* Card Container: ${groupTitle} */}\n${indent}<div className="flex ${isRow ? 'flex-row' : 'flex-col'} ${tailwindWrap} ${tailwindAlign} ${tailwindJustify} ${tailwindGap} w-full p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">\n${childrenJSX}\n${indent}</div>`;
      } else {
        return `${indent}{/* Div Wrapper: ${groupTitle} */}\n${indent}<div className="flex ${isRow ? 'flex-row' : 'flex-col'} ${tailwindWrap} ${tailwindAlign} ${tailwindJustify} ${tailwindGap} w-full">\n${childrenJSX}\n${indent}</div>`;
      }
    } else if (styleFormat === 'scss') {
      const groupClass = isGrid
        ? 'styles.gridContainer'
        : isCard
        ? isRow
          ? 'styles.cardRow'
          : 'styles.cardCol'
        : isRow
        ? 'styles.flexRow'
        : 'styles.flexCol';
      return `${indent}{/* Flex Container: ${groupTitle} */}\n${indent}<div className={${groupClass}}>\n${childrenJSX}\n${indent}</div>`;
    } else {
      const styleProps = [
        `display: '${isGrid ? 'grid' : 'flex'}'`,
        isGrid
          ? `gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'`
          : `flexDirection: '${isRow ? 'row' : 'column'}'`,
        `justifyContent: '${justify}'`,
        `alignItems: '${align}'`,
        `flexWrap: '${wrap}'`,
        `gap: '${gap}'`,
        `width: '100%'`,
      ];
      if (isCard) {
        styleProps.push(
          `padding: '20px'`,
          `borderRadius: '12px'`,
          `backgroundColor: '#ffffff'`,
          `border: '1px solid #e2e8f0'`,
          `boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'`
        );
      }
      return `${indent}{/* Flex Container: ${groupTitle} */}\n${indent}<div style={{ ${styleProps.join(', ')} }}>\n${childrenJSX}\n${indent}</div>`;
    }
  };

  // Render root nodes respecting flexbox layoutGroup rows/containers
  const renderedGroups = new Set<string>();
  const renderedBlocks: string[] = [];

  rootNodes.forEach((node) => {
    // Nested containers are emitted inside their parent containers
    if (node.props?.parentGroup) return;
    if (node.props?.isContainerHolder && !node.props?.layoutGroup) return;
    const group = node.props?.layoutGroup;
    if (group) {
      if (!renderedGroups.has(group)) {
        renderedGroups.add(group);
        renderedBlocks.push(generateGroupJSX(group, '    '));
      }
    } else {
      if (!node.props?.isContainerHolder) {
        renderedBlocks.push(buildUIJSX(node, '    '));
      }
    }
  });

  let uiJSX = '';
  if (renderedBlocks.length === 0) {
    uiJSX = '    <div>Add UI components in the builder to generate your interface</div>';
  } else {
    if (styleFormat === 'tailwind') {
      uiJSX = `    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6 max-w-5xl mx-auto">\n${renderedBlocks.join('\n')}\n    </main>`;
    } else if (styleFormat === 'scss') {
      uiJSX = `    <main className={styles.appContainer}>\n${renderedBlocks.join('\n')}\n    </main>`;
    } else {
      uiJSX = `    <main style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f8fafc', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1024px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>\n${renderedBlocks.join('\n')}\n    </main>`;
    }
  }

  const importList = reactHooksUsed.size > 0 ? `, { ${Array.from(reactHooksUsed).join(', ')} }` : '';
  const scssImport = styleFormat === 'scss' ? `import styles from './${appName}.module.scss';\n` : '';
  const contextDef = reactHooksUsed.has('createContext')
    ? `\n// Theme Context Definition\nexport const ThemeContext = createContext({\n  theme: 'dark',\n  toggleTheme: () => {},\n});\n`
    : '';

  const reducerDef = reactHooksUsed.has('useReducer')
    ? `\n// Reducer State Machine Definition\nfunction reducer(state: any, action: { type: string; [key: string]: any }) {\n  switch (action.type) {\n    default:\n      return state;\n  }\n}\n`
    : '';

  const storeDef = reactHooksUsed.has('useSyncExternalStore')
    ? `\n// External Store Singleton\nconst externalStore = {\n  count: 42,\n  version: 1,\n  listeners: new Set<() => void>(),\n  getSnapshot: () => ({ count: externalStore.count, version: externalStore.version }),\n  getServerSnapshot: () => ({ count: externalStore.count, version: externalStore.version }),\n  subscribe: (listener: () => void) => {\n    externalStore.listeners.add(listener);\n    return () => externalStore.listeners.delete(listener);\n  },\n  mutate: (delta: number) => {\n    externalStore.count += delta;\n    externalStore.version += 1;\n    externalStore.listeners.forEach((l) => l());\n  },\n  reset: () => {\n    externalStore.count = 42;\n    externalStore.version += 1;\n    externalStore.listeners.forEach((l) => l());\n  },\n};\n`
    : '';

  return `import React${importList} from 'react';
${scssImport}${contextDef}${reducerDef}${storeDef}
export function ${appName}() {
${hookDeclarations.join('\n\n')}

  return (
${uiJSX}
  );
}
`;
}

/**
 * Generates companion SCSS Module code (e.g. App.module.scss)
 */
export function generateScssCode(nodes: PlaygroundNode[], appName: string = 'App'): string {
  return `/* ${appName}.module.scss - Generated by Antigravity React Hooks Playground */

// Design Tokens & Colors
$bg-primary: #0b0f19;
$bg-surface: #131b2e;
$bg-surface-elevated: #1e293b;
$border-color: #334155;
$accent-primary: #6366f1;
$accent-hover: #4f46e5;
$text-primary: #f8fafc;
$text-secondary: #94a3b8;
$radius-md: 8px;
$radius-lg: 12px;

.appContainer {
  min-height: 100vh;
  background-color: $bg-primary;
  color: $text-primary;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1024px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// Flexbox & Grid Container Layouts (Pure Unstyled Wrappers by Default)
.flexRow {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.flexCol {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

// Styled Card Containers (White / Surface Background)
.cardRow {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.cardCol {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.gridContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  width: 100%;
}

// Child Sizing Modifiers (Auto-fill equal space)
.flex1 {
  flex: 1 1 0%;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.wFull {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.flexAuto {
  width: auto;
}

// Interactive Components
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  background-color: $accent-primary;
  color: #fff;
  border: none;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background-color: $accent-hover;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.input {
  width: 100%;
  padding: 10px 14px;
  background-color: rgba($bg-surface-elevated, 0.8);
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  font-size: 14px;
  outline: none;
  transition: border-color 150ms ease;

  &:focus {
    border-color: $accent-primary;
    box-shadow: 0 0 0 2px rgba($accent-primary, 0.25);
  }
}

.switch, .checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: $text-primary;
}

.slider {
  width: 100%;
  accent-color: $accent-primary;
  cursor: pointer;
}

.card {
  padding: 20px;
  background-color: $bg-surface;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);

  .cardHeader {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }
}

.heading {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: $text-primary;
  margin: 0;
}

.text {
  font-size: 14px;
  line-height: 1.6;
  color: $text-secondary;
  margin: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba($accent-primary, 0.15);
  color: lighten($accent-primary, 15%);
  border: 1px solid rgba($accent-primary, 0.3);
}
`;
}
