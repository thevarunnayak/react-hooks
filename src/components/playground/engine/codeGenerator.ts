import { PlaygroundNode, PlaygroundConnection } from '../../../types/playground';

export function generateReactCode(
  nodes: PlaygroundNode[],
  connections: PlaygroundConnection[],
  appName: string = 'App'
): string {
  // 1. Identify Hook / Logic nodes
  const hookNodes = nodes.filter((n) => n.type === 'logic');
  const uiNodes = nodes.filter((n) => n.type === 'ui');

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

  // Build JSX tree
  const buildUIJSX = (node: PlaygroundNode, indent: string = '    '): string => {
    const eventHandler = eventMap.get(node.id);
    const content = node.props.content || '';

    // Interpolate state variables: {{count}} -> {count}
    const formattedContent = content.replace(/\{\{(\w+)\}\}/g, '{$1}');

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

    if (node.subtype === 'Button') {
      const clickProp = eventHandler ? ` onClick={${eventHandler}}` : '';
      const variantClass = node.props.variant ? ` className="btn-${node.props.variant}"` : '';
      let btnBody = formattedContent || 'Button';
      if (node.props.actionType === 'toggle') {
        const boundHook = getTargetHook(node.id);
        if (boundHook && boundHook.props.stateName === 'isRunning') {
          btnBody = `{isRunning ? 'Pause' : 'Start'}`;
        }
      }
      return `${indent}<button${variantClass}${clickProp}>\n${indent}  ${btnBody}\n${indent}</button>`;
    }

    if (node.subtype === 'Input') {
      const hasTransition = hookNodes.some((h) => h.subtype === 'useTransition');
      const inputType = node.props.inputType || 'text';
      const placeholder = node.props.placeholder || 'Type here...';
      if (hasTransition) {
        return `${indent}<input\n${indent}  type="${inputType}"\n${indent}  placeholder="${placeholder}"\n${indent}  value={inputQuery}\n${indent}  onChange={(e) => {\n${indent}    setInputQuery(e.target.value);\n${indent}    startTransition(() => {\n${indent}      setDeferredQuery(e.target.value);\n${indent}    });\n${indent}  }}\n${indent}/>`;
      }
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'text';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      if (targetHook) {
        return `${indent}<input\n${indent}  type="${inputType}"\n${indent}  placeholder="${placeholder}"\n${indent}  value={${stateName}}\n${indent}  onChange={(e) => ${setterName}(e.target.value)}\n${indent}/>`;
      }
      return `${indent}<input type="${inputType}" placeholder="${placeholder}" />`;
    }

    if (node.subtype === 'Switch') {
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'isOpen';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const label = node.props.label || formattedContent || 'Toggle Mode';
      if (targetHook) {
        return `${indent}<label className="switch">\n${indent}  <span>${label}</span>\n${indent}  <input\n${indent}    type="checkbox"\n${indent}    role="switch"\n${indent}    checked={${stateName}}\n${indent}    onChange={(e) => ${setterName}(e.target.checked)}\n${indent}  />\n${indent}</label>`;
      }
      return `${indent}<label className="switch"><span>${label}</span><input type="checkbox" role="switch" /></label>`;
    }

    if (node.subtype === 'Dropdown') {
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'selected';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const options = JSON.stringify(node.props.options || ['Light', 'Dark', 'System']);
      if (targetHook) {
        return `${indent}{/* Custom Dropdown Select */}\n${indent}<CustomDropdown\n${indent}  value={${stateName}}\n${indent}  options={${options}}\n${indent}  onChange={(val) => ${setterName}(val)}\n${indent}/>`;
      }
      return `${indent}<CustomDropdown options={${options}} />`;
    }

    if (node.subtype === 'Slider') {
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'value';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const min = node.props.min ?? 0;
      const max = node.props.max ?? 100;
      const step = node.props.step ?? 1;
      const label = node.props.label || formattedContent || 'Range';
      if (targetHook) {
        return `${indent}<div className="slider-control">\n${indent}  <label>${label}: {${stateName}}</label>\n${indent}  <input\n${indent}    type="range"\n${indent}    min={${min}}\n${indent}    max={${max}}\n${indent}    step={${step}}\n${indent}    value={${stateName}}\n${indent}    onChange={(e) => ${setterName}(Number(e.target.value))}\n${indent}  />\n${indent}</div>`;
      }
      return `${indent}<input type="range" min={${min}} max={${max}} />`;
    }

    if (node.subtype === 'Checkbox') {
      const targetHook = getTargetHook(node.id);
      const stateName = targetHook?.props.stateName || 'isChecked';
      const setterName = targetHook?.props.setterName || `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`;
      const label = node.props.label || formattedContent || 'Checkbox option';
      if (targetHook) {
        return `${indent}<label className="checkbox">\n${indent}  <input type="checkbox" checked={${stateName}} onChange={(e) => ${setterName}(e.target.checked)} />\n${indent}  <span>${label}</span>\n${indent}</label>`;
      }
      return `${indent}<label className="checkbox"><input type="checkbox" /> <span>${label}</span></label>`;
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
      return `${indent}<p style={{ fontSize: '${node.props.fontSize || 14}px' }}>${formattedContent || 'Text'}</p>`;
    }

    if (node.subtype === 'Heading') {
      return `${indent}<h2 style={{ fontSize: '20px', fontWeight: 600 }}>${formattedContent || 'Heading'}</h2>`;
    }

    if (node.subtype === 'Badge') {
      const hasTransition = hookNodes.some((h) => h.subtype === 'useTransition');
      if (hasTransition) {
        return `${indent}<span className="badge">\n${indent}  {isPending ? 'Filtering 10,000 items in background...' : '10,000 Catalog Items Synchronized'}\n${indent}</span>`;
      }
      return `${indent}<span className="badge">${formattedContent || 'Badge'}</span>`;
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
      if (node.props.variant === 'cart') {
        return `${indent}{/* Shopping Cart Items & Discount Summary */}\n${indent}<div className="cart-card">\n${indent}  <h3>Your Shopping Cart</h3>\n${indent}  <p>Items in Cart: {state}</p>\n${indent}  <div className="cart-summary">\n${indent}    <p>10% VIP Discount Applied (useMemo)</p>\n${indent}    <h4>Total: \${memoizedValue.toFixed(2)}</h4>\n${indent}  </div>\n${indent}</div>`;
      }
      if (node.props.variant === 'themeConsumer') {
        return `${indent}{/* Deep Child Component consuming ThemeContext directly (0 props drilled) */}\n${indent}<div className={\`themed-profile-card \${theme === 'dark' ? 'theme-dark' : 'theme-light'}\`}>\n${indent}  <div className="card-header">\n${indent}    <h4>Alex Rivera</h4>\n${indent}    <span className="badge">useContext(ThemeContext)</span>\n${indent}  </div>\n${indent}  <p>Active Palette: {theme.toUpperCase()} (0 props drilled)</p>\n${indent}</div>`;
      }
      const childNodes = uiNodes.filter((c) => c.parentId === node.id);
      if (childNodes.length > 0) {
        const childrenJSX = childNodes.map((c) => buildUIJSX(c, indent + '  ')).join('\n');
        return `${indent}<div className="card">\n${childrenJSX}\n${indent}</div>`;
      }
      return `${indent}<div className="card">\n${indent}  ${formattedContent || 'Card Content'}\n${indent}</div>`;
    }

    if (node.subtype === 'Kanban') {
      return `${indent}{/* Interactive Drag-and-Drop Task Kanban Board */}\n${indent}<KanbanBoard\n${indent}  tasks={tasks}\n${indent}  onTaskMove={(taskId, targetCol) => dispatch({ type: 'MOVE_TASK', taskId, targetCol })}\n${indent}/>`;
    }

    return `${indent}<div>${formattedContent}</div>`;
  };

  // Find root UI nodes (those without parentId or whose parent is not in uiNodes)
  const rootNodes = uiNodes.filter((n) => !n.parentId || !uiNodes.some((p) => p.id === n.parentId));

  let uiJSX = '';
  if (rootNodes.length === 0) {
    uiJSX = '    <div>Add UI components in the builder to generate your interface</div>';
  } else if (rootNodes.length === 1) {
    uiJSX = buildUIJSX(rootNodes[0], '    ');
  } else {
    uiJSX = `    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>\n${rootNodes
      .map((r) => buildUIJSX(r, '      '))
      .join('\n')}\n    </div>`;
  }

  const importList = reactHooksUsed.size > 0 ? `, { ${Array.from(reactHooksUsed).join(', ')} }` : '';
  const contextDef = reactHooksUsed.has('createContext')
    ? `\n// Theme Context Definition\nexport const ThemeContext = createContext({\n  theme: 'dark',\n  toggleTheme: () => {},\n});\n`
    : '';

  return `import React${importList} from 'react';
${contextDef}
export function ${appName}() {
${hookDeclarations.join('\n\n')}

  return (
${uiJSX}
  );
}
`;
}
