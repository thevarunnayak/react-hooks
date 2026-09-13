import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  Sparkles,
  AlignLeft,
  Map,
  RotateCcw,
  Copy,
  Check,
  Keyboard,
  Maximize2,
  Minimize2,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { CustomSelect } from '../../ui/CustomSelect';
import { Tooltip } from '../../ui/Tooltip';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { ChallengeEditorPreferences } from '../../../types/machineCodingChallenge';

export interface ChallengeEditorToolbarProps {
  fileName?: string;
  lineCount: number;
  preferences: ChallengeEditorPreferences;
  onUpdatePreferences: (updates: Partial<ChallengeEditorPreferences>) => void;
  onFormatCode: () => void;
  onResetCode: () => void;
  onCopyCode: () => void;
  onOpenShortcuts: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  saveBanner: boolean;
}

export const ChallengeEditorToolbar: React.FC<ChallengeEditorToolbarProps> = ({
  fileName = 'App.tsx',
  lineCount,
  preferences,
  onUpdatePreferences,
  onFormatCode,
  onResetCode,
  onCopyCode,
  onOpenShortcuts,
  isMaximized = false,
  onToggleMaximize,
  saveBanner,
}) => {
  const [copied, setCopied] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleConfirmReset = () => {
    onResetCode();
    setShowResetModal(false);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          gap: 10,
          flexWrap: 'wrap',
          userSelect: 'none',
          minHeight: 38,
        }}
        className="challenge-editor-toolbar"
      >
        {/* Left: Active File Tab & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontWeight: 600,
            }}
          >
            <FileCode size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>{fileName}</span>
          </div>

          <span>•</span>
          <span>{lineCount} lines</span>

          {saveBanner && (
            <span
              style={{
                color: 'var(--accent-success)',
                fontWeight: 600,
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                animation: 'fadeIn 150ms ease-out',
              }}
            >
              <Check size={11} /> Saved locally
            </span>
          )}
        </div>

        {/* Right: Quick Controls & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Language Selector */}
          <div style={{ width: 120 }}>
            <CustomSelect
              value={preferences.language}
              onChange={(val) => onUpdatePreferences({ language: val as any })}
              size="sm"
              variant="subtle"
              options={[
                { value: 'typescript', label: 'TypeScript' },
                { value: 'javascript', label: 'JavaScript' },
              ]}
            />
          </div>

          {/* Theme Selector */}
          <div style={{ width: 120 }}>
            <CustomSelect
              value={preferences.theme}
              onChange={(val) => onUpdatePreferences({ theme: val as any })}
              size="sm"
              variant="subtle"
              options={[
                { value: 'apple-dark', label: 'Midnight Dark' },
                { value: 'apple-light', label: 'Clean Light' },
              ]}
            />
          </div>

          {/* Font Size Selector */}
          <div style={{ width: 80 }}>
            <CustomSelect
              value={String(preferences.fontSize)}
              onChange={(val) => onUpdatePreferences({ fontSize: Number(val) })}
              size="sm"
              variant="subtle"
              options={[
                { value: '12', label: '12px' },
                { value: '13', label: '13px' },
                { value: '14', label: '14px' },
                { value: '15', label: '15px' },
                { value: '16', label: '16px' },
                { value: '18', label: '18px' },
              ]}
            />
          </div>

          {/* Word Wrap Toggle */}
          <Tooltip content={`Word Wrap: ${preferences.wordWrap === 'on' ? 'Enabled' : 'Disabled'}`}>
            <button
              type="button"
              onClick={() =>
                onUpdatePreferences({ wordWrap: preferences.wordWrap === 'on' ? 'off' : 'on' })
              }
              aria-label="Toggle Word Wrap"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-xs)',
                border:
                  preferences.wordWrap === 'on'
                    ? '1px solid var(--accent-primary)'
                    : '1px solid var(--border-subtle)',
                backgroundColor:
                  preferences.wordWrap === 'on'
                    ? 'var(--accent-primary-subtle)'
                    : 'var(--bg-surface)',
                color:
                  preferences.wordWrap === 'on'
                    ? 'var(--accent-primary-text)'
                    : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <AlignLeft size={13} />
            </button>
          </Tooltip>

          {/* Minimap Toggle */}
          <Tooltip content={`Minimap: ${preferences.minimap ? 'Visible' : 'Hidden'}`}>
            <button
              type="button"
              onClick={() => onUpdatePreferences({ minimap: !preferences.minimap })}
              aria-label="Toggle Minimap"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-xs)',
                border: preferences.minimap
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-subtle)',
                backgroundColor: preferences.minimap
                  ? 'var(--accent-primary-subtle)'
                  : 'var(--bg-surface)',
                color: preferences.minimap
                  ? 'var(--accent-primary-text)'
                  : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Map size={13} />
            </button>
          </Tooltip>

          {/* Format Document */}
          <Tooltip content="Format Code (Shift + Option + F)">
            <button
              type="button"
              onClick={onFormatCode}
              aria-label="Format Document"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={13} />
            </button>
          </Tooltip>

          {/* Keyboard Shortcuts Button */}
          <Tooltip content="Keyboard Shortcuts (⌘/)">
            <button
              type="button"
              onClick={onOpenShortcuts}
              aria-label="Keyboard Shortcuts"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Keyboard size={13} />
            </button>
          </Tooltip>

          {/* Copy Code */}
          <Tooltip content={copied ? 'Copied!' : 'Copy Code'}>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy Code"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: copied ? 'var(--accent-success)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </Tooltip>

          {/* Reset Code */}
          <Tooltip content="Reset to Starter Code">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              aria-label="Reset Code"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
            </button>
          </Tooltip>

          {/* Maximize / Distraction-Free Toggle */}
          {onToggleMaximize && (
            <Tooltip content={isMaximized ? 'Restore Layout (⌘M)' : 'Maximize Editor (⌘M)'}>
              <button
                type="button"
                onClick={onToggleMaximize}
                aria-label="Toggle Fullscreen Editor"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--radius-xs)',
                  border: isMaximized
                    ? '1px solid var(--accent-primary)'
                    : '1px solid var(--border-subtle)',
                  backgroundColor: isMaximized
                    ? 'var(--accent-primary-subtle)'
                    : 'var(--bg-surface)',
                  color: isMaximized
                    ? 'var(--accent-primary-text)'
                    : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Solution Code?"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-warning-subtle, rgba(245, 158, 11, 0.1))',
              border: '1px solid var(--accent-warning)',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle
              size={18}
              style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: 2 }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              Are you sure you want to discard your changes and reload the initial starter template?
              This action cannot be undone.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <Button size="sm" variant="outline" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmReset}>
              Reset to Starter Code
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
