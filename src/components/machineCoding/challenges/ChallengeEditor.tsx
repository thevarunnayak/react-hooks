import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { ChallengeEditorPreferences } from '../../../types/machineCodingChallenge';
import { MonacoCodeEditor } from './MonacoCodeEditor';
import { ChallengeEditorToolbar } from './ChallengeEditorToolbar';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

export interface ChallengeEditorProps {
  code: string;
  isDirty: boolean;
  onChange: (code: string) => void;
  onReset: () => void;
  onRunTests: () => void;
  onSubmit: () => void;
  language?: string;
  fileName?: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  errorMarkers?: Array<{
    line: number;
    message: string;
    severity?: 'error' | 'warning';
  }>;
}

const STORAGE_PREFS_KEY = 'reactlabz_challenge_editor_prefs';

export const ChallengeEditor: React.FC<ChallengeEditorProps> = ({
  code,
  isDirty,
  onChange,
  onReset,
  onRunTests,
  onSubmit,
  language,
  fileName = 'App.tsx',
  isMaximized = false,
  onToggleMaximize,
  errorMarkers = [],
}) => {
  // Check if system/document is in light mode
  const isDocLight =
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'light';

  // Load editor preferences from localStorage
  const [preferences, setPreferences] = useState<ChallengeEditorPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return {
      fontSize: 13,
      theme: isDocLight ? 'apple-light' : 'apple-dark',
      wordWrap: 'on',
      minimap: false,
      tabSize: 2,
      autoClosingBrackets: 'always',
      language: (language as any) || 'typescript',
    };
  });

  const [saveBanner, setSaveBanner] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Sync theme if document theme changes and user hasn't explicitly overridden
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentDocTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme = currentDocTheme === 'light' ? 'apple-light' : 'apple-dark';
      setPreferences((prev) => ({ ...prev, theme: targetTheme }));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const handleUpdatePreferences = useCallback((updates: Partial<ChallengeEditorPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleFormatCode = useCallback(() => {
    if (!editorInstanceRef.current) return;
    editorInstanceRef.current.getAction('editor.action.formatDocument')?.run();
  }, []);

  const handleSaveDraft = useCallback(() => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  }, []);

  const lineCount = code.split('\n').length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: preferences.theme === 'apple-dark' ? '#0c0e14' : '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: isMaximized ? 0 : 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
      }}
      className="challenge-code-editor-ide"
    >
      {/* Professional Editor Toolbar */}
      <ChallengeEditorToolbar
        fileName={fileName}
        lineCount={lineCount}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onFormatCode={handleFormatCode}
        onResetCode={onReset}
        onCopyCode={() => navigator.clipboard.writeText(code)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
        saveBanner={saveBanner}
      />

      {/* Monaco Code Editor Workspace */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative' }}>
        <MonacoCodeEditor
          code={code}
          onChange={onChange}
          fileName={fileName}
          language={preferences.language}
          preferences={preferences}
          onRunTests={onRunTests}
          onSubmit={onSubmit}
          onSaveDraft={handleSaveDraft}
          editorRefOut={editorInstanceRef}
          errorMarkers={errorMarkers}
        />
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
