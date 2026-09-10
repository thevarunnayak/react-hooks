import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import {
  Play,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  FileCode,
  CheckCircle2,
  Code2,
  AlertTriangle,
} from 'lucide-react';

const CODE_SNIPPETS: Record<string, { label: string; lang: string; code: string; simulatedOutput: string[] }> = {
  javascript: {
    label: 'JavaScript (Async Backoff & Log)',
    lang: 'javascript',
    code: `// Interactive JavaScript Sandbox
function calculateStats(items) {
  const sum = items.reduce((acc, n) => acc + n, 0);
  const avg = sum / items.length;
  console.log("Processing items:", items);
  console.log("Calculated Average:", avg.toFixed(2));
  return { sum, avg, count: items.length };
}

const metrics = calculateStats([14, 28, 42, 56, 70, 84]);
console.info("Metrics Computed:", JSON.stringify(metrics));
return metrics;`,
    simulatedOutput: [
      '[SANDBOX] Executing JAVASCRIPT runtime...',
      '[LOG] Processing items: [14, 28, 42, 56, 70, 84]',
      '[LOG] Calculated Average: 49.00',
      '[INFO] Metrics Computed: {"sum":294,"avg":49,"count":6}',
      '[RETURN] => {"sum":294,"avg":49,"count":6}',
      '[SUCCESS] Execution finished successfully.',
    ],
  },
  typescript: {
    label: 'TypeScript (React 19 Generic Hook)',
    lang: 'typescript',
    code: `// TypeScript generic cache processor
interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
}

function processCache<T>(key: string, data: T): CacheEntry<T> {
  const entry: CacheEntry<T> = {
    key,
    data,
    timestamp: Date.now()
  };
  console.log(\`[CACHE-SET] Key: "\${key}" | Timestamp: \${entry.timestamp}\`);
  return entry;
}

const userSession = processCache("user_session_01", {
  username: "alex_dev",
  role: "Lead Architect",
  permissions: ["read", "write", "deploy"]
});

console.info("User Session Active:", userSession.data.username);
return userSession;`,
    simulatedOutput: [
      '[SANDBOX] Executing TYPESCRIPT runtime...',
      '[CACHE-SET] Key: "user_session_01" | Timestamp: Active',
      '[INFO] User Session Active: alex_dev',
      '[SUCCESS] Ready for consumption across client components.',
    ],
  },
  css: {
    label: 'CSS (Compositor Grid Height Animation)',
    lang: 'css',
    code: `.accordion-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.accordion-panel.is-expanded {
  grid-template-rows: 1fr;
}

.accordion-content {
  overflow: hidden;
  will-change: transform, opacity;
}`,
    simulatedOutput: [
      '[CSS-PARSER] Analyzing stylesheets & keyframes...',
      '[CSSOM] Successfully parsed 3 rule block(s).',
      '  → Rule #1: .accordion-panel',
      '  → Rule #2: .accordion-panel.is-expanded',
      '  → Rule #3: .accordion-content',
      '[COMPOSITOR] Syntax verified with 0 warnings.',
    ],
  },
  json: {
    label: 'JSON (Microfrontend Manifest)',
    lang: 'json',
    code: `{
  "name": "@enterprise/auth-module",
  "version": "2.4.0",
  "type": "module",
  "shared": {
    "react": { "singleton": true, "requiredVersion": "^19.0.0" },
    "react-dom": { "singleton": true, "requiredVersion": "^19.0.0" }
  },
  "exposes": {
    "./AuthButton": "./src/components/AuthButton.tsx",
    "./useSession": "./src/hooks/useSession.ts"
  },
  "metadata": {
    "buildTarget": "es2024",
    "compression": "brotli"
  }
}`,
    simulatedOutput: [
      '[JSON-VALIDATOR] Valid JSON structure parsed successfully.',
      '[SCHEMA] Root type: object',
      '[SIZE] 382 characters formatted.',
      '[KEYS] Found 5 top-level attributes: name, version, type, shared, exposes...',
    ],
  },
};

const THEMES: Record<string, { label: string; bg: string; text: string; gutterBg: string; lineNum: string; border: string }> = {
  light: {
    label: 'Clean Light',
    bg: 'var(--bg-surface)',
    text: 'var(--text-primary)',
    gutterBg: 'var(--bg-surface-elevated)',
    lineNum: 'var(--text-muted)',
    border: 'var(--border-default)',
  },
  midnight: {
    label: 'Midnight Slate',
    bg: '#0f172a',
    text: '#e2e8f0',
    gutterBg: '#1e293b',
    lineNum: 'rgba(255, 255, 255, 0.35)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  emerald: {
    label: 'Emerald Matrix',
    bg: '#041d15',
    text: '#a7f3d0',
    gutterBg: '#022c22',
    lineNum: 'rgba(52, 211, 153, 0.4)',
    border: 'rgba(52, 211, 153, 0.2)',
  },
  cyberpunk: {
    label: 'Cyberpunk Neon',
    bg: '#1a0d24',
    text: '#f472b6',
    gutterBg: '#2e1040',
    lineNum: 'rgba(236, 72, 153, 0.4)',
    border: 'rgba(236, 72, 153, 0.25)',
  },
};

export const CodeEditorLab: React.FC = () => {
  // Check default theme from DOM if light
  const isDocLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const [activeSnippetKey, setActiveSnippetKey] = useState<string>('javascript');
  const [themeKey, setThemeKey] = useState<string>(isDocLight ? 'light' : 'midnight');
  const [code, setCode] = useState<string>(CODE_SNIPPETS.javascript.code);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outputLogs, setOutputLogs] = useState<string[]>(CODE_SNIPPETS.javascript.simulatedOutput);
  const [copied, setCopied] = useState<boolean>(false);
  const [executionStats, setExecutionStats] = useState<{ exitCode: number; duration: number }>({
    exitCode: 0,
    duration: 8,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Responsive state for tablet & mobile
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 880 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 880);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentSnippet = CODE_SNIPPETS[activeSnippetKey];
  const currentTheme = THEMES[themeKey] || THEMES.midnight;

  // Sync theme if document attribute changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const mode = document.documentElement.getAttribute('data-theme');
      if (mode === 'light' && themeKey === 'midnight') {
        setThemeKey('light');
      } else if (mode === 'dark' && themeKey === 'light') {
        setThemeKey('midnight');
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [themeKey]);

  // Sync code on snippet change
  const handleSnippetChange = (key: string) => {
    setActiveSnippetKey(key);
    setCode(CODE_SNIPPETS[key].code);
    setOutputLogs(CODE_SNIPPETS[key].simulatedOutput);
  };

  // Synchronize textarea scroll with line number gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Handle Tab keypress to insert 2 spaces instead of unfocusing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const updated = code.substring(0, start) + '  ' + code.substring(end);
      setCode(updated);

      // Restore cursor position after inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Live compiler & runtime sandbox evaluator
  const handleRunCode = () => {
    setIsRunning(true);
    const logs: string[] = [];
    const startTime = performance.now();

    try {
      if (currentSnippet.lang === 'json') {
        const parsed = JSON.parse(code);
        logs.push('[JSON-VALIDATOR] Valid JSON structure parsed successfully.');
        logs.push(`[SCHEMA] Root type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
        logs.push(`[SIZE] ${JSON.stringify(parsed).length} characters formatted.`);
        if (typeof parsed === 'object' && parsed !== null) {
          const keys = Object.keys(parsed);
          logs.push(`[KEYS] Found ${keys.length} top-level attributes: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
        }
        setOutputLogs(logs);
        setExecutionStats({ exitCode: 0, duration: Math.max(1, Math.round(performance.now() - startTime)) });
      } else if (currentSnippet.lang === 'css') {
        logs.push('[CSS-PARSER] Analyzing stylesheets & keyframes...');
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          throw new Error(`Mismatched CSS curly braces: ${openBraces} open vs ${closeBraces} closed.`);
        }
        const rules = code.split('}').filter((r) => r.trim().length > 0);
        logs.push(`[CSSOM] Successfully parsed ${rules.length} rule block(s).`);
        rules.forEach((rule, i) => {
          const selector = rule.split('{')[0]?.trim();
          if (selector) logs.push(`  → Rule #${i + 1}: ${selector}`);
        });
        logs.push('[COMPOSITOR] Syntax verified with 0 warnings.');
        setOutputLogs(logs);
        setExecutionStats({ exitCode: 0, duration: Math.max(1, Math.round(performance.now() - startTime)) });
      } else {
        // JS / TS Execution
        logs.push(`[SANDBOX] Executing ${currentSnippet.lang.toUpperCase()} runtime...`);

        // Strip lightweight TS syntax
        const executable = code
          .replace(/export\s+interface\s+[\s\S]*?\{[\s\S]*?\}/g, '')
          .replace(/interface\s+[\s\S]*?\{[\s\S]*?\}/g, '')
          .replace(/export\s+type\s+[\s\S]*?;/g, '')
          .replace(/type\s+[\s\S]*?;/g, '')
          .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
          .replace(/export\s+/g, '')
          .replace(/<[A-Za-z0-9,\s]+>(?=\()/g, '')
          .replace(/:\s*[A-Za-z0-9<>[\]|&,\s]+(?=[,)=;{])/g, '');

        const customConsole = {
          log: (...args: any[]) =>
            logs.push(`[LOG] ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')}`),
          info: (...args: any[]) =>
            logs.push(`[INFO] ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')}`),
          warn: (...args: any[]) =>
            logs.push(`[WARN] ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')}`),
          error: (...args: any[]) =>
            logs.push(`[ERROR] ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')}`),
        };

        const runFn = new Function('console', executable);
        const result = runFn(customConsole);

        if (result !== undefined) {
          logs.push(`[RETURN] => ${typeof result === 'object' ? JSON.stringify(result) : String(result)}`);
        }

        if (logs.length === 1) {
          logs.push('[SUCCESS] Source executed cleanly with 0 runtime errors.');
        } else {
          logs.push('[SUCCESS] Execution finished successfully.');
        }

        setOutputLogs(logs);
        setExecutionStats({ exitCode: 0, duration: Math.max(1, Math.round(performance.now() - startTime)) });
      }
    } catch (err: any) {
      logs.push(`[ERROR] ${err.name || 'RuntimeError'}: ${err.message || String(err)}`);
      setOutputLogs(logs);
      setExecutionStats({ exitCode: 1, duration: Math.max(1, Math.round(performance.now() - startTime)) });
    } finally {
      setIsRunning(false);
    }
  };

  // Copy code
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card with elevated zIndex so dropdowns float over canvas */}
      <Card variant="glass" padding="md" style={{ position: 'relative', zIndex: 60 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                }}
              >
                <Code2 size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Interactive Code Editor & Compiler Sandbox
              </h3>
              <Badge variant="primary">{currentSnippet.lang.toUpperCase()}</Badge>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Real runtime code compilation, synchronized line numbers, Tab indentation, syntax theme switcher, and light/dark mode.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', width: '100%' }}>
            {/* Snippet Selector with higher local z-index */}
            <div style={{ flex: isCompact ? '1 1 200px' : '0 1 280px', minWidth: 160, position: 'relative', zIndex: 30 }}>
              <CustomSelect
                fullWidth
                value={activeSnippetKey}
                onChange={handleSnippetChange}
                options={Object.entries(CODE_SNIPPETS).map(([key, item]) => ({
                  value: key,
                  label: item.label,
                }))}
              />
            </div>

            {/* Theme Selector with secondary local z-index */}
            <div style={{ flex: isCompact ? '1 1 140px' : '0 1 160px', minWidth: 130, position: 'relative', zIndex: 20 }}>
              <CustomSelect
                fullWidth
                value={themeKey}
                onChange={setThemeKey}
                options={Object.entries(THEMES).map(([key, item]) => ({
                  value: key,
                  label: item.label,
                }))}
              />
            </div>

            <Button
              size="sm"
              variant="primary"
              icon={<Play size={14} />}
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw size={14} />}
              onClick={() => {
                setCode(currentSnippet.code);
                setOutputLogs(currentSnippet.simulatedOutput);
                setExecutionStats({ exitCode: 0, duration: 8 });
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Editor & Console Split View */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : 'minmax(380px, 1fr) 340px',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Code Editor Box */}
        <Card
          variant="glass"
          padding="none"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: currentTheme.bg,
            border: `1px solid ${currentTheme.border}`,
            display: 'flex',
            flexDirection: 'column',
            height: 480,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Editor Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              backgroundColor: currentTheme.gutterBg,
              borderBottom: `1px solid ${currentTheme.border}`,
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCode size={14} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {activeSnippetKey}.{activeSnippetKey === 'typescript' ? 'ts' : activeSnippetKey === 'javascript' ? 'js' : activeSnippetKey}
              </span>
            </div>
            <span>{lineCount} lines • UTF-8 • 2 spaces</span>
          </div>

          {/* Editor Body: Line Numbers + Textarea */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
            {/* Synchronized Line Numbers Gutter */}
            <div
              ref={gutterRef}
              style={{
                width: 48,
                backgroundColor: currentTheme.gutterBg,
                borderRight: `1px solid ${currentTheme.border}`,
                padding: '14px 0',
                color: currentTheme.lineNum,
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                textAlign: 'right',
                userSelect: 'none',
                overflowY: 'hidden',
                flexShrink: 0,
              }}
            >
              {[...Array(lineCount)].map((_, i) => (
                <div key={i} style={{ paddingRight: 12 }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Editable Code Canvas */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              style={{
                flex: 1,
                padding: '14px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                color: currentTheme.text,
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                outline: 'none',
                resize: 'none',
                overflow: 'auto',
                whiteSpace: 'pre',
                tabSize: 2,
              }}
            />
          </div>
        </Card>

        {/* Right Column: Execution Output Console */}
        <Card
          variant="glass"
          padding="none"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-code)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            height: isCompact ? 340 : 480,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Console Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={14} style={{ color: executionStats.exitCode === 0 ? '#10b981' : '#ef4444' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Execution Sandbox
              </span>
            </div>
            <Badge variant={executionStats.exitCode === 0 ? 'success' : 'danger'}>
              {executionStats.exitCode === 0 ? 'STATUS: OK' : 'STATUS: ERR'}
            </Badge>
          </div>

          {/* Console Output Logs */}
          <div
            style={{
              flex: 1,
              padding: '14px 16px',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              backgroundColor: 'var(--bg-code)',
            }}
          >
            {outputLogs.map((log, index) => {
              const isError = log.includes('[ERROR]') || log.includes('failed') || log.includes('Error:');
              const isSuccess = log.includes('[SUCCESS]') || log.includes('passed');
              const isWarn = log.includes('[WARN]');
              const isReturn = log.includes('[RETURN]');

              return (
                <div
                  key={index}
                  style={{
                    color: isError
                      ? '#ef4444'
                      : isSuccess
                      ? '#10b981'
                      : isWarn
                      ? '#f59e0b'
                      : isReturn
                      ? 'var(--accent-primary)'
                      : 'var(--text-secondary)',
                    fontWeight: isReturn || isError ? 600 : 400,
                  }}
                >
                  {log}
                </div>
              );
            })}
          </div>

          {/* Console Footer */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              Exit Code: <strong style={{ color: executionStats.exitCode === 0 ? '#10b981' : '#ef4444' }}>{executionStats.exitCode}</strong>
            </span>
            <span>Duration: <strong>{executionStats.duration}ms</strong></span>
          </div>
        </Card>
      </div>

      {/* Concept Architecture Footer */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Live Sandbox Execution Engine
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Executes user-edited JavaScript and TypeScript with intercepted <code>console.*</code> logging, runtime error bounds, and execution duration benchmarks.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Cascading Z-Index Hierarchy
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Elevates top controls card (<code>z-index: 60</code>) and tiers snippet & theme dropdown containers to eliminate overlaps and menu clipping.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Clean Light Theme Integration
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Adds dedicated Clean Light theme matching system variables with high contrast gutter line numbers and accessible console output colors.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
