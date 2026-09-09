import React, { useState } from 'react';
import { Code2, Copy, Check, Download, FileCode, Palette, Sparkles, FileText } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Tooltip } from '../../ui/Tooltip';
import { t } from '../../../i18n/i18n';

export interface CodePanelProps {
  code?: string;
  appName?: string;
  tailwindCode?: string;
  scssCode?: string;
  scssFileCode?: string;
  inlineCode?: string;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  appName = 'App',
  tailwindCode,
  scssCode,
  scssFileCode,
  inlineCode,
}) => {
  const [styleFormat, setStyleFormat] = useState<'tailwind' | 'scss' | 'inline'>('tailwind');
  const [scssActiveFile, setScssActiveFile] = useState<'tsx' | 'scss'>('tsx');
  const [copied, setCopied] = useState(false);

  // Compute active display code and active filename
  const activeTailwind = tailwindCode || code || '';
  const activeScssTsx = scssCode || code || '';
  const activeScssFile = scssFileCode || `/* ${appName}.module.scss */\n.appContainer { min-height: 100vh; padding: 24px; }`;
  const activeInline = inlineCode || code || '';

  let displayedCode = '';
  let activeFileName = `${appName}.tsx`;
  let fileMime = 'text/typescript';

  if (styleFormat === 'tailwind') {
    displayedCode = activeTailwind;
    activeFileName = `${appName}.tsx`;
    fileMime = 'text/typescript';
  } else if (styleFormat === 'scss') {
    if (scssActiveFile === 'scss') {
      displayedCode = activeScssFile;
      activeFileName = `${appName}.module.scss`;
      fileMime = 'text/x-scss';
    } else {
      displayedCode = activeScssTsx;
      activeFileName = `${appName}.tsx`;
      fileMime = 'text/typescript';
    }
  } else {
    displayedCode = activeInline;
    activeFileName = `${appName}.tsx`;
    fileMime = 'text/typescript';
  }

  const lineCount = displayedCode.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([displayedCode], { type: fileMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        padding: 'clamp(8px, 2vw, var(--space-4))',
        gap: 'clamp(6px, 1.5vw, var(--space-3))',
      }}
      className="code-panel"
    >
      {/* Header & Controls Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Left: Title & Style Format Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code2 size={16} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }} className="hide-mobile">
              {t('playground.code.title')}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-app)',
              padding: '2px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              gap: '2px',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
            <button
              type="button"
              onClick={() => setStyleFormat('tailwind')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                backgroundColor: styleFormat === 'tailwind' ? 'var(--accent-primary)' : 'transparent',
                color: styleFormat === 'tailwind' ? '#fff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: styleFormat === 'tailwind' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={12} />
              <span>Tailwind<span className="hide-mobile"> CSS</span></span>
            </button>

            <button
              type="button"
              onClick={() => setStyleFormat('scss')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                backgroundColor: styleFormat === 'scss' ? 'var(--accent-primary)' : 'transparent',
                color: styleFormat === 'scss' ? '#fff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: styleFormat === 'scss' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Palette size={12} />
              <span>SCSS<span className="hide-mobile"> Modules</span></span>
            </button>

            <button
              type="button"
              onClick={() => setStyleFormat('inline')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                backgroundColor: styleFormat === 'inline' ? 'var(--accent-primary)' : 'transparent',
                color: styleFormat === 'inline' ? '#fff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: styleFormat === 'inline' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <FileCode size={12} />
              <span>Inline<span className="hide-mobile"> Styles</span></span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} className="hide-mobile">
            {lineCount} lines • {activeFileName}
          </span>

          <Tooltip content={t('playground.code.copyTooltip')} placement="bottom">
            <Button
              size="xs"
              variant="secondary"
              icon={copied ? <Check size={12} style={{ color: 'var(--accent-success)' }} /> : <Copy size={12} />}
              onClick={handleCopy}
            >
              {copied ? t('playground.code.copiedBtn') : t('playground.code.copyBtn')}
            </Button>
          </Tooltip>

          <Tooltip content={t('playground.code.downloadTooltip')} placement="bottom">
            <Button size="xs" variant="ghost" icon={<Download size={12} />} onClick={handleDownload}>
              {t('playground.code.exportBtn')}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* SCSS Companion Sub-Tabs (if SCSS Modules selected) */}
      {styleFormat === 'scss' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Files:</span>
          <button
            type="button"
            onClick={() => setScssActiveFile('tsx')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              backgroundColor: scssActiveFile === 'tsx' ? 'var(--bg-surface)' : 'transparent',
              color: scssActiveFile === 'tsx' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: scssActiveFile === 'tsx' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <FileCode size={12} style={{ color: 'var(--accent-primary)' }} />
            <span>{appName}.tsx</span>
          </button>
          <button
            type="button"
            onClick={() => setScssActiveFile('scss')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              backgroundColor: scssActiveFile === 'scss' ? 'var(--bg-surface)' : 'transparent',
              color: scssActiveFile === 'scss' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: scssActiveFile === 'scss' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <Palette size={12} style={{ color: '#ec4899' }} />
            <span>{appName}.module.scss</span>
          </button>
        </div>
      )}

      {/* Code Viewer with Monospace Styling */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-code)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(10px, 2vw, var(--space-4))',
          overflow: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(11px, 1.8vw, var(--text-sm))',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.2)',
        }}
      >
        <pre style={{ margin: 0 }}>
          <code>{displayedCode}</code>
        </pre>
      </div>
    </div>
  );
};

