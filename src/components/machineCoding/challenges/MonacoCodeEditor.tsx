import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { typescript } from 'monaco-editor';
import { ChallengeEditorPreferences } from '../../../types/machineCodingChallenge';

// Pre-configure loader with bundled monaco instance so it works 100% offline without CDN
loader.config({ monaco });

// Configure TypeScript compiler options and diagnostics so JSX and React are supported without false errors
const configureTypeScriptDefaults = (ts: any) => {
  if (!ts) return;

  if (ts.typescriptDefaults) {
    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget?.Latest ?? 99,
      allowNonTsExtensions: true,
      moduleResolution: ts.ModuleResolutionKind?.NodeJs ?? 2,
      module: ts.ModuleKind?.ESNext ?? 99,
      noEmit: true,
      esModuleInterop: true,
      jsx: ts.JsxEmit?.ReactJSX ?? 4,
      reactNamespace: 'React',
      allowJs: true,
      checkJs: false,
      allowSyntheticDefaultImports: true,
    });

    ts.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
      diagnosticCodesToIgnore: [
        2307, // Cannot find module 'react' or 'lucide-react'
        2792, // Cannot find module 'react'. Did you mean to set the 'moduleResolution' option to 'nodenext'...
        2686, // 'React' refers to a UMD global
        7016, // Could not find a declaration file for module
        7026, // JSX element implicitly has type 'any'
        2604, // JSX element type does not have any construct or call signatures
        17004, // Cannot use JSX unless the '--jsx' flag is provided
        2741, // Property is missing in type
        2322, // Type is not assignable to type
        2339, // Property does not exist on type
        80001, // File is a CommonJS module
        80006, // This syntax requires an imported helper
      ],
    });
  }

  if (ts.javascriptDefaults) {
    ts.javascriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget?.Latest ?? 99,
      allowNonTsExtensions: true,
      jsx: ts.JsxEmit?.ReactJSX ?? 4,
      allowJs: true,
      checkJs: false,
      allowSyntheticDefaultImports: true,
    });

    ts.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
      diagnosticCodesToIgnore: [
        2307, 2792, 2686, 7016, 7026, 2604, 17004, 2741, 2322, 2339, 80001, 80006
      ],
    });
  }
};

// Apply to monaco global and top-level typescript import
if ((monaco as any).languages && !(monaco as any).languages.typescript) {
  (monaco as any).languages.typescript = (monaco as any).typescript || typescript;
}
configureTypeScriptDefaults(typescript);
configureTypeScriptDefaults((monaco as any).typescript);
configureTypeScriptDefaults((monaco as any).languages?.typescript);

if (typescript && typescript.typescriptDefaults) {

  typescript.typescriptDefaults.addExtraLib(
    `
    declare module 'react' {
      export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
      export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
      export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
      export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
      export function useRef<T>(initialValue: T): { current: T };
      export function useRef<T = undefined>(): { current: T | undefined };
      export function useReducer<R extends (...args: any[]) => any, I>(reducer: R, initialArg: I, init?: (arg: I) => any): any;
      export function useContext<T>(context: any): T;
      export function createContext<T>(defaultValue: T): any;
      export interface CSSProperties { [key: string]: any; }
      export interface ChangeEvent<T = any> { target: T; currentTarget: T; }
      export interface MouseEvent<T = any> { target: T; preventDefault(): void; stopPropagation(): void; }
      export interface FormEvent<T = any> { preventDefault(): void; }
      export interface KeyboardEvent<T = any> { key: string; preventDefault(): void; }
      export type FC<P = {}> = (props: P) => any;
      export type ComponentType<P = {}> = (props: P) => any;
      export type ReactNode = any;
      export type ReactElement = any;
      const React: any;
      export default React;
    }
    declare module 'react-dom/client' {
      export function createRoot(container: any): { render(children: any): void; unmount(): void; };
    }
    declare module 'lucide-react' {
      export const [key: string]: any;
    }
    declare global {
      namespace JSX {
        interface IntrinsicElements {
          button: {
            type?: 'button' | 'submit' | 'reset';
            disabled?: boolean;
            onClick?: (event: any) => void;
            className?: string;
            style?: any;
            id?: string;
            children?: any;
            [key: string]: any;
          };
          div: {
            className?: string;
            style?: any;
            id?: string;
            onClick?: (event: any) => void;
            children?: any;
            [key: string]: any;
          };
          span: {
            className?: string;
            style?: any;
            id?: string;
            onClick?: (event: any) => void;
            children?: any;
            [key: string]: any;
          };
          input: {
            type?: string;
            value?: any;
            defaultValue?: any;
            placeholder?: string;
            onChange?: (event: any) => void;
            disabled?: boolean;
            checked?: boolean;
            className?: string;
            style?: any;
            [key: string]: any;
          };
          form: {
            onSubmit?: (event: any) => void;
            className?: string;
            style?: any;
            children?: any;
            [key: string]: any;
          };
          p: { className?: string; style?: any; children?: any; [key: string]: any; };
          h1: { className?: string; style?: any; children?: any; [key: string]: any; };
          h2: { className?: string; style?: any; children?: any; [key: string]: any; };
          h3: { className?: string; style?: any; children?: any; [key: string]: any; };
          h4: { className?: string; style?: any; children?: any; [key: string]: any; };
          label: { htmlFor?: string; className?: string; style?: any; children?: any; [key: string]: any; };
          select: { value?: any; onChange?: (event: any) => void; disabled?: boolean; className?: string; children?: any; [key: string]: any; };
          option: { value?: any; disabled?: boolean; children?: any; [key: string]: any; };
          textarea: { value?: any; onChange?: (event: any) => void; placeholder?: string; rows?: number; disabled?: boolean; className?: string; [key: string]: any; };
          ul: { className?: string; style?: any; children?: any; [key: string]: any; };
          ol: { className?: string; style?: any; children?: any; [key: string]: any; };
          li: { className?: string; style?: any; children?: any; [key: string]: any; };
          table: { className?: string; style?: any; children?: any; [key: string]: any; };
          thead: { children?: any; [key: string]: any; };
          tbody: { children?: any; [key: string]: any; };
          tr: { children?: any; [key: string]: any; };
          th: { children?: any; [key: string]: any; };
          td: { children?: any; [key: string]: any; };
          img: { src?: string; alt?: string; className?: string; [key: string]: any; };
          a: { href?: string; onClick?: (event: any) => void; className?: string; children?: any; [key: string]: any; };
          section: { className?: string; style?: any; children?: any; [key: string]: any; };
          header: { className?: string; style?: any; children?: any; [key: string]: any; };
          footer: { className?: string; style?: any; children?: any; [key: string]: any; };
          nav: { className?: string; style?: any; children?: any; [key: string]: any; };
          main: { className?: string; style?: any; children?: any; [key: string]: any; };
          [elemName: string]: any;
        }
        interface Element extends any {}
      }
    }
    `,
    'ts:filename/react.d.ts'
  );
}

// Global registry for React autocomplete and snippets
let reactLanguageFeaturesRegistered = false;

const COMMON_HTML_TAGS = [
  { tag: 'button', detail: '<button>...</button>', snippet: 'button>$0</button>', doc: 'HTML button element with click handling' },
  { tag: 'div', detail: '<div>...</div>', snippet: 'div>$0</div>', doc: 'Generic container element' },
  { tag: 'span', detail: '<span>...</span>', snippet: 'span>$0</span>', doc: 'Inline text container' },
  { tag: 'input', detail: '<input type="..." />', snippet: 'input type="${1:text}" value={${2}} onChange={${3:e => {}}} />', doc: 'Interactive form input control' },
  { tag: 'form', detail: '<form onSubmit=...>...</form>', snippet: 'form onSubmit={${1:handleSubmit}}>$0</form>', doc: 'HTML Form element' },
  { tag: 'p', detail: '<p>...</p>', snippet: 'p>$0</p>', doc: 'Paragraph text element' },
  { tag: 'label', detail: '<label>...</label>', snippet: 'label>$0</label>', doc: 'Caption for UI control' },
  { tag: 'select', detail: '<select>...</select>', snippet: 'select value={${1:val}} onChange={${2:e => {}}}>\n\t<option value="${3}">${4}</option>\n</select>', doc: 'Drop-down select menu' },
  { tag: 'option', detail: '<option value=...>...</option>', snippet: 'option value="${1:value}">$0</option>', doc: 'Option in select dropdown' },
  { tag: 'textarea', detail: '<textarea ... />', snippet: 'textarea value={${1:val}} onChange={${2:e => {}}} placeholder="${3}" />', doc: 'Multi-line text input' },
  { tag: 'ul', detail: '<ul>...</ul>', snippet: 'ul>\n\t<li>$0</li>\n</ul>', doc: 'Unordered bullet list' },
  { tag: 'ol', detail: '<ol>...</ol>', snippet: 'ol>\n\t<li>$0</li>\n</ol>', doc: 'Numbered ordered list' },
  { tag: 'li', detail: '<li>...</li>', snippet: 'li>$0</li>', doc: 'List item' },
  { tag: 'h1', detail: '<h1>...</h1>', snippet: 'h1>$0</h1>', doc: 'Top-level heading' },
  { tag: 'h2', detail: '<h2>...</h2>', snippet: 'h2>$0</h2>', doc: 'Sub-heading level 2' },
  { tag: 'h3', detail: '<h3>...</h3>', snippet: 'h3>$0</h3>', doc: 'Heading level 3' },
  { tag: 'h4', detail: '<h4>...</h4>', snippet: 'h4>$0</h4>', doc: 'Heading level 4' },
  { tag: 'table', detail: '<table>...</table>', snippet: 'table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th>$0</th>\n\t\t</tr>\n\t</thead>\n\ttbody>\n\t\t<tr>\n\t\t\t<td></td>\n\t\t</tr>\n\t</tbody>\n</table>', doc: 'Table element' },
  { tag: 'tr', detail: '<tr>...</tr>', snippet: 'tr>$0</tr>', doc: 'Table row' },
  { tag: 'th', detail: '<th>...</th>', snippet: 'th>$0</th>', doc: 'Table header cell' },
  { tag: 'td', detail: '<td>...</td>', snippet: 'td>$0</td>', doc: 'Table data cell' },
  { tag: 'thead', detail: '<thead>...</thead>', snippet: 'thead>$0</thead>', doc: 'Table head group' },
  { tag: 'tbody', detail: '<tbody>...</tbody>', snippet: 'tbody>$0</tbody>', doc: 'Table body group' },
  { tag: 'a', detail: '<a href=...>...</a>', snippet: 'a href="${1:#}">$0</a>', doc: 'Hyperlink anchor' },
  { tag: 'img', detail: '<img src=... />', snippet: 'img src="${1:url}" alt="${2:image}" />', doc: 'Image embed' },
  { tag: 'section', detail: '<section>...</section>', snippet: 'section>$0</section>', doc: 'Generic standalone section' },
  { tag: 'header', detail: '<header>...</header>', snippet: 'header>$0</header>', doc: 'Header container' },
  { tag: 'footer', detail: '<footer>...</footer>', snippet: 'footer>$0</footer>', doc: 'Footer container' },
  { tag: 'nav', detail: '<nav>...</nav>', snippet: 'nav>$0</nav>', doc: 'Navigation container' },
  { tag: 'main', detail: '<main>...</main>', snippet: 'main>$0</main>', doc: 'Main content container' },
];

const COMMON_PROPS = [
  { prop: 'onClick', snippet: 'onClick={${1:() => {}}}$0', doc: 'Click event handler' },
  { prop: 'onChange', snippet: 'onChange={${1:(e) => {}}}$0', doc: 'Change event handler' },
  { prop: 'onSubmit', snippet: 'onSubmit={${1:(e) => { e.preventDefault(); }}}$0', doc: 'Form submit event handler' },
  { prop: 'className', snippet: 'className="${1}"$0', doc: 'CSS class name' },
  { prop: 'style', snippet: 'style={{ ${1} }}$0', doc: 'Inline CSS styles object' },
  { prop: 'disabled', snippet: 'disabled={${1:false}}$0', doc: 'Disable the element' },
  { prop: 'type', snippet: 'type="${1|button,submit,reset|}"$0', doc: 'Button/input type' },
  { prop: 'value', snippet: 'value={${1}}$0', doc: 'Controlled input/element value' },
  { prop: 'placeholder', snippet: 'placeholder="${1}"$0', doc: 'Input placeholder text' },
  { prop: 'id', snippet: 'id="${1}"$0', doc: 'Element unique ID' },
  { prop: 'key', snippet: 'key={${1}}$0', doc: 'React reconciliation key' },
  { prop: 'ref', snippet: 'ref={${1}}$0', doc: 'React DOM ref' },
  { prop: 'autoFocus', snippet: 'autoFocus', doc: 'Automatically focus on mount' },
];

const REACT_HOOKS = [
  {
    name: 'useState',
    snippet: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialState});$0',
    doc: 'React state hook',
  },
  {
    name: 'useEffect',
    snippet: 'useEffect(() => {\n\t$0\n}, [${1}]);',
    doc: 'React side-effect hook',
  },
  {
    name: 'useRef',
    snippet: 'const ${1:ref} = useRef(${2:null});$0',
    doc: 'React mutable ref hook',
  },
  {
    name: 'useMemo',
    snippet: 'const ${1:memoized} = useMemo(() => {\n\treturn ${2};\n}, [${3}]);$0',
    doc: 'React memoized value hook',
  },
  {
    name: 'useCallback',
    snippet: 'const ${1:callback} = useCallback((${2}) => {\n\t$0\n}, [${3}]);$0',
    doc: 'React memoized callback hook',
  },
  {
    name: 'useReducer',
    snippet: 'const [${1:state}, dispatch] = useReducer(${2:reducer}, ${3:initialState});$0',
    doc: 'React reducer hook',
  },
];

function registerReactLanguageFeatures(monacoInstance: typeof monaco) {
  if (reactLanguageFeaturesRegistered) return;
  reactLanguageFeaturesRegistered = true;

  const languages = ['typescript', 'javascript'];

  for (const lang of languages) {
    // 1. Enter key formatting between open and close tag: <tag>|</tag> + Enter
    monacoInstance.languages.setLanguageConfiguration(lang, {
      onEnterRules: [
        {
          beforeText: /<([_a-zA-Z0-9]+)(?:\s+[^>]*?)?>$/,
          afterText: /^<\/[_a-zA-Z0-9]+>/,
          action: { indentAction: monacoInstance.languages.IndentAction.IndentOutdent },
        },
      ],
    });

    // 2. Rich autocomplete provider for JSX tags, attributes, and hooks
    monacoInstance.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['<', ' ', '.', '/', ':'],
      provideCompletionItems: (model, position) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const textUntilPosition = lineContent.substring(0, position.column - 1);
        const word = model.getWordUntilPosition(position);
        const range = new monacoInstance.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        );

        const suggestions: monaco.languages.CompletionItem[] = [];

        // Check if typing immediately after '<' e.g. `<b` or `<`
        const textBeforeWord = lineContent.substring(0, word.startColumn - 1).trimEnd();
        const hasOpenAngle = textBeforeWord.endsWith('<');

        // Check if inside an opening tag e.g. `<button |` or `<div className="x" |`
        const isInOpenTag = /<[a-zA-Z][a-zA-Z0-9_.-]*(?:\s+[^>]*?)?$/.test(textUntilPosition) && !hasOpenAngle;

        if (hasOpenAngle) {
          // Provide HTML/JSX tag suggestions when starting with '<'
          COMMON_HTML_TAGS.forEach((t, idx) => {
            // Full element snippet: <button>...</button>
            suggestions.push({
              label: t.tag,
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: t.snippet,
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: t.detail,
              documentation: t.doc,
              range,
              sortText: `0_${String(idx).padStart(2, '0')}_${t.tag}`,
            });

            // Plain tag name: button
            suggestions.push({
              label: `${t.tag} (tag)`,
              kind: monacoInstance.languages.CompletionItemKind.Property,
              insertText: t.tag,
              detail: `<${t.tag}> tag name`,
              range,
              sortText: `1_${String(idx).padStart(2, '0')}_${t.tag}`,
            });
          });
        } else if (isInOpenTag) {
          // Provide JSX attribute suggestions inside tags
          COMMON_PROPS.forEach((p, idx) => {
            suggestions.push({
              label: p.prop,
              kind: monacoInstance.languages.CompletionItemKind.Property,
              insertText: p.snippet,
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: `prop: ${p.prop}`,
              documentation: p.doc,
              range,
              sortText: `0_${String(idx).padStart(2, '0')}_${p.prop}`,
            });
          });
        } else {
          // Normal context: suggest tags with '<', common hooks, etc.
          COMMON_HTML_TAGS.forEach((t, idx) => {
            suggestions.push({
              label: `<${t.tag}>`,
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: `<${t.snippet}`,
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: t.detail,
              documentation: t.doc,
              range,
              sortText: `3_${String(idx).padStart(2, '0')}_${t.tag}`,
            });
          });

          // Also suggest plain word matches e.g. user typed "button" without '<'
          COMMON_HTML_TAGS.forEach((t, idx) => {
            suggestions.push({
              label: t.tag,
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: `<${t.snippet}`,
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: t.detail,
              documentation: t.doc,
              range,
              sortText: `4_${String(idx).padStart(2, '0')}_${t.tag}`,
            });
          });

          // React Hooks suggestions
          REACT_HOOKS.forEach((h, idx) => {
            suggestions.push({
              label: h.name,
              kind: monacoInstance.languages.CompletionItemKind.Function,
              insertText: h.snippet,
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: `React Hook: ${h.name}`,
              documentation: h.doc,
              range,
              sortText: `2_${String(idx).padStart(2, '0')}_${h.name}`,
            });
          });
        }

        return { suggestions };
      },
    });
  }
}

export interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  fileName?: string;
  preferences: ChallengeEditorPreferences;
  onRunTests: () => void;
  onSubmit: () => void;
  onSaveDraft?: () => void;
  editorRefOut?: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
  errorMarkers?: Array<{
    line: number;
    message: string;
    severity?: 'error' | 'warning';
  }>;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  onChange,
  language = 'typescript',
  fileName = 'App.tsx',
  preferences,
  onRunTests,
  onSubmit,
  onSaveDraft,
  editorRefOut,
  errorMarkers = [],
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Initialize Apple-inspired themes and TypeScript compiler options once
  const handleEditorWillMount = (monacoInstance: typeof monaco) => {
    // Ensure languages.typescript is aliased and configured
    if ((monacoInstance as any).languages && !(monacoInstance as any).languages.typescript) {
      (monacoInstance as any).languages.typescript = (monacoInstance as any).typescript || typescript;
    }
    const ts = (monacoInstance as any).typescript || (monacoInstance.languages as any)?.typescript || typescript;
    if (ts) {
      configureTypeScriptDefaults(ts);
    }

    // Register rich React & HTML auto-complete, snippet providers, and indentation rules
    registerReactLanguageFeatures(monacoInstance);

    // 1. Apple Dark (Midnight Slate) Theme
    monacoInstance.editor.defineTheme('apple-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'string', foreground: '86efac' },
        { token: 'number', foreground: 'fcd34d' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'function', foreground: '60a5fa' },
        { token: 'identifier', foreground: 'e2e8f0' },
        { token: 'delimiter', foreground: '94a3b8' },
      ],
      colors: {
        'editor.background': '#0c0e14',
        'editor.foreground': '#e2e8f0',
        'editorCursor.foreground': '#38bdf8',
        'editor.lineHighlightBackground': '#141824',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editor.selectionBackground': '#2563eb40',
        'editor.selectionHighlightBackground': '#38bdf820',
        'editorBracketMatch.background': '#3b82f630',
        'editorBracketMatch.border': '#3b82f6',
        'editorGutter.background': '#0c0e14',
        'editorWidget.background': '#181b24',
        'editorWidget.border': '#334155',
        'editorSuggestWidget.background': '#181b24',
        'editorSuggestWidget.border': '#334155',
        'editorSuggestWidget.selectedBackground': '#2563eb30',
        'scrollbarSlider.background': '#ffffff15',
        'scrollbarSlider.hoverBackground': '#ffffff25',
        'scrollbarSlider.activeBackground': '#ffffff35',
      },
    });

    // 6. Apple Light (Clean Crisp Light) Theme
    monacoInstance.editor.defineTheme('apple-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'd97706' },
        { token: 'type', foreground: '0284c7' },
        { token: 'function', foreground: '2563eb' },
        { token: 'identifier', foreground: '0f172a' },
        { token: 'delimiter', foreground: '64748b' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editorCursor.foreground': '#2563eb',
        'editor.lineHighlightBackground': '#f8fafc',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#0f172a',
        'editor.selectionBackground': '#bfdbfe',
        'editor.selectionHighlightBackground': '#dbeafe',
        'editorBracketMatch.background': '#dbeafe',
        'editorBracketMatch.border': '#3b82f6',
        'editorGutter.background': '#ffffff',
        'editorWidget.background': '#ffffff',
        'editorWidget.border': '#e2e8f0',
        'editorSuggestWidget.background': '#ffffff',
        'editorSuggestWidget.border': '#e2e8f0',
        'editorSuggestWidget.selectedBackground': '#eff6ff',
        'scrollbarSlider.background': '#00000015',
        'scrollbarSlider.hoverBackground': '#00000025',
        'scrollbarSlider.activeBackground': '#00000035',
      },
    });
  };

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    if (editorRefOut) {
      editorRefOut.current = editor;
    }

    // Set active theme
    monacoInstance.editor.setTheme(preferences.theme);

    // Clear any initial typescript markers that might have been queued
    const model = editor.getModel();
    if (model) {
      monacoInstance.editor.setModelMarkers(model, 'typescript', []);
    }

    // Zero-tolerance filter: strip any false-positive TS semantic squigglies (module 'react', --jsx flag, etc.)
    let isFiltering = false;
    const markersDisposable = monacoInstance.editor.onDidChangeMarkers((uris: readonly monaco.Uri[]) => {
      if (isFiltering) return;
      const currentModel = editor.getModel();
      if (!currentModel) return;
      if (!uris.some((u: monaco.Uri) => u.toString() === currentModel.uri.toString())) return;

      const currentMarkers = monacoInstance.editor.getModelMarkers({ resource: currentModel.uri });
      const tsMarkers = currentMarkers.filter((m: monaco.editor.IMarker) => m.owner === 'typescript');
      if (tsMarkers.length === 0) return;

      const unwantedCodes = new Set([2307, 2792, 17004, 2686, 7016, 7026, 2604, 2741, 2322, 2339, 80001, 80006]);
      const hasBadMarkers = tsMarkers.some(
        (m: monaco.editor.IMarker) =>
          unwantedCodes.has(Number(m.code)) ||
          m.message.includes("Cannot find module 'react'") ||
          m.message.includes("Cannot use JSX unless the '--jsx' flag") ||
          m.message.includes("moduleResolution")
      );

      if (hasBadMarkers) {
        isFiltering = true;
        try {
          const allowedMarkers = tsMarkers.filter(
            (m: monaco.editor.IMarker) =>
              !unwantedCodes.has(Number(m.code)) &&
              !m.message.includes("Cannot find module 'react'") &&
              !m.message.includes("Cannot use JSX unless the '--jsx' flag") &&
              !m.message.includes("moduleResolution")
          );
          monacoInstance.editor.setModelMarkers(currentModel, 'typescript', allowedMarkers);
        } finally {
          isFiltering = false;
        }
      }
    });

    // HTML / SVG and JSX elements metadata for precise auto-closing
    const KNOWN_HTML_SVG_TAGS = new Set([
      'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote',
      'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist',
      'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
      'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head',
      'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label',
      'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript',
      'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'portal', 'pre',
      'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'search', 'section', 'select',
      'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table',
      'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr',
      'track', 'u', 'ul', 'var', 'video', 'wbr',
      // SVG tags
      'svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'polygon', 'text', 'tspan',
      'defs', 'clippath', 'mask', 'pattern', 'marker', 'lineargradient', 'radialgradient',
      'stop', 'use', 'symbol', 'foreignobject'
    ]);

    const VOID_HTML_ELEMENTS = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);

    // React custom components start with uppercase, or HTML/SVG built-in tag names
    const isRealJsxTagName = (name: string): boolean => {
      if (!name) return false;
      if (/^[A-Z][a-zA-Z0-9_]*$/.test(name)) return true;
      return KNOWN_HTML_SVG_TAGS.has(name.toLowerCase());
    };

    // Valid JSX opening context preceding '<'
    const isValidJsxPrefix = (prefix: string): boolean => {
      const trimmed = prefix.trimEnd();
      // Indented at line start
      if (!trimmed) return true;
      // Must end with a token that legitimately precedes JSX:
      // return, default, (, [, {, ,, :, ?, =, =>, &&, ||, >, !
      return (
        /(?:return|default)$/.test(trimmed) ||
        /[([{,:=?&|!>]$/.test(trimmed)
      );
    };

    const STATEMENT_KEYWORDS_REGEX = /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|default|class|import|export)\b/;

    // Auto-Close JSX/HTML Tags when user types '>' or '</'
    const contentDisposable = editor.onDidChangeModelContent((event) => {
      if (event.isFlush) return;

      for (const change of event.changes) {
        // 1. User typed '>' -> Auto-close opening tag e.g. <button> -> <button>|</button>
        // STRICT CHECK: Never trigger on comparison operators like if (count > 0) or for (let i = 0; i < len; i++)
        if (change.text === '>') {
          const currentModel = editor.getModel();
          if (!currentModel) continue;
          const pos = editor.getPosition();
          if (!pos) continue;

          const lineContent = currentModel.getLineContent(pos.lineNumber);
          const textBefore = lineContent.substring(0, pos.column - 1);
          const textAfter = lineContent.substring(pos.column - 1);

          // Must end with '>' and not self-closing '/>' or comparison/arrow '=>'
          if (!textBefore.endsWith('>') || textBefore.endsWith('/>') || textBefore.endsWith('=>')) continue;

          let matchedTagName: string | null = null;

          // Check if there is a '<' on the current line
          const lastLtIndex = textBefore.lastIndexOf('<');
          if (lastLtIndex !== -1) {
            const prefix = textBefore.substring(0, lastLtIndex);
            const tagCandidate = textBefore.substring(lastLtIndex); // e.g. `<button className="btn">`

            if (isValidJsxPrefix(prefix)) {
              // Extract tag name: must immediately follow '<' (no space)
              const tagMatch = tagCandidate.match(/^<([a-zA-Z][a-zA-Z0-9_.-]*)([\s\S]*?)>$/);
              if (tagMatch) {
                const candidateTag = tagMatch[1];
                const attrText = tagMatch[2];

                // Attributes must not contain semicolons or statement keywords
                if (
                  isRealJsxTagName(candidateTag) &&
                  !attrText.includes(';') &&
                  !STATEMENT_KEYWORDS_REGEX.test(attrText)
                ) {
                  matchedTagName = candidateTag;
                }
              }
            }
          } else if (pos.lineNumber > 1) {
            // Multi-line JSX opening tag: check up to 8 lines back
            // If any intervening line contains semicolons or statement keywords, abort!
            let foundStartLine = -1;
            let startLineLtIndex = -1;

            for (let lineNum = pos.lineNumber - 1; lineNum >= Math.max(1, pos.lineNumber - 8); lineNum--) {
              const prevLine = currentModel.getLineContent(lineNum);
              if (prevLine.includes(';') || STATEMENT_KEYWORDS_REGEX.test(prevLine)) {
                break; // Crossed into normal JS statements, cannot be JSX opening tag
              }
              const ltIdx = prevLine.lastIndexOf('<');
              if (ltIdx !== -1) {
                foundStartLine = lineNum;
                startLineLtIndex = ltIdx;
                break;
              }
            }

            if (foundStartLine !== -1) {
              const startLineText = currentModel.getLineContent(foundStartLine);
              const prefix = startLineText.substring(0, startLineLtIndex);

              if (isValidJsxPrefix(prefix)) {
                const fullBlock = currentModel.getValueInRange({
                  startLineNumber: foundStartLine,
                  startColumn: startLineLtIndex + 1,
                  endLineNumber: pos.lineNumber,
                  endColumn: pos.column,
                });

                const multiMatch = fullBlock.match(/^<([a-zA-Z][a-zA-Z0-9_.-]*)([\s\S]*?)>$/);
                if (multiMatch) {
                  const candidateTag = multiMatch[1];
                  const attrText = multiMatch[2];
                  if (
                    isRealJsxTagName(candidateTag) &&
                    !attrText.includes(';') &&
                    !STATEMENT_KEYWORDS_REGEX.test(attrText)
                  ) {
                    matchedTagName = candidateTag;
                  }
                }
              }
            }
          }

          if (!matchedTagName) continue;
          if (VOID_HTML_ELEMENTS.has(matchedTagName.toLowerCase())) continue;

          const closingTag = `</${matchedTagName}>`;
          // Don't duplicate if closing tag already immediately follows cursor
          if (textAfter.trimStart().startsWith(closingTag)) continue;

          // Insert closing tag right after '>'
          editor.executeEdits('auto-close-tag', [
            {
              range: new monacoInstance.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
              text: closingTag,
              forceMoveMarkers: true,
            },
          ]);

          // Keep cursor positioned right between <tag> and </tag>
          editor.setPosition(pos);
        }

        // 2. User typed '/' after '<' (i.e. '</') -> Complete matching unclosed tag
        if (change.text === '/') {
          const currentModel = editor.getModel();
          if (!currentModel) continue;
          const pos = editor.getPosition();
          if (!pos) continue;

          const lineContent = currentModel.getLineContent(pos.lineNumber);
          const textBefore = lineContent.substring(0, pos.column - 1);
          if (!textBefore.endsWith('</')) continue;

          // Search backwards for the closest unclosed opening tag
          const docText = currentModel.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: pos.lineNumber,
            endColumn: pos.column - 2,
          });

          const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9_.-]*)(?:\s+[^<>]*?)?(\/?)>/g;
          const stack: string[] = [];

          let m;
          while ((m = tagRegex.exec(docText)) !== null) {
            const fullTag = m[0];
            const tName = m[1];
            // Skip non-JSX identifiers, comparisons containing semicolons, or void elements
            if (!isRealJsxTagName(tName) || fullTag.includes(';') || VOID_HTML_ELEMENTS.has(tName.toLowerCase())) {
              continue;
            }

            const isSelfClosing = fullTag.endsWith('/>') || m[2] === '/';
            const isClosing = fullTag.startsWith('</');

            if (isSelfClosing) continue;

            if (isClosing) {
              if (stack.length > 0 && stack[stack.length - 1].toLowerCase() === tName.toLowerCase()) {
                stack.pop();
              }
            } else {
              stack.push(tName);
            }
          }

          if (stack.length > 0) {
            const matchingTag = stack[stack.length - 1];
            editor.executeEdits('auto-close-slash-tag', [
              {
                range: new monacoInstance.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
                text: `${matchingTag}>`,
                forceMoveMarkers: true,
              },
            ]);
            editor.setPosition(new monacoInstance.Position(pos.lineNumber, pos.column + matchingTag.length + 1));
          }
        }
      }
    });

    editor.onDidDispose(() => {
      markersDisposable.dispose();
      contentDisposable.dispose();
    });

    // Keyboard Shortcuts inside Monaco
    // Cmd + Enter -> Run Public Tests
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
      onRunTests();
    });

    // Cmd + Shift + Enter -> Submit Challenge
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Enter,
      () => {
        onSubmit();
      }
    );

    // Cmd + S -> Save Draft
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      onSaveDraft?.();
    });

    // Focus editor on mount
    editor.focus();
  };

  // Update error/warning markers dynamically
  useEffect(() => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    if (errorMarkers.length === 0) {
      monaco.editor.setModelMarkers(model, 'challenge-errors', []);
      return;
    }

    const markers: monaco.editor.IMarkerData[] = errorMarkers.map((err) => ({
      startLineNumber: err.line,
      startColumn: 1,
      endLineNumber: err.line,
      endColumn: 120,
      message: err.message,
      severity:
        err.severity === 'warning'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Error,
    }));

    monaco.editor.setModelMarkers(model, 'challenge-errors', markers);
  }, [errorMarkers]);

  // Update theme when preference changes
  useEffect(() => {
    monaco.editor.setTheme(preferences.theme);
  }, [preferences.theme]);

  // Model path: ensures .tsx extension is recognized for JSX support
  const modelPath = fileName ? `file:///${fileName}` : 'file:///App.tsx';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: preferences.theme === 'apple-dark' ? '#0c0e14' : '#ffffff',
      }}
      className="monaco-code-editor-container"
    >
      <Editor
        height="100%"
        width="100%"
        language={language}
        path={modelPath}
        value={code}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={(val) => onChange(val || '')}
        theme={preferences.theme}
        options={{
          fontSize: preferences.fontSize,
          lineHeight: Math.round(preferences.fontSize * 1.55),
          fontFamily: "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontLigatures: true,
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          snippetSuggestions: 'top',
          suggest: {
            showWords: true,
            showSnippets: true,
            showKeywords: true,
            showFunctions: true,
            showClasses: true,
            showProperties: true,
            preview: true,
            insertMode: 'insert',
          },
          minimap: {
            enabled: preferences.minimap,
            scale: 1,
            showSlider: 'mouseover',
          },
          wordWrap: preferences.wordWrap,
          tabSize: preferences.tabSize,
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: preferences.autoClosingBrackets,
          autoClosingQuotes: 'always',
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: false,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          padding: { top: 10, bottom: 12 },
          fixedOverflowWidgets: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
        loading={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Initializing IDE Environment...
          </div>
        }
      />
    </div>
  );
};
