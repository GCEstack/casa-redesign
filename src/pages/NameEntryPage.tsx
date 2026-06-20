import { useState } from 'react';
import { useKidProfile } from '@/hooks/useKidProfile';
import { Keyboard, Mic } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export function NameEntryPage({ onNext }: Props) {
  const { setName } = useKidProfile();
  const [textValue, setTextValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleSubmit = () => {
    if (!textValue.trim()) return;
    setName(textValue.trim());
    setTextValue('');
    onNext();
  };

  return (
    <div
      className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1a103c 50%, #0a0a1a 100%)' }}
    >
      {/* Floating neon blobs */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #ff007f 0%, transparent 70%)',
          top: '10%',
          left: '-10%',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-48 h-48 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #00e5ff 0%, transparent 70%)',
          bottom: '20%',
          right: '-5%',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      <div className="flex flex-col items-center text-center animate-fade-in-up z-10 max-w-xs">
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ textShadow: '0 0 20px rgba(212,168,83,0.5)' }}
        >
          Welcome! 👋
        </h1>
        <p className="text-amber-400 mb-10 text-lg">
          What's your name?
        </p>

        {/* Big mic button */}
        <button
          className="relative w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #D4A853, #f59e0b)',
            boxShadow: '0 0 30px rgba(212,168,83,0.4), 0 0 60px rgba(212,168,83,0.2)',
          }}
        >
          <Mic className="w-10 h-10 text-white" />
          <span className="absolute -bottom-6 text-xs text-white/40 whitespace-nowrap">
            Say your name
          </span>
        </button>

        {/* Type instead */}
        <button
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/50 transition-colors mb-4"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="text-xs">{showKeyboard ? 'Hide keyboard' : 'Type instead'}</span>
        </button>

        {/* Keyboard input */}
        {showKeyboard && (
          <div className="w-full animate-slide-up">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Your name..."
              autoFocus
              className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg text-center placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition-colors mb-3"
            />
            <button
              onClick={handleSubmit}
              disabled={!textValue.trim()}
              className="w-full h-12 rounded-xl bg-amber-500 text-neutral-950 font-bold disabled:opacity-30 active:scale-95 transition-transform"
            >
              That's me! 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
