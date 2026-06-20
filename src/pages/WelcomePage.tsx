import { useState } from 'react';
import type { Character } from '@/types';
import { ArrowRight, Volume2 } from 'lucide-react';

interface Props {
  pietro: Character;
  onStart: () => void;
}

export function WelcomePage({ pietro, onStart }: Props) {
  const [step, setStep] = useState<'greet' | 'spiel' | 'ready'>('greet');

  const handleGreetClick = () => setStep('spiel');
  const handleSpielDone = () => setStep('ready');

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

      {/* STEP 1: Greeting */}
      {step === 'greet' && (
        <div className="flex flex-col items-center text-center animate-fade-in-up z-10">
          {/* Pietro Avatar */}
          <div
            className="w-32 h-32 rounded-full mb-6 overflow-hidden border-2 flex items-center justify-center"
            style={{
              borderColor: '#D4A85380',
              boxShadow: '0 0 40px rgba(212,168,83,0.3)',
              animation: 'breathe 4s ease-in-out infinite',
            }}
          >
            <img
              src={pietro.portrait}
              alt={pietro.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = 'none';
                el.parentElement!.style.background = 'linear-gradient(135deg, #D4A85340, #D4A85320)';
                el.parentElement!.innerHTML = '<span style="color:#D4A853;font-size:2.5rem;font-weight:800;">P</span>';
              }}
            />
          </div>

          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ textShadow: '0 0 20px rgba(212,168,83,0.5)' }}
          >
            Ciao! 👋
          </h1>
          <p className="text-lg text-amber-400 mb-8" style={{ textShadow: '0 0 10px rgba(212,168,83,0.3)' }}>
            Welcome to Casa Companion
          </p>

          <button
            onClick={handleGreetClick}
            className="flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #f59e0b)',
              boxShadow: '0 4px 20px rgba(212,168,83,0.4), 0 0 40px rgba(212,168,83,0.2)',
            }}
          >
            <Volume2 className="w-5 h-5" />
            Tap to meet Pietro
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 2: Pietro's Spiel */}
      {step === 'spiel' && (
        <div className="flex flex-col items-center text-center animate-fade-in-up z-10 max-w-sm">
          {/* Pietro Avatar - larger, talking */}
          <div
            className="w-36 h-36 rounded-full mb-6 overflow-hidden border-2 flex items-center justify-center"
            style={{
              borderColor: '#D4A853',
              boxShadow: '0 0 50px rgba(212,168,83,0.4)',
              animation: 'talk 0.5s ease-in-out infinite alternate',
            }}
          >
            <img
              src={pietro.portrait}
              alt={pietro.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = 'none';
                el.parentElement!.style.background = 'linear-gradient(135deg, #D4A85360, #D4A85330)';
                el.parentElement!.innerHTML = '<span style="color:#D4A853;font-size:3rem;font-weight:800;">P</span>';
              }}
            />
          </div>

          {/* Speech bubble */}
          <div
            className="relative bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-5 mb-6 border"
            style={{ borderColor: 'rgba(212,168,83,0.3)' }}
          >
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
              style={{ background: 'rgba(255,255,255,0.1)', borderTop: '1px solid rgba(212,168,83,0.3)', borderLeft: '1px solid rgba(212,168,83,0.3)' }}
            />
            <p className="text-white text-base leading-relaxed mb-3">
              "Hi, I'm <span className="text-amber-400 font-bold">Pietro</span>, founder of Casa Companion. How you doing today?"
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              "We're building something special here — a place where you can talk, play, and learn with friends from all around the world. Pick a companion and let's get started!"
            </p>
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
      )}

      {/* STEP 3: Ready to enter */}
      {step === 'ready' && (
        <div className="flex flex-col items-center text-center animate-fade-in-up z-10">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-white mb-2">Ready to explore?</h2>
          <p className="text-white/50 mb-8">Pick a friend and start talking</p>
          <button
            onClick={onStart}
            className="px-10 py-4 rounded-full text-white font-bold text-lg transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #f59e0b)',
              boxShadow: '0 4px 20px rgba(212,168,83,0.4), 0 0 40px rgba(212,168,83,0.2)',
            }}
          >
            Enter Casa 🏠
          </button>
        </div>
      )}
    </div>
  );
}
