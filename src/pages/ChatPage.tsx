import { useState, useRef, useEffect } from 'react';
import type { Character, ConversationMode } from '@/types';
import { MicButton } from '@/components/MicButton';
import { ModeCarousel } from '@/components/ModeCarousel';
import { SpeechBubble } from '@/components/SpeechBubble';
import { useVoiceSocket } from '@/hooks/useVoiceSocket';
import { ArrowLeft, Send, Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  character: Character;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function ChatPage({ character, onBack, onOpenSettings }: Props) {
  const { voiceState, messages, error, startListening, stopListening, sendTextMessage, sendConfig, clearError } =
    useVoiceSocket();
  const [mode, setMode] = useState<ConversationMode>('introduction');

  // Send config to voice server when character or mode changes
  useEffect(() => {
    sendConfig(character.id, mode);
  }, [character.id, mode, sendConfig]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = () => {
    if (!textValue.trim()) return;
    sendTextMessage(textValue);
    setTextValue('');
  };

  const isCharacterSpeaking = voiceState === 'speaking';
  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #1e293b 0%, #1a2236 50%, #111827 100%)' }}>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-neutral-950/90 backdrop-blur-xl z-30">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 overflow-hidden',
              isCharacterSpeaking && 'border-green-400 shadow-lg shadow-green-400/20',
              isListening && 'border-red-400 shadow-lg shadow-red-400/20',
              !isCharacterSpeaking && !isListening && 'border-amber-500/30',
            )}
          >
            <img
              src={`/characters/${character.id}.jpg`}
              alt={character.name}
              className={cn(
                'w-full h-full object-cover',
                isCharacterSpeaking && 'avatar-talk',
                !isCharacterSpeaking && 'avatar-breathe',
              )}
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = 'none';
                el.parentElement!.style.backgroundColor = character.color + '30';
                el.parentElement!.innerHTML = `<span style="color:${character.color};font-weight:600;">${character.name[0]}</span>`;
              }}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{character.name}</h2>
            <p className="text-white/40 text-xs truncate">
              {voiceState === 'idle' && character.tagline}
              {voiceState === 'listening' && 'Listening...'}
              {voiceState === 'processing' && 'Thinking...'}
              {voiceState === 'speaking' && 'Speaking...'}
              {voiceState === 'error' && 'Something went wrong'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </header>

      {/* Chat Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4"
      >
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            {/* Large character avatar - living animation */}
            <div
              className={cn(
                'w-40 h-40 rounded-full border-4 mb-6 flex items-center justify-center overflow-hidden relative',
                'border-amber-500/20',
                isCharacterSpeaking && 'avatar-talk border-green-400/40',
                !isCharacterSpeaking && 'avatar-breathe',
              )}
            >
              <img
                src={`/characters/${character.id}.jpg`}
                alt={character.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = 'none';
                  el.parentElement!.style.background = `linear-gradient(135deg, ${character.color}40, ${character.color}20)`;
                  el.parentElement!.innerHTML = `<span style="color:${character.color};font-size:3rem;font-weight:700;">${character.name[0]}</span>`;
                }}
              />
              {/* Listening ring */}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-red-400/50 animate-pulse" />
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Hi! I'm {character.name}
            </h3>
            <p className="text-white/50 text-sm mb-8 max-w-[240px]">
              {character.description}
            </p>

            {/* Quick start prompts */}
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

        {/* Message bubbles */}
        {messages.map((msg) => (
          <SpeechBubble
            key={msg.id}
            text={msg.text}
            role={msg.role}
            characterColor={character.color}
          />
        ))}

        {/* Typing indicator */}
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
        <ModeCarousel
          selectedMode={mode}
          onSelect={(m) => {
            const newMode = m as ConversationMode;
            setMode(newMode);
            sendConfig(character.id, newMode);
          }}
        />
      </div>

      {/* Error toast */}
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

      {/* Text input (collapsible) */}
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

      {/* Bottom: Mic + text toggle */}
      <div className="flex-shrink-0 flex flex-col items-center px-4 pb-4 pt-2">
        <MicButton
          state={voiceState}
          onStart={startListening}
          onStop={stopListening}
        />

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
