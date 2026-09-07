import React, { useState } from 'react';
import {
  X,
  Volume2,
  Gauge,
  Sliders,
  Clock,
  Check,
  Play,
  Sparkles,
  Minus,
  Plus,
  Compass,
  Info,
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { PauseCadenceMode, AudioPlayerSettings } from '../../types/interviewAudio';
import {
  VOICE_PERSONA_PACKS,
  VoicePersonaPack,
  findBestVoiceForPack,
  previewVoicePersona,
} from '../../services/interviewAudio/voicePacks';
import { getModifierKeyLabel } from '../../utils/platform';

export interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioPlayerSettings;
  availableVoices: SpeechSynthesisVoice[];
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVoiceChange: (voiceURI: string | null) => void;
  onPauseModeChange: (mode: PauseCadenceMode) => void;
  onAutoFollowChange: (follow: boolean) => void;
  onHighlightSentencesChange: (highlight: boolean) => void;
  onShowScrubberThumbChange?: (show: boolean) => void;
  onPreviewVoice: (voiceURI: string) => void;
}

const SPEED_PRESETS = [0.75, 0.9, 1.0, 1.25, 1.5, 1.75, 2.0];

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  availableVoices,
  onRateChange,
  onPitchChange,
  onVoiceChange,
  onPauseModeChange,
  onAutoFollowChange,
  onHighlightSentencesChange,
  onShowScrubberThumbChange,
  onPreviewVoice,
}) => {
  const [showVoiceInstallGuide, setShowVoiceInstallGuide] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);

  if (!isOpen) return null;

  const modKey = getModifierKeyLabel();

  // Regional voice groupings
  const usEnglishVoices = availableVoices.filter(
    (v) => v.lang === 'en-US' || v.lang.includes('US')
  );
  const ukEnglishVoices = availableVoices.filter(
    (v) => v.lang === 'en-GB' || v.lang.includes('GB') || v.name.includes('UK')
  );
  const inEnglishVoices = availableVoices.filter(
    (v) => v.lang === 'en-IN' || v.lang.includes('IN') || v.name.includes('India')
  );
  const auEnglishVoices = availableVoices.filter(
    (v) => v.lang === 'en-AU' || v.lang.includes('AU') || v.name.includes('Australia')
  );
  const otherEnglishVoices = availableVoices.filter(
    (v) =>
      v.lang.startsWith('en') &&
      !usEnglishVoices.includes(v) &&
      !ukEnglishVoices.includes(v) &&
      !inEnglishVoices.includes(v) &&
      !auEnglishVoices.includes(v)
  );
  const internationalVoices = availableVoices.filter((v) => !v.lang.startsWith('en'));

  const adjustSpeed = (delta: number) => {
    const next = Math.max(0.5, Math.min(2.5, Math.round((settings.rate + delta) * 100) / 100));
    onRateChange(next);
  };

  const applyPersonaPack = (pack: VoicePersonaPack) => {
    setActivePersonaId(pack.id);

    const matchedVoice = findBestVoiceForPack(pack, availableVoices);
    if (matchedVoice) {
      onVoiceChange(matchedVoice.voiceURI);
    }
    onRateChange(pack.rate);
    onPitchChange(pack.pitch);
    onPauseModeChange(pack.pauseMode);
  };

  const previewPersona = (pack: VoicePersonaPack) => {
    previewVoicePersona(pack, availableVoices);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-settings-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-purple-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <h2
                id="audio-settings-title"
                style={{
                  fontSize: 'var(--text-md)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Voice & Audio Settings
              </h2>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  margin: '2px 0 0 0',
                }}
              >
                Select curated voice packs, adjust speaking speed, and tune breathing pauses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close audio settings"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            overflowY: 'auto',
          }}
        >
          {/* Section 1: Voice Persona Packs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Radio size={14} style={{ color: 'var(--accent-purple)' }} />
                Voice Persona Packs (Curated Profiles)
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Auto-tunes voice, rate & cadence
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '8px',
              }}
            >
              {VOICE_PERSONA_PACKS.map((pack) => {
                const isActive = activePersonaId === pack.id;
                return (
                  <div
                    key={pack.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--accent-purple)' : 'var(--border-subtle)',
                      backgroundColor: isActive
                        ? 'var(--accent-purple-subtle)'
                        : 'var(--bg-surface-elevated)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            color: isActive ? 'var(--accent-purple-text)' : 'var(--text-primary)',
                          }}
                        >
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

                      <div
                        style={{
                          fontSize: '10px',
                          color: 'var(--accent-purple-text)',
                          fontWeight: 600,
                          marginTop: '2px',
                        }}
                      >
                        {pack.role} · {pack.rate}×
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          lineHeight: 1.4,
                          marginTop: '4px',
                        }}
                      >
                        {pack.description}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Button
                        size="xs"
                        variant={isActive ? 'primary' : 'outline'}
                        onClick={() => applyPersonaPack(pack)}
                        icon={isActive ? <Check size={11} /> : undefined}
                      >
                        {isActive ? 'Active Pack' : 'Apply Pack'}
                      </Button>
                      <button
                        onClick={() => previewPersona(pack)}
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
                        <Play size={10} />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Installed System Voices Dropdown (Grouped by Region/Accent) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                htmlFor="voice-picker"
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Volume2 size={14} style={{ color: 'var(--accent-primary)' }} />
                Installed Voice Selection ({availableVoices.length} detected)
              </label>
              {settings.voiceURI && (
                <Button
                  size="xs"
                  variant="outline"
                  icon={<Play size={11} />}
                  onClick={() => onPreviewVoice(settings.voiceURI!)}
                >
                  Test Selected Voice
                </Button>
              )}
            </div>

            <select
              id="voice-picker"
              value={settings.voiceURI || ''}
              onChange={(e) => onVoiceChange(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {availableVoices.length === 0 ? (
                <option value="">Default System Voice</option>
              ) : (
                <>
                  {usEnglishVoices.length > 0 && (
                    <optgroup label="🇺🇸 US English Voices">
                      {usEnglishVoices.map((v) => {
                        const isNatural =
                          v.name.includes('Natural') ||
                          v.name.includes('Google') ||
                          v.name.includes('Samantha') ||
                          v.name.includes('Siri');
                        return (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang}) {isNatural ? '★ Studio / Natural' : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}

                  {ukEnglishVoices.length > 0 && (
                    <optgroup label="🇬🇧 UK English Voices">
                      {ukEnglishVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang}) {v.name.includes('Daniel') ? '★ Recommended' : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {inEnglishVoices.length > 0 && (
                    <optgroup label="🇮🇳 Indian English Voices">
                      {inEnglishVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {auEnglishVoices.length > 0 && (
                    <optgroup label="🇦🇺 Australian & NZ English Voices">
                      {auEnglishVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {otherEnglishVoices.length > 0 && (
                    <optgroup label="🌐 Global English Voices">
                      {otherEnglishVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {internationalVoices.length > 0 && (
                    <optgroup label="🌍 Other Multilingual Installed Voices">
                      {internationalVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>

            {/* How to unlock 50+ free studio voices on Mac / Windows */}
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setShowVoiceInstallGuide(!showVoiceInstallGuide)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={13} style={{ color: 'var(--accent-purple)' }} />
                  How to unlock 50+ free studio voices on Mac & Windows
                </span>
                {showVoiceInstallGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showVoiceInstallGuide && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Indian English (en-IN):</strong> For Indian Male & Female voices, download free Enhanced Rishi, Aman, or Tara on macOS (<code>Accessibility ➔ Spoken Content ➔ Manage Voices</code>), or Microsoft Ravi and Heera on Windows.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>macOS:</strong> Open{' '}
                    <code>System Settings ➔ Accessibility ➔ Spoken Content ➔ System Voice ➔ Manage Voices</code>.
                    You can download free studio-grade Apple Siri Voices (Voice 1, 2, 3, 4) and Enhanced Samantha/Daniel/Rishi.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Windows:</strong> Open{' '}
                    <code>Settings ➔ Time & Language ➔ Speech ➔ Add Voices</code>. Install Microsoft Natural Neural voices (Jenny, Guy, Ravi, Heera).
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Chrome:</strong> Google provides high-quality online speech voices (Google US English, Google English India) automatically when connected to the internet.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Speech Speed / Rate with Steppers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Gauge size={14} style={{ color: 'var(--accent-purple)' }} />
                Speech Speed / Rate
              </label>

              {/* Stepper Buttons (- and +) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => adjustSpeed(-0.1)}
                  disabled={settings.rate <= 0.5}
                  title="Decrease speed by 0.1x"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: settings.rate <= 0.5 ? 'not-allowed' : 'pointer',
                    opacity: settings.rate <= 0.5 ? 0.4 : 1,
                  }}
                >
                  <Minus size={13} />
                </button>
                <span
                  style={{
                    minWidth: '44px',
                    textAlign: 'center',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--accent-primary-text)',
                  }}
                >
                  {settings.rate.toFixed(2)}×
                </span>
                <button
                  onClick={() => adjustSpeed(0.1)}
                  disabled={settings.rate >= 2.5}
                  title="Increase speed by 0.1x"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: settings.rate >= 2.5 ? 'not-allowed' : 'pointer',
                    opacity: settings.rate >= 2.5 ? 0.4 : 1,
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Quick Speed Preset Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {SPEED_PRESETS.map((speed) => {
                const isActive = Math.abs(settings.rate - speed) < 0.05;
                return (
                  <button
                    key={speed}
                    onClick={() => onRateChange(speed)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: isActive ? 700 : 500,
                      border: '1px solid',
                      borderColor: isActive ? 'var(--accent-purple)' : 'var(--border-subtle)',
                      backgroundColor: isActive ? 'var(--accent-purple-subtle)' : 'var(--bg-subtle)',
                      color: isActive ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {speed.toFixed(2).replace(/\.00$/, '')}×
                    {speed === 1.0 && ' (Normal)'}
                    {speed === 0.9 && ' (Conversational)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Pitch / Vocal Warmth */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} style={{ color: 'var(--accent-warning)' }} />
                Vocal Pitch & Tone
              </label>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {settings.pitch === 1.0
                  ? 'Natural (1.0)'
                  : settings.pitch < 1.0
                  ? `Deeper (${settings.pitch.toFixed(1)})`
                  : `Higher (${settings.pitch.toFixed(1)})`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Warm</span>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={settings.pitch}
                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: 'var(--accent-purple)',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bright</span>
            </div>
          </div>

          {/* Section 5: Breathing Pauses & Cadence Mode */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={14} style={{ color: 'var(--accent-success)' }} />
              Breathing Pauses & Cadence
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(
                [
                  {
                    mode: 'natural',
                    title: 'Natural Mentor',
                    subtitle: '750ms section / 1.4s Q',
                    badge: 'Recommended',
                  },
                  {
                    mode: 'snappy',
                    title: 'Fast Track',
                    subtitle: '350ms section / 750ms Q',
                    badge: 'Brisk',
                  },
                  {
                    mode: 'extended',
                    title: 'Deep Study',
                    subtitle: '1.2s section / 2.2s Q',
                    badge: 'Reflective',
                  },
                ] as const
              ).map((preset) => {
                const isSelected = settings.pauseMode === preset.mode;
                return (
                  <button
                    key={preset.mode}
                    onClick={() => onPauseModeChange(preset.mode)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-success)' : 'var(--border-subtle)',
                      backgroundColor: isSelected
                        ? 'var(--accent-success-subtle)'
                        : 'var(--bg-subtle)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isSelected ? 'var(--accent-success-text)' : 'var(--text-primary)',
                        }}
                      >
                        {preset.title}
                      </span>
                      {isSelected && <Check size={12} style={{ color: 'var(--accent-success)' }} />}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {preset.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Experience Toggles */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Auto-Follow Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Compass size={13} style={{ color: 'var(--accent-primary)' }} />
                  Auto-Scroll to Spoken Section
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Smoothly scrolls the page to keep the narrated card in view
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoFollow}
                onChange={(e) => onAutoFollowChange(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Sentence Highlighting Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  Synchronized Highlight Aura
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Glows the active section with real-time audio wave badge
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.highlightSentences}
                onChange={(e) => onHighlightSentencesChange(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Draggable Thumb Scrubber Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sliders size={13} style={{ color: 'var(--accent-purple)' }} />
                  Audio Player Scrubber Thumb Slider
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Interactive draggable slider knob on player timeline with live segment tooltip
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showScrubberThumb !== false}
                onChange={(e) => onShowScrubberThumbChange?.(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-purple)',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>

          {/* Section 7: Keyboard Shortcuts Quick Reference */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <strong style={{ color: 'var(--text-secondary)' }}>Audio Player Shortcuts:</strong>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div>
                <kbd style={kbdStyle}>Space</kbd> Play / Pause
              </div>
              <div>
                <kbd style={kbdStyle}>{modKey}+→</kbd> Next Question
              </div>
              <div>
                <kbd style={kbdStyle}>{modKey}+←</kbd> Prev Question
              </div>
              <div>
                <kbd style={kbdStyle}>M</kbd> Minimize / Expand
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 5px',
  borderRadius: '4px',
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
  fontSize: '10px',
  marginRight: '4px',
};
