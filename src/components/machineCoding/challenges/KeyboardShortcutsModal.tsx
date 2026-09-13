import React from 'react';
import { Command, Keyboard } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Badge } from '../../ui/Badge';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const isMac =
    typeof window !== 'undefined' &&
    (navigator.platform?.toUpperCase().indexOf('MAC') >= 0 ||
      navigator.userAgent?.toUpperCase().indexOf('MAC') >= 0);

  const modKey = isMac ? '⌘' : 'Ctrl';
  const optKey = isMac ? '⌥' : 'Alt';

  const shortcutGroups = [
    {
      category: 'Challenge Actions',
      items: [
        { keys: [`${modKey}`, 'Enter'], description: 'Run Public Tests' },
        { keys: [`${modKey}`, 'Shift', 'Enter'], description: 'Submit Challenge (Public + Hidden Tests)' },
        { keys: [`${modKey}`, 'S'], description: 'Save Code Draft to LocalStorage' },
      ],
    },
    {
      category: 'Workspace & Panel Layouts',
      items: [
        { keys: [`${modKey}`, 'B'], description: 'Toggle Problem Description Panel' },
        { keys: [`${modKey}`, 'J'], description: 'Toggle Test Results / Console Drawer' },
        { keys: [`${modKey}`, 'M'], description: 'Maximize / Distraction-Free Editor' },
        { keys: ['Esc'], description: 'Close Modals / Exit Fullscreen' },
      ],
    },
    {
      category: 'Code Editor Navigation & Editing',
      items: [
        { keys: ['Shift', `${optKey}`, 'F'], description: 'Format Code Document' },
        { keys: [`${modKey}`, 'F'], description: 'Find in Code' },
        { keys: [`${modKey}`, 'H'], description: 'Find & Replace' },
        { keys: [`${modKey}`, '/'], description: 'Toggle Line Comment' },
        { keys: [`${optKey}`, '↑ / ↓'], description: 'Move Line Up / Down' },
        { keys: ['Shift', `${optKey}`, '↑ / ↓'], description: 'Duplicate Line Up / Down' },
        { keys: ['Tab'], description: 'Indent Line / Selection' },
        { keys: ['Shift', 'Tab'], description: 'Outdent Line / Selection' },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Keyboard size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Keyboard Shortcuts</span>
        </div>
      }
      maxWidth="620px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          Master the professional IDE shortcuts to navigate, code, run, and submit faster during interviews.
        </p>

        {shortcutGroups.map((group) => (
          <div key={group.category} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {group.category}
            </span>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-elevated)',
                overflow: 'hidden',
              }}
            >
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom:
                      idx < group.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{item.description}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-default)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          minWidth: 20,
                          textAlign: 'center',
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
