export interface Character {
  slug: string;
  name: string;
  description: string;
  subtitle: string;
  italianMeaning: string;
  accentColor: string;
  accentHue: number;
  category: string;
  traits: string[];
  portrait: string;
  showcase: string;
  voiceIntro: string;
  videoSrc: string | undefined;
  speakingVideo?: string;
  modes: {
    play: string[];
    learn: string[];
    support: string[];
  };
}

export interface CharacterFeature {
  name: string;
  description: string;
  triggers: string[];
  slashCommands: string[];
  behavior: string;
}

export interface CharacterConfig {
  name: string;
  slug: string;
  meaning: string;
  voice: 'alloy' | 'ash' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer';
  prompt: string;
  features: CharacterFeature[];
}

export interface VoiceConfig {
  name: string;
  pitch: number;
  rate: number;
  lang: string;
}

export interface ModeConfig {
  slug: string;
  label: string;
  icon: string;
  category: string;
  accentColor: string;
  accentMuted: string;
  dotColor: string;
  description: string;
}

export interface ParentalSettings {
  pinEnabled: boolean;
  pin: string;
  dailyLimitMinutes: number;
  timeUsedMinutes: number;
  lockApp: boolean;
  voiceOutput: boolean;
  wakeWord: boolean;
  jumpIn: boolean;
}

export type ConversationMode = string;

export interface ChatMessage {
  id: string;
  role: 'user' | 'character';
  text: string;
  timestamp: number;
}

export type AppScreen = 'pietro' | 'home' | 'chat' | 'settings';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
