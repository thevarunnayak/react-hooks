export type AudioSegmentType =
  | 'question'
  | 'summary'
  | 'mental-model'
  | 'deep-dive'
  | 'step'
  | 'example'
  | 'code'
  | 'pitfall'
  | 'misconception'
  | 'follow-up'
  | 'follow-up-answer'
  | 'insight'
  | 'transition';

export interface AudioSegment {
  id: string; // e.g. "int-1-question", "int-1-summary", "int-1-step-0"
  questionId: string;
  questionNumber: number;
  type: AudioSegmentType;
  label: string; // e.g. "Executive Summary", "Architectural Deep Dive & Internals"
  text: string; // Raw text content for display/transcript
  speechText: string; // Natural mentor-style speech narration
  targetElementId: string; // Stable DOM id or data-audio-segment value
  charLength?: number;
  estimatedDurationMs?: number;
}

export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'completed';

export type PauseCadenceMode = 'natural' | 'snappy' | 'extended';

export interface VoicePersonaPack {
  id: string;
  name: string;
  role: string;
  description: string;
  preferredVoiceKeywords: string[];
  rate: number;
  pitch: number;
  pauseMode: PauseCadenceMode;
  tag: string;
  gender?: 'male' | 'female' | 'neutral';
  region?: string;
}

export interface AudioPlayerSettings {
  rate: number; // 0.75 to 2.0
  pitch: number; // 0.8 to 1.2
  voiceURI: string | null;
  pauseMode: PauseCadenceMode;
  autoFollow: boolean;
  isMinimized: boolean;
  showTranscript: boolean;
  highlightSentences: boolean;
  showScrubberThumb?: boolean; // Controls draggable thumb slider on progress bar
  activePersonaId?: string | null;
}

export interface AudioProgressInfo {
  currentTimeSec: number;
  totalDurationSec: number;
  progressPercent: number;
  currentSegmentIndex: number;
  totalSegments: number;
  currentQuestionIndex: number;
  totalQuestions: number;
}
