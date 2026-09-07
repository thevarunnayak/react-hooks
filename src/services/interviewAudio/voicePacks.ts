import { AudioPlayerSettings, VoicePersonaPack } from '../../types/interviewAudio';
export type { VoicePersonaPack };

export const STORAGE_AUDIO_SETTINGS_KEY = 'react_hooks_audio_settings_v2';
export const AUDIO_SETTINGS_CHANGED_EVENT = 'react_hooks_audio_settings_changed';

export const DEFAULT_AUDIO_SETTINGS: AudioPlayerSettings = {
  rate: 1.0,
  pitch: 1.0,
  voiceURI: null,
  pauseMode: 'natural',
  autoFollow: true,
  isMinimized: false,
  showTranscript: false,
  highlightSentences: true,
  showScrubberThumb: true,
  activePersonaId: 'staff-mentor',
};

export const VOICE_PERSONA_PACKS: VoicePersonaPack[] = [
  {
    id: 'staff-mentor',
    name: 'The Staff Mentor',
    role: 'Balanced & Conversational',
    description: 'Natural pacing with measured breathing pauses. Ideal for steady, deep comprehension.',
    preferredVoiceKeywords: ['Natural', 'Google US English', 'Samantha', 'Karen'],
    rate: 0.95,
    pitch: 1.0,
    pauseMode: 'natural',
    tag: 'Recommended',
    gender: 'neutral',
  },
  {
    id: 'indian-lead-male',
    name: 'Indian Tech Lead (Male)',
    role: 'Structured & Decisive (en-IN)',
    description: 'Warm, authoritative Indian English cadence. Delivers structured engineering trade-offs with steady, clear pacing.',
    preferredVoiceKeywords: ['Rishi', 'Aman', 'Ravi', 'Prabhat', 'Karan', 'en-IN', 'en_IN', 'India'],
    rate: 0.98,
    pitch: 0.98,
    pauseMode: 'natural',
    tag: 'Indian Male',
    gender: 'male',
    region: 'en-IN',
  },
  {
    id: 'indian-coach-female',
    name: 'Indian Principal Coach (Female)',
    role: 'Articulate & Expressive (en-IN)',
    description: 'Polished, articulate Indian English delivery with clear modulation. Great for mental models and deep lifecycle internals.',
    preferredVoiceKeywords: ['Tara', 'Veena', 'Sangeeta', 'Heera', 'Neerja', 'Kavya', 'Lekha', 'en-IN', 'en_IN', 'India'],
    rate: 0.98,
    pitch: 1.08,
    pauseMode: 'natural',
    tag: 'Indian Female',
    gender: 'female',
    region: 'en-IN',
  },
  {
    id: 'tech-lead',
    name: 'The Tech Lead',
    role: 'Crisp & Articulate',
    description: 'Brisk, authoritative cadence. Gets straight to architectural trade-offs.',
    preferredVoiceKeywords: ['Daniel', 'Oliver', 'Google UK English Female', 'Stephanie'],
    rate: 1.1,
    pitch: 1.05,
    pauseMode: 'snappy',
    tag: 'Crisp',
  },
  {
    id: 'principal-architect',
    name: 'The Principal Architect',
    role: 'Deep & Reflective',
    description: 'Deeper pitch, extended pauses to let complex mental models and low-level details sink in.',
    preferredVoiceKeywords: ['Victoria', 'Fred', 'Google UK English Male', 'Rishi'],
    rate: 0.9,
    pitch: 0.92,
    pauseMode: 'extended',
    tag: 'Deep Study',
  },
  {
    id: 'system-architect',
    name: 'System Design Lead',
    role: 'Methodical & Rigorous',
    description: 'Structured tempo with deliberate pauses. Emphasizes scalability, concurrency, and trade-offs.',
    preferredVoiceKeywords: ['Daniel', 'Alex', 'Victoria', 'Natural', 'Google US English'],
    rate: 0.92,
    pitch: 0.98,
    pauseMode: 'extended',
    tag: 'System Design',
  },
  {
    id: 'interview-coach',
    name: 'The Interview Coach',
    role: 'Supportive & Dynamic',
    description: 'Standard speed with natural intonation to simulate a real mock interview session.',
    preferredVoiceKeywords: ['Siri', 'Serena', 'Samantha', 'Google'],
    rate: 1.0,
    pitch: 1.0,
    pauseMode: 'natural',
    tag: 'Interview Prep',
  },
  {
    id: 'rapid-cram',
    name: 'Rapid-Fire Cram',
    role: 'Fast-Paced Review',
    description: 'Quick 1.3x speed with short pauses for rapid last-minute revision before a technical screen.',
    preferredVoiceKeywords: ['Alex', 'Google US English', 'Natural'],
    rate: 1.3,
    pitch: 1.1,
    pauseMode: 'snappy',
    tag: 'Rapid Review',
  },
  {
    id: 'calm-explainer',
    name: 'The Calm Explainer',
    role: 'Gentle & Unhurried',
    description: 'Lower speed and softer pitch to reduce anxiety when learning intimidating concepts.',
    preferredVoiceKeywords: ['Moira', 'Tessa', 'Samantha', 'Victoria'],
    rate: 0.85,
    pitch: 0.95,
    pauseMode: 'extended',
    tag: 'Relaxed',
  },
  {
    id: 'british-staff',
    name: 'British Staff Engineer',
    role: 'Precision RP Cadence',
    description: 'Articulate British delivery with measured cadence and clinical focus on runtime profiling.',
    preferredVoiceKeywords: ['Google UK English Female', 'Oliver', 'Daniel', 'Stephanie', 'en-GB'],
    rate: 1.0,
    pitch: 1.02,
    pauseMode: 'natural',
    tag: 'Precision UK',
  },
  {
    id: 'valley-founder',
    name: 'Silicon Valley Founder',
    role: 'High-Bandwidth & Visionary',
    description: 'High-energy 1.15x tempo with snappy transitions. Great for fast storytelling and comprehension.',
    preferredVoiceKeywords: ['Samantha', 'Google US English', 'Karen', 'Alex', 'en-US'],
    rate: 1.15,
    pitch: 1.08,
    pauseMode: 'snappy',
    tag: 'High Energy',
  },
  {
    id: 'global-consultant',
    name: 'Global Tech Consultant',
    role: 'Clear Global Diction',
    description: 'Neutral, highly articulate international diction optimized for global engineering teams.',
    preferredVoiceKeywords: ['Rishi', 'Google हिन्दी', 'en-IN', 'India', 'Samantha', 'Natural'],
    rate: 1.0,
    pitch: 1.0,
    pauseMode: 'natural',
    tag: 'Global Tech',
  },
];

const MALE_NAMES = [
  'rishi',
  'aman',
  'ravi',
  'prabhat',
  'karan',
  'daniel',
  'alex',
  'oliver',
  'fred',
  'george',
  'guy',
  'male',
];

const FEMALE_NAMES = [
  'tara',
  'veena',
  'sangeeta',
  'heera',
  'neerja',
  'kavya',
  'lekha',
  'samantha',
  'stephanie',
  'karen',
  'victoria',
  'moira',
  'tessa',
  'serena',
  'jenny',
  'aria',
  'female',
];

/**
 * Finds the best installed system voice matching persona keywords, region, and gender.
 */
export function findBestVoiceForPack(
  pack: VoicePersonaPack,
  availableVoices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!availableVoices || availableVoices.length === 0) return null;

  const isIndianPack =
    pack.region === 'en-IN' ||
    pack.tag.toLowerCase().includes('india') ||
    pack.id.includes('indian');
  const targetGender = pack.gender;

  if (isIndianPack) {
    // 1. First priority: Check exact preferred voice name keywords
    for (const kw of pack.preferredVoiceKeywords) {
      const match = availableVoices.find((v) => {
        const nameLower = v.name.toLowerCase();
        const kwLower = kw.toLowerCase();
        return (
          nameLower.includes(kwLower) &&
          (v.lang.toLowerCase().includes('in') ||
            nameLower.includes('india') ||
            v.lang.startsWith('en'))
        );
      });
      if (match) return match;
    }

    // 2. Second priority: Filter all Indian regional voices (en-IN, en_IN, hi-IN, or "India" in name)
    const indianVoices = availableVoices.filter(
      (v) =>
        v.lang.toLowerCase().includes('-in') ||
        v.lang.toLowerCase().includes('_in') ||
        v.lang.toLowerCase() === 'en-in' ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('hindi')
    );

    if (indianVoices.length > 0) {
      if (targetGender === 'male') {
        const maleIndian = indianVoices.find((v) => {
          const lower = v.name.toLowerCase();
          return (
            MALE_NAMES.some((m) => lower.includes(m)) ||
            !FEMALE_NAMES.some((f) => lower.includes(f))
          );
        });
        if (maleIndian) return maleIndian;
      } else if (targetGender === 'female') {
        const femaleIndian = indianVoices.find((v) => {
          const lower = v.name.toLowerCase();
          return (
            FEMALE_NAMES.some((f) => lower.includes(f)) ||
            !MALE_NAMES.some((m) => lower.includes(m))
          );
        });
        if (femaleIndian) return femaleIndian;
      }
      return indianVoices[0];
    }
  }

  // 3. General keyword match across voice name and language code
  for (const kw of pack.preferredVoiceKeywords) {
    const kwLower = kw.toLowerCase();
    const matched = availableVoices.find(
      (v) =>
        v.name.toLowerCase().includes(kwLower) ||
        v.lang.toLowerCase() === kwLower ||
        v.lang.toLowerCase().replace('_', '-') === kwLower
    );
    if (matched) return matched;
  }

  // 4. Gender-aware English fallback if specific gender is requested
  if (targetGender === 'male') {
    const maleEn = availableVoices.find(
      (v) =>
        v.lang.startsWith('en') &&
        MALE_NAMES.some((m) => v.name.toLowerCase().includes(m))
    );
    if (maleEn) return maleEn;
  } else if (targetGender === 'female') {
    const femaleEn = availableVoices.find(
      (v) =>
        v.lang.startsWith('en') &&
        FEMALE_NAMES.some((f) => v.name.toLowerCase().includes(f))
    );
    if (femaleEn) return femaleEn;
  }

  // 5. Standard English fallback
  const englishFallback = availableVoices.find((v) => v.lang.startsWith('en'));
  return englishFallback || availableVoices[0] || null;
}

/**
 * Auditions a voice persona pack in the browser with speech synthesis.
 */
export function previewVoicePersona(
  pack: VoicePersonaPack,
  availableVoices: SpeechSynthesisVoice[]
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const matchedVoice = findBestVoiceForPack(pack, availableVoices);
  const sample = `Hello! I am ${pack.name}. Here is a quick audition of how I will coach you through React interview questions.`;

  const utterance = new SpeechSynthesisUtterance(sample);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }
  utterance.rate = pack.rate;
  utterance.pitch = pack.pitch;

  synth.speak(utterance);
}

/**
 * Loads stored audio settings safely from localStorage.
 */
export function getStoredAudioSettings(): AudioPlayerSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_AUDIO_SETTINGS_KEY);
    return raw ? { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) } : DEFAULT_AUDIO_SETTINGS;
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

/**
 * Saves audio settings to localStorage and dispatches a synchronization event across components.
 */
export function saveStoredAudioSettings(
  partialSettings: Partial<AudioPlayerSettings>
): AudioPlayerSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const current = getStoredAudioSettings();
    const updated: AudioPlayerSettings = { ...current, ...partialSettings };
    localStorage.setItem(STORAGE_AUDIO_SETTINGS_KEY, JSON.stringify(updated));

    // Dispatch custom event for real-time synchronization in active tabs/components
    window.dispatchEvent(
      new CustomEvent(AUDIO_SETTINGS_CHANGED_EVENT, { detail: updated })
    );

    return updated;
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}
