import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ChatPage } from '@/pages/ChatPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PairPage } from '@/pages/PairPage';
import { BottomNav } from '@/components/BottomNav';
import { Sparkles } from '@/components/Sparkles';
import { ParentOverlay } from '@/components/ParentOverlay';
import { useParentPresence } from '@/hooks/useParentPresence';
import { useState, useCallback, useEffect } from 'react';
import type { Character } from '@/types';
import { characters } from '@/data/characters';
import './App.css';

function AppContent() {
  const [screen, setScreen] = useState<'pietro' | 'home' | 'chat' | 'settings'>('pietro');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [parentOverlay, setParentOverlay] = useState<'greeting' | 'checkin' | 'lockout' | null>(null);

  const { settings, startSession, getSessionTimeUsed, isWithinAllowedHours } = useParentPresence();
  const pietro = characters.find(c => c.slug === 'pietro')!;

  const goToHome = useCallback(() => {
    setScreen('home');
    setSelectedCharacter(null);
  }, []);

  const handleSelectCharacter = useCallback((character: Character) => {
    setSelectedCharacter(character);
    setScreen('chat');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('home');
    setSelectedCharacter(null);
  }, []);

  // Show parent greeting when arriving at home screen
  useEffect(() => {
    if (screen === 'home' && settings.requireGreeting && settings.persona !== 'none') {
      const hasGreeted = sessionStorage.getItem('casa_greeted');
      if (!hasGreeted) {
        sessionStorage.setItem('casa_greeted', 'true');
        startSession();
        setParentOverlay('greeting');
      }
    }
  }, [screen, settings.requireGreeting, settings.persona, startSession]);

  // Periodic check-ins
  useEffect(() => {
    if (settings.checkInInterval <= 0 || settings.persona === 'none') return;

    const interval = setInterval(() => {
      if (screen === 'chat' || screen === 'home') {
        setParentOverlay('checkin');
      }
    }, settings.checkInInterval * 60000);

    return () => clearInterval(interval);
  }, [settings.checkInInterval, settings.persona, screen]);

  // Session time lockout
  useEffect(() => {
    if (settings.maxSessionMinutes <= 0 || settings.persona === 'none') return;

    const check = setInterval(() => {
      const used = getSessionTimeUsed();
      if (used >= settings.maxSessionMinutes && (screen === 'chat' || screen === 'home')) {
        setParentOverlay('lockout');
      }
    }, 30000);

    return () => clearInterval(check);
  }, [settings.maxSessionMinutes, settings.persona, screen, getSessionTimeUsed]);

  // Allowed hours lockout
  useEffect(() => {
    if (settings.persona === 'none') return;

    const check = setInterval(() => {
      if (!isWithinAllowedHours() && (screen === 'chat' || screen === 'home')) {
        setParentOverlay('lockout');
      }
    }, 60000);

    return () => clearInterval(check);
  }, [settings.persona, screen, isWithinAllowedHours]);

  const showNav = screen === 'home' || screen === 'settings';
  const activeTab = screen === 'settings' ? 'settings' : 'home';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #1e293b 0%, #141c2e 50%, #0f172a 100%)' }}>
      <div className="hidden md:block fixed inset-0" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(212,168,83,0.08)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.06)' }} />
        </div>
      </div>

      <div className="mobile-container relative z-10">
        <Sparkles count={12} />

        {screen === 'pietro' && (
          <ChatPage
            character={pietro}
            onBack={goToHome}
            onOpenSettings={() => setScreen('settings')}
          />
        )}

        {screen === 'home' && (
          <HomePage onSelectCharacter={handleSelectCharacter} />
        )}

        {screen === 'chat' && selectedCharacter && (
          <ChatPage
            character={selectedCharacter}
            onBack={handleBack}
            onOpenSettings={() => setScreen('settings')}
          />
        )}

        {screen === 'settings' && (
          <SettingsPage onBack={() => setScreen(selectedCharacter ? 'chat' : 'home')} />
        )}

        {showNav && (
          <BottomNav
            active={activeTab}
            onNavigate={(s) => setScreen(s === 'settings' ? 'settings' : 'home')}
            hasChat={false}
          />
        )}

        {parentOverlay && (
          <ParentOverlay
            type={parentOverlay}
            onDismiss={() => {
              if (parentOverlay === 'lockout') {
                setScreen('home');
                setSelectedCharacter(null);
                localStorage.removeItem('casa_session_start');
              }
              setParentOverlay(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/pair" element={<PairPage />} />
      <Route path="*" element={<AppContent />} />
    </Routes>
  );
}

export default App;
