import React, { useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { ThemeMode } from '../../constants/enums';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { Sun, Moon, Monitor, Download, Upload, Trash2, Shield } from 'lucide-react';
import { AppExportData } from '../../types/storage';
import { usePopupAlert } from '../../hooks/usePopupAlert';
import { CustomPopupAlert } from '../ui/CustomPopupAlert';
import { t } from '../../i18n/i18n';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { popupState, showAlert, showConfirm, closePopup } = usePopupAlert();

  const handleExport = () => {
    try {
      const data: AppExportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        theme,
        bookmarks: JSON.parse(localStorage.getItem('react_hooks_bookmarks') || '[]'),
        completedLessons: JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS) || '[]'),
        completedChallenges: JSON.parse(localStorage.getItem(STORAGE_KEYS.CHALLENGE_SUBMISSIONS) || '[]'),
        notes: JSON.parse(localStorage.getItem('react_hooks_notes') || '{}'),
        savedProjects: JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYGROUND_STATE) || '[]'),
        preferences: {
          reducedMotion: false,
          autoRunPreview: true,
          fontSize: 14,
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `react-hooks-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showAlert(t('settings.exportSuccessTitle'), t('settings.exportSuccessMessage'), 'success');
    } catch (e) {
      showAlert(t('settings.importErrorTitle'), String(e), 'danger');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.bookmarks) localStorage.setItem('react_hooks_bookmarks', JSON.stringify(parsed.bookmarks));
        if (parsed.completedLessons) localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(parsed.completedLessons));
        if (parsed.notes) localStorage.setItem('react_hooks_notes', JSON.stringify(parsed.notes));
        if (parsed.savedProjects) localStorage.setItem(STORAGE_KEYS.PLAYGROUND_STATE, JSON.stringify(parsed.savedProjects));
        if (parsed.theme) setTheme(parsed.theme);

        window.dispatchEvent(new Event('local-storage'));
        showAlert(
          t('settings.importSuccessTitle'),
          t('settings.importSuccessMessage', { nodes: parsed.savedProjects?.nodes?.length || 0, connections: parsed.savedProjects?.connections?.length || 0 }),
          'success'
        );
      } catch (err) {
        console.error('Settings import error:', err);
        showAlert(t('settings.importErrorTitle'), t('settings.importErrorMessage'), 'danger');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    showConfirm({
      title: t('settings.clearConfirmTitle'),
      message: t('settings.clearConfirmMessage'),
      type: 'danger',
      confirmText: t('settings.clearConfirmBtn'),
      cancelText: t('settings.clearCancelBtn'),
      onConfirm: () => {
        localStorage.removeItem('react_hooks_bookmarks');
        localStorage.removeItem(STORAGE_KEYS.LESSON_PROGRESS);
        localStorage.removeItem(STORAGE_KEYS.CHALLENGE_SUBMISSIONS);
        localStorage.removeItem('react_hooks_notes');
        localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_STATE);
        window.dispatchEvent(new Event('local-storage'));
        showAlert(t('settings.clearSuccessTitle'), t('settings.clearSuccessMessage'), 'info');
      },
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('settings.modalTitle')} maxWidth="500px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Theme Settings */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('settings.appearanceTitle')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
            <Button
              size="sm"
              variant={theme === ThemeMode.SYSTEM ? 'primary' : 'outline'}
              icon={<Monitor size={14} />}
              onClick={() => setTheme(ThemeMode.SYSTEM)}
            >
              {t('settings.themeSystem')}
            </Button>
            <Button
              size="sm"
              variant={theme === ThemeMode.LIGHT ? 'primary' : 'outline'}
              icon={<Sun size={14} />}
              onClick={() => setTheme(ThemeMode.LIGHT)}
            >
              {t('settings.themeLight')}
            </Button>
            <Button
              size="sm"
              variant={theme === ThemeMode.DARK ? 'primary' : 'outline'}
              icon={<Moon size={14} />}
              onClick={() => setTheme(ThemeMode.DARK)}
            >
              {t('settings.themeDark')}
            </Button>
          </div>
        </div>

        {/* Local Storage & Privacy Notice */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} style={{ color: 'var(--accent-success)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('settings.dataManagementTitle')}
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {t('settings.dataManagementDesc')}
          </p>
        </div>

        {/* Data Import / Export */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('settings.exportTitle')}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={handleExport} style={{ flex: 1 }}>
              {t('settings.exportBtn')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Upload size={14} />}
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1 }}
            >
              {t('settings.importBtn')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Reset */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={handleClear} style={{ width: '100%' }}>
            {t('settings.clearBtn')}
          </Button>
        </div>
      </div>
    </Modal>
    <CustomPopupAlert {...popupState} onClose={closePopup} />
  </>
  );
};
