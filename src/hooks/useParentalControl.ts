import { useState, useCallback } from 'react';
import type { ParentalSettings } from '@/types';

const STORAGE_KEY = 'casa_parental_settings';

function loadSettings(): ParentalSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    pinEnabled: false,
    pin: '',
    dailyLimitMinutes: 60,
    timeUsedMinutes: 0,
    lockApp: false,
    voiceOutput: true,
    wakeWord: false,
    jumpIn: false,
  };
}

function saveSettings(s: ParentalSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useParentalControl() {
  const [settings, setSettings] = useState<ParentalSettings>(loadSettings);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const authenticate = useCallback((pin: string) => {
    if (!settings.pinEnabled) {
      setIsAuthenticated(true);
      setAuthError(null);
      return true;
    }
    if (pin === settings.pin) {
      setIsAuthenticated(true);
      setAuthError(null);
      return true;
    }
    setAuthError('Wrong PIN. Try again.');
    return false;
  }, [settings.pin, settings.pinEnabled]);

  const lock = useCallback(() => {
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  const updateSettings = useCallback((partial: Partial<ParentalSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const setPin = useCallback((newPin: string) => {
    updateSettings({ pin: newPin, pinEnabled: !!newPin });
  }, [updateSettings]);

  const checkTimeLimit = useCallback(() => {
    if (!settings.pinEnabled) return false;
    return settings.timeUsedMinutes >= settings.dailyLimitMinutes;
  }, [settings]);

  const addTimeUsed = useCallback((minutes: number) => {
    setSettings(prev => {
      const next = { ...prev, timeUsedMinutes: prev.timeUsedMinutes + minutes };
      saveSettings(next);
      return next;
    });
  }, []);

  return {
    settings,
    isAuthenticated,
    authError,
    authenticate,
    lock,
    updateSettings,
    setPin,
    checkTimeLimit,
    addTimeUsed,
  };
}
