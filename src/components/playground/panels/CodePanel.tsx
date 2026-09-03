import React, { useState } from 'react';
import { Code2, Copy, Check, Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Tooltip } from '../../ui/Tooltip';
import { t } from '../../../i18n/i18n';

export interface CodePanelProps {
  code: string;
  appName?: string;
}

export const CodePanel: React.FC<CodePanelProps> = ({ code, appName = 'App' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName}.tsx`;
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
        padding: 'var(--space-4)',
        gap: 'var(--space-3)',
      }}
      className="code-panel"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('playground.code.title')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
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

      {/* Code Viewer */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-code)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          overflow: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
        }}
      >
        <pre style={{ margin: 0 }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
