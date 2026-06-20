import { useState, useCallback } from 'react';

const STORAGE_KEY = 'casa_kid_profile';

interface KidProfile {
  name: string;
  firstVisit: boolean;
  continuousSpeech: boolean;
}

function loadProfile(): KidProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { name: '', firstVisit: true, continuousSpeech: false };
}

function saveProfile(p: KidProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useKidProfile() {
  const [profile, setProfile] = useState<KidProfile>(loadProfile);

  const setName = useCallback((name: string) => {
    setProfile(prev => {
      const next = { ...prev, name, firstVisit: false };
      saveProfile(next);
      return next;
    });
  }, []);

  const toggleContinuous = useCallback(() => {
    setProfile(prev => {
      const next = { ...prev, continuousSpeech: !prev.continuousSpeech };
      saveProfile(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setProfile({ name: '', firstVisit: true, continuousSpeech: false });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    name: profile.name,
    isFirstVisit: profile.firstVisit,
    continuousSpeech: profile.continuousSpeech,
    setName,
    toggleContinuous,
    reset,
  };
}
