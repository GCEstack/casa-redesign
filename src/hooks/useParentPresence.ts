import { useState, useCallback } from 'react';

export type ParentPersona = 'none' | 'mamma' | 'papa' | 'nonna' | 'zia' | 'zio';

export interface ParentSettings {
  persona: ParentPersona;
  maxSessionMinutes: number;
  dailyLimitMinutes: number;
  allowedHoursStart: number; // 0-23
  allowedHoursEnd: number; // 0-23
  requireGreeting: boolean;
  lockoutMessage: string;
  checkInInterval: number; // minutes, 0 = off
}

const STORAGE_KEY = 'casa_parent_presence';

const DEFAULT_SETTINGS: ParentSettings = {
  persona: 'mamma',
  maxSessionMinutes: 30,
  dailyLimitMinutes: 60,
  allowedHoursStart: 7,
  allowedHoursEnd: 20,
  requireGreeting: true,
  lockoutMessage: "It's time for a little break, amore! Let's play again later! 💕",
  checkInInterval: 15,
};

function loadSettings(): ParentSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: ParentSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// Greeting messages per persona
export const parentGreetings: Record<ParentPersona, string[]> = {
  none: ['Welcome back!'],
  mamma: [
    "Ciao tesoro! Ready to explore today? 🌟",
    "Hey my little one! What are we learning today? 💕",
    "Buongiorno amore! Your friends are waiting! 🌸",
    "Welcome back, sweetie! Mamma missed you! 💝",
  ],
  papa: [
    "Hey champ! Ready for an adventure? 🚀",
    "What's up buddy! Let's see what your friends are up to! 💪",
    "Welcome back, kiddo! Time to have some fun! ⚡",
    "Hey there, little explorer! What are we doing today? 🎯",
  ],
  nonna: [
    "Ciao piccolo! Nonna has stories for you! 📖",
    "Welcome back, my dear! Come sit with Nonna! 🍪",
    "Hello my little one! Ready for a warm hug? 🤗",
    "Oh, look who's here! Nonna missed you so much! 💗",
  ],
  zia: [
    "Hey there, cool kid! Zia's here to party! 🎉",
    "What's up, little one! Ready to have fun? ✨",
    "Ciao bella/bello! Your Zia is waiting! 🌈",
    "Welcome back, sweetie! Let's have some fun! 🎈",
  ],
  zio: [
    "Hey kiddo! Zio's got jokes today! 😄",
    "What's up, little buddy! Ready to play? 🎮",
    "Ciao! Your favorite Zio is here! 🕶️",
    "Welcome back, champ! Let's see what you got! 🏆",
  ],
};

// Lockout messages per persona
export const parentLockouts: Record<ParentPersona, string[]> = {
  none: ['Time is up! See you later!'],
  mamma: [
    "Time for dinner, amore! Your friends will wait! 🍝",
    "It's bedtime, tesoro! Sweet dreams! 🌙",
    "Let's take a little break, sweetie! Mamma loves you! 💕",
    "Time to rest your eyes, piccolo! See you soon! 💝",
  ],
  papa: [
    "Time's up, champ! Go outside and play! 🌳",
    "Bedtime, kiddo! Tomorrow's a new adventure! 🌅",
    "Let's take a break, buddy! Papa's orders! 💪",
    "Time to power down, little one! See you tomorrow! ⚡",
  ],
  nonna: [
    "Time for a nap, piccolo! Nonna will tell you a story later! 📖",
    "Come help Nonna in the kitchen! 🍪",
    "Time to rest, my dear! Nonna loves you! 🤗",
    "Let's have some quiet time, little one! 💗",
  ],
  zia: [
    "Party's over for now, little one! 🎉",
    "Zia says it's break time! See you later! ✨",
    "Time to recharge, cool kid! 🌈",
    "Let's hit pause, sweetie! Zia will be back! 🎈",
  ],
  zio: [
    "That's a wrap, kiddo! Zio's closing shop! 😎",
    "Time to go, little buddy! See you next time! 🎮",
    "Break time, champ! Zio's orders! 🏆",
    "Let's call it a day, little one! 💤",
  ],
};

// Check-in messages per persona
export const parentCheckIns: Record<ParentPersona, string[]> = {
  none: ['How are you doing?'],
  mamma: [
    "How's my little one doing? Having fun? 💕",
    "Mamma just wanted to check in! Everything okay? 🌸",
    "Are you being good, tesoro? Mamma loves you! 💝",
  ],
  papa: [
    "How's it going, champ? Learning lots? 💪",
    "Papa check-in! You doing okay, buddy? ⚡",
    "Having fun, kiddo? Papa's proud of you! 🎯",
  ],
  nonna: [
    "How's my little one? Need a snack? 🍪",
    "Nonna just wanted to see your smiling face! 🤗",
    "Are you happy, piccolo? Nonna loves you! 💗",
  ],
  zia: [
    "How's the party going, cool kid? 🎉",
    "Zia check-in! Having a blast? ✨",
    "You doing good, sweetie? Zia's thinking of you! 🌈",
  ],
  zio: [
    "How's it hanging, little buddy? 😎",
    "Zio check-in! You being awesome? 🎮",
    "Having fun, champ? Zio's rooting for you! 🏆",
  ],
};

export function useParentPresence() {
  const [settings, setSettingsState] = useState<ParentSettings>(loadSettings);

  const setSettings = useCallback((partial: Partial<ParentSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const getRandomGreeting = useCallback(() => {
    const msgs = parentGreetings[settings.persona];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }, [settings.persona]);

  const getRandomLockout = useCallback(() => {
    const msgs = parentLockouts[settings.persona];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }, [settings.persona]);

  const getRandomCheckIn = useCallback(() => {
    const msgs = parentCheckIns[settings.persona];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }, [settings.persona]);

  const isWithinAllowedHours = useCallback(() => {
    const hour = new Date().getHours();
    return hour >= settings.allowedHoursStart && hour < settings.allowedHoursEnd;
  }, [settings.allowedHoursStart, settings.allowedHoursEnd]);

  const getSessionTimeUsed = useCallback(() => {
    const start = localStorage.getItem('casa_session_start');
    if (!start) return 0;
    return Math.floor((Date.now() - parseInt(start)) / 60000);
  }, []);

  const startSession = useCallback(() => {
    localStorage.setItem('casa_session_start', Date.now().toString());
  }, []);

  return {
    settings,
    setSettings,
    getRandomGreeting,
    getRandomLockout,
    getRandomCheckIn,
    isWithinAllowedHours,
    getSessionTimeUsed,
    startSession,
  };
}
