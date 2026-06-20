import { useState, useRef, useEffect } from 'react';
import type { Character, ConversationMode } from '@/types';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import { MicButton } from '@/components/MicButton';
import { ModeCarousel } from '@/components/ModeCarousel';
import { SpeechBubble } from '@/components/SpeechBubble';
import { useVoiceSocket } from '@/hooks/useVoiceSocket';
import { useKidProfile } from '@/hooks/useKidProfile';
import { ArrowLeft, Send, Keyboard, X } from 'lucide-react';

interface Props {
  character: Character;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function ChatPage({ character, onBack, onOpenSettings }: Props) {
  const { voiceState, messages, error, startListening, stopListening, sendTextMessage, clearError } =
    useVoiceSocket();
  const { name: kidName, isFirstVisit, continuousSpeech, setName, toggleContinuous } = useKidProfile();
  const [mode, setMode] = useState<ConversationMode>('introduction');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [introStep, setIntroStep] = useState<'name' | 'spiel' | 'chat'>(
    isFirstVisit && character.slug === 'pietro' ? 'name' : 'chat'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, introStep]);

  // Continuous speech: auto-listen after character finishes speaking
  const startListeningRef = useRef(startListening);
  startListeningRef.current = startListening;
  const prevVoiceStateRef = useRef(voiceState);
  useEffect(() => {
    const prev = prevVoiceStateRef.current;
    prevVoiceStateRef.current = voiceState;

    // When transitioning from speaking to idle, and continuous is on
    if (prev === 'speaking' && voiceState === 'idle' && continuousSpeech) {
      // Small delay so the kid knows the character is done
      const timeout = setTimeout(() => {
        startListeningRef.current();
      }, 800);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceState, continuousSpeech]);

  const handleSpielDone = () => {
    setIntroStep('chat');
  };

  const handleSendText = () => {
    if (!textValue.trim()) return;

    // If on name step, capture as name
    if (introStep === 'name') {
      setName(textValue.trim());
      setTextValue('');
      setIntroStep('spiel');
      return;
    }

    sendTextMessage(textValue);
    setTextValue('');
  };

  const isCharacterSpeaking = voiceState === 'speaking';
  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';

  // FIRST VISIT: "Say your name" screen
  if (introStep === 'name') {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1e293b 0%, #141c2e 50%, #0f172a 100%)' }}
      >
        {/* Floating blobs */}
        <div
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)',
            top: '15%',
            left: '-15%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />

        {/* Pietro Avatar - BOX shape, auto-play video */}
        <CharacterAvatar
          character={character}
          size="xl"
          shape="box"
          autoPlay
          className="mb-6"
        />

        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          Introduce yourself!
        </h1>
        <p className="text-amber-400 mb-8 text-center">
          Say your name below
        </p>

        {/* Big mic button for name capture */}
        <MicButton
          state={voiceState}
          onStart={startListening}
          onStop={() => {
            stopListening();
            // Simulated: in real app, transcript would come from voice socket
            if (textValue) {
              setName(textValue);
              setIntroStep('spiel');
            }
          }}
        />

        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="mt-8 flex items-center gap-1.5 text-white/30 hover:text-white/50 transition-colors"
        >
          {showTextInput ? <X className="w-3.5 h-3.5" /> : <Keyboard className="w-3.5 h-3.5" />}
          <span className="text-[11px]">{showTextInput ? 'Close' : 'Type your name'}</span>
        </button>

        {showTextInput && (
          <div className="mt-4 w-full max-w-xs animate-slide-up">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3">
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="What's your name?"
                autoFocus
                className="flex-1 h-12 bg-transparent text-white text-lg text-center placeholder:text-white/30 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSendText}
              disabled={!textValue.trim()}
              className="w-full mt-3 h-12 rounded-xl bg-amber-500 text-neutral-950 font-bold disabled:opacity-30 active:scale-95 transition-transform"
            >
              That's me! 🎉
            </button>
          </div>
        )}
      </div>
    );
  }

  // SPIEL: Pietro introduces Casa Companion
  if (introStep === 'spiel') {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1e293b 0%, #141c2e 50%, #0f172a 100%)' }}
      >
        <div
          className="absolute w-48 h-48 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)',
            bottom: '20%',
            right: '-10%',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />

        <CharacterAvatar
          character={character}
          size="xl"
          shape="box"
          autoPlay
          isSpeaking
          className="mb-6"
        />

        {/* Speech bubble */}
        <div className="w-full max-w-xs mb-6">
          <div
            className="bg-white/10 backdrop-blur-lg rounded-2xl px-5 py-4 border relative"
            style={{ borderColor: `${character.accentColor}40` }}
          >
            <p className="text-white text-base leading-relaxed mb-3 text-center">
              "Hi, I'm <span className="font-bold" style={{ color: character.accentColor }}>{character.name}</span>, founder of Casa Companion. How you doing today?"
            </p>
            <p className="text-white/60 text-sm leading-relaxed text-center">
              {kidName ? `Welcome, ${kidName}! ` : ''}We're building something special — a place where you can talk, play, and learn with friends from all around the world. Pick a companion and let's get started!"
            </p>
          </div>
        </div>

        <button
          onClick={handleSpielDone}
          className="px-8 py-3 rounded-full text-white font-bold transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #D4A853, #f59e0b)',
            boxShadow: '0 4px 20px rgba(212,168,83,0.4)',
          }}
        >
          Let's go! 🚀
        </button>
      </div>
    );
  }

  // MAIN CHAT
  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #1e293b 0%, #1a2236 50%, #111827 100%)' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5 backdrop-blur-xl z-30"
        style={{ background: 'rgba(30, 41, 59, 0.9)' }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CharacterAvatar
            character={character}
            size="sm"
            isSpeaking={isCharacterSpeaking}
            isListening={isListening}
          />
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{character.name}</h2>
            <p className="text-white/40 text-xs truncate">
              {voiceState === 'idle' && (kidName ? `Hey ${kidName}! 👋` : character.italianMeaning)}
              {voiceState === 'listening' && 'Listening...'}
              {voiceState === 'processing' && 'Thinking...'}
              {voiceState === 'speaking' && 'Speaking...'}
              {voiceState === 'error' && 'Oops, try again'}
            </p>
          </div>
        </div>

        {/* Continuous / Turn-based toggle */}
        <button
          onClick={toggleContinuous}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          style={{
            background: continuousSpeech ? `${character.accentColor}20` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${continuousSpeech ? character.accentColor : 'rgba(255,255,255,0.1)'}`,
            color: continuousSpeech ? character.accentColor : 'rgba(255,255,255,0.4)',
          }}
          title={continuousSpeech ? 'Continuous speech ON' : 'Turn-based mode'}
        >
          {continuousSpeech ? '🔴 LIVE' : '🎙️ Tap'}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <CharacterAvatar
              character={character}
              size="xl"
              shape="box"
              autoPlay
              isSpeaking={isCharacterSpeaking}
              isListening={isListening}
              className="mb-6"
            />

            <h3 className="text-xl font-bold text-white mb-2">
              {kidName ? `Hey ${kidName}!` : `Hi! I'm ${character.name}`}
            </h3>
            <p className="text-white/50 text-sm mb-8 max-w-[240px]">
              {character.italianMeaning}
            </p>

            <div className="space-y-2 w-full max-w-[280px]">
              {['Tell me a story!', 'What can you do?', 'Sing me a song!'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendTextMessage(prompt)}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:border-amber-500/30 transition-all active:scale-[0.98]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <SpeechBubble key={msg.id} text={msg.text} role={msg.role} characterColor={character.accentColor} />
        ))}

        {isProcessing && (
          <div className="flex justify-start mb-3">
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mode Carousel */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-white/5">
        <ModeCarousel selectedMode={mode} onSelect={(m) => setMode(m as ConversationMode)} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-red-400 text-xs">{error}</p>
            <button onClick={clearError} className="text-red-400/60 hover:text-red-400 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Text input */}
      {showTextInput && (
        <div className="flex-shrink-0 px-4 pb-2 animate-slide-up">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Type a message..."
              autoFocus
              className="flex-1 h-12 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none"
            />
            <button
              onClick={handleSendText}
              disabled={!textValue.trim()}
              className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
            >
              <Send className="w-4 h-4 text-neutral-950" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom: Mic */}
      <div className="flex-shrink-0 flex flex-col items-center px-4 pb-4 pt-2">
        <MicButton state={voiceState} onStart={startListening} onStop={stopListening} />
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="mt-8 flex items-center gap-1.5 text-white/30 hover:text-white/50 transition-colors"
        >
          {showTextInput ? <X className="w-3.5 h-3.5" /> : <Keyboard className="w-3.5 h-3.5" />}
          <span className="text-[11px]">{showTextInput ? 'Close keyboard' : 'Type instead'}</span>
        </button>
      </div>
    </div>
  );
}
