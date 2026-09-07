import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { ThemeMode } from '../../constants/enums';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import {
  Sun,
  Moon,
  Monitor,
  Download,
  Upload,
  Trash2,
  Shield,
  Headphones,
  Sliders,
  Play,
  Check,
  Sparkles,
} from 'lucide-react';
import { AppExportData } from '../../types/storage';
import { usePopupAlert } from '../../hooks/usePopupAlert';
import { CustomPopupAlert } from '../ui/CustomPopupAlert';
import { t } from '../../i18n/i18n';
import {
  VOICE_PERSONA_PACKS,
  VoicePersonaPack,
  findBestVoiceForPack,
  previewVoicePersona,
  getStoredAudioSettings,
  saveStoredAudioSettings,
  AUDIO_SETTINGS_CHANGED_EVENT,
} from '../../services/interviewAudio/voicePacks';
import { AudioPlayerSettings } from '../../types/interviewAudio';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { popupState, showAlert, showConfirm, closePopup } = usePopupAlert();

  // Audio settings & voice packs state
  const [audioSettings, setAudioSettings] = useState<AudioPlayerSettings>(() => getStoredAudioSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const v = synth.getVoices();
      if (v.length > 0) setAvailableVoices(v);
    };
    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);
    return () => {
      synth.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setAudioSettings(getStoredAudioSettings());
    };
    window.addEventListener(AUDIO_SETTINGS_CHANGED_EVENT, handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      window.removeEventListener(AUDIO_SETTINGS_CHANGED_EVENT, handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  const handleApplyPersonaPack = (pack: VoicePersonaPack) => {
    const matched = findBestVoiceForPack(pack, availableVoices);
    const updated = saveStoredAudioSettings({
      activePersonaId: pack.id,
      rate: pack.rate,
      pitch: pack.pitch,
      pauseMode: pack.pauseMode,
      voiceURI: matched ? matched.voiceURI : audioSettings.voiceURI,
    });
    setAudioSettings(updated);
  };

  const handlePreviewPersonaPack = (pack: VoicePersonaPack) => {
    setPreviewingId(pack.id);
    previewVoicePersona(pack, availableVoices);
    setTimeout(() => {
      setPreviewingId(null);
    }, 3500);
  };

  const handleToggleScrubberThumb = (show: boolean) => {
    const updated = saveStoredAudioSettings({ showScrubberThumb: show });
    setAudioSettings(updated);
  };

  const handleSpeedChange = (rate: number) => {
    const updated = saveStoredAudioSettings({ rate });
    setAudioSettings(updated);
  };

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
        notesTable: JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES_TABLE) || '[]'),
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
        if (parsed.notesTable) localStorage.setItem(STORAGE_KEYS.NOTES_TABLE, JSON.stringify(parsed.notesTable));
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
        localStorage.removeItem('react_hooks_custom_notes');
        localStorage.removeItem(STORAGE_KEYS.NOTES_TABLE);
        localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_STATE);
        window.dispatchEvent(new Event('local-storage'));
        showAlert(t('settings.clearSuccessTitle'), t('settings.clearSuccessMessage'), 'info');
      },
    });
  };

  const activePersona = VOICE_PERSONA_PACKS.find(
    (p) => p.id === audioSettings.activePersonaId
  ) || VOICE_PERSONA_PACKS[0];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('settings.modalTitle')} maxWidth="600px">
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

        {/* Interview Voice Packs & Audio Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Headphones size={15} style={{ color: 'var(--accent-purple)' }} />
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Voice Persona Packs (Interview Audio)
              </label>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--accent-purple-text)', fontWeight: 600 }}>
              Active: {activePersona?.name} ({audioSettings.rate}×)
            </span>
          </div>

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '8px',
              padding: '2px',
            }}
          >
            {VOICE_PERSONA_PACKS.map((pack) => {
              const isActive = audioSettings.activePersonaId === pack.id;
              const isPreviewing = previewingId === pack.id;

              return (
                <div
                  key={pack.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--accent-purple)' : 'var(--border-subtle)',
                    backgroundColor: isActive ? 'var(--accent-purple-subtle)' : 'var(--bg-surface-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: isActive ? 'var(--accent-purple-text)' : 'var(--text-primary)' }}>
                        {pack.name}
                      </span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: isActive ? 'var(--accent-purple)' : 'var(--bg-subtle)',
                          color: isActive ? '#ffffff' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {pack.tag}
                      </span>
                    </div>

                    <div style={{ fontSize: '10px', color: 'var(--accent-purple-text)', fontWeight: 600, marginTop: '2px' }}>
                      {pack.role} · {pack.rate}×
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '4px' }}>
                      {pack.description}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Button
                      size="xs"
                      variant={isActive ? 'primary' : 'outline'}
                      onClick={() => handleApplyPersonaPack(pack)}
                      icon={isActive ? <Check size={11} /> : undefined}
                      style={{ flex: 1 }}
                    >
                      {isActive ? 'Active Pack' : 'Apply Pack'}
                    </Button>
                    <button
                      onClick={() => handlePreviewPersonaPack(pack)}
                      title="Audition this voice pack"
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Play size={10} style={{ color: isPreviewing ? 'var(--accent-purple)' : undefined }} />
                      <span>{isPreviewing ? 'Auditioning...' : 'Preview'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audio Player Scrubber Thumb Slider Option */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={13} style={{ color: 'var(--accent-purple)' }} />
                Audio Player Scrubber Thumb Slider Option
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Shows an interactive, draggable thumb knob on the player timeline with segment tooltips
              </div>
            </div>
            <input
              type="checkbox"
              checked={audioSettings.showScrubberThumb !== false}
              onChange={(e) => handleToggleScrubberThumb(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--accent-purple)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
          </div>

          {/* Speaking Speed Quick Steppers */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Narration Speed Preset:
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0.75, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: Math.abs(audioSettings.rate - s) < 0.05 ? 'var(--accent-purple)' : 'var(--border-subtle)',
                    backgroundColor: Math.abs(audioSettings.rate - s) < 0.05 ? 'var(--accent-purple-subtle)' : 'var(--bg-subtle)',
                    color: Math.abs(audioSettings.rate - s) < 0.05 ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
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
