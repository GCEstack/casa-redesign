// Character Types
export interface Character {
  id: string;
  name: string;
  tagline: string;
  category: CharacterCategory;
  color: string;
  gradient: string;
  description: string;
  voice: string;
  personality: string;
  imageUrl?: string;
}

export type CharacterCategory = 
  | 'founder'
  | 'animal' 
  | 'family'
  | 'teacher'
  | 'musician'
  | 'creature'
  | 'fantasy';

export interface ChatMessage {
  id: string;
  role: 'user' | 'character';
  text: string;
  audioUrl?: string;
  timestamp: number;
}

export type ConversationMode = 
  | 'introduction'
  | 'story_time'
  | 'music_rhythm'
  | 'geography'
  | 'stem_sparks'
  | 'all_languages'
  | 'homework_helper'
  | 'coding'
  | 'calm_breathe'
  | 'milestones'
  | 'teaching_mode';

export interface ModeConfig {
  id: ConversationMode;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export interface VoiceSettings {
  voiceOutput: boolean;
  wakeWord: boolean;
  wakePhrase: string;
  jumpIn: boolean;
  voiceClone: boolean;
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

export interface SessionInfo {
  status: 'online' | 'offline' | 'connecting' | 'error';
  messageCount: number;
  estimatedCost: number;
  durationSeconds: number;
  sttEngine: string;
  llmEngine: string;
  ttsEngine: string;
}

export type AppScreen = 'home' | 'chat' | 'settings' | 'mode_select';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
