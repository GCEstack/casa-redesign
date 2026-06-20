import { useState, useCallback } from 'react';
import { HomePage } from '@/pages/HomePage';
import { ChatPage } from '@/pages/ChatPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { BottomNav } from '@/components/BottomNav';
import { Sparkles } from '@/components/Sparkles';
import type { Character } from '@/types';
import './App.css';

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [screen, setScreen] = useState<'home' | 'chat' | 'settings'>('home');

  const handleSelectCharacter = useCallback((character: Character) => {
    setSelectedCharacter(character);
    setScreen('chat');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('home');
  }, []);

  const handleOpenSettings = useCallback(() => {
    setScreen('settings');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #1e293b 0%, #141c2e 50%, #0f172a 100%)' }}>
      {/* Desktop backdrop */}
      <div className="hidden md:block fixed inset-0" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Mobile container */}
      <div className="mobile-container relative z-10">
        <Sparkles count={15} />

        {screen === 'home' && (
          <HomePage onSelectCharacter={handleSelectCharacter} />
        )}

        {screen === 'chat' && selectedCharacter && (
          <ChatPage
            character={selectedCharacter}
            onBack={handleBack}
            onOpenSettings={handleOpenSettings}
          />
        )}

        {screen === 'settings' && (
          <SettingsPage onBack={() => setScreen(selectedCharacter ? 'chat' : 'home')} />
        )}

        {/* Show nav on home and settings, hide during chat */}
        {screen !== 'chat' && (
          <BottomNav
            active={screen}
            onNavigate={setScreen}
            hasChat={!!selectedCharacter}
          />
        )}
      </div>
    </div>
  );
}

export default App;
