import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mic, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { usePairingVoice } from '@/hooks/usePairingVoice';
import { cn } from '@/lib/utils';

export function PairPage() {
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get('code');
  const [inputCode, setInputCode] = useState('');
  const { connectionState, voiceState, error, transcript, start, stop } = usePairingVoice();

  useEffect(() => {
    if (urlCode && connectionState === 'idle') {
      void start(urlCode);
    }
  }, [urlCode, connectionState, start]);

  const statusLabel = {
    idle: urlCode ? 'Ready' : 'Enter code to join',
    fetching: 'Looking up code...',
    connecting: 'Connecting...',
    connected: voiceState === 'speaking' ? 'Speaking' : voiceState === 'listening' ? 'Listening' : 'Connected',
    error: error || 'Connection error',
  }[connectionState];

  if (connectionState === 'idle' && !urlCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 text-white">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <h1 className="text-2xl font-bold text-center">Parent Phone Mic</h1>
          <p className="text-sm text-white/60 text-center">Enter the code shown on your kid&apos;s screen to join their session.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const cleaned = inputCode.trim().toUpperCase();
              if (cleaned.length === 6) void start(cleaned);
            }}
            className="w-full flex flex-col gap-4"
          >
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full text-center text-3xl tracking-[0.5em] uppercase bg-white/5 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-amber-500"
              placeholder="ABC123"
            />
            <button
              type="submit"
              disabled={inputCode.trim().length !== 6}
              className="w-full bg-amber-500 text-neutral-950 font-semibold rounded-xl py-3 px-6 disabled:opacity-50 active:scale-95 transition-transform"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 text-white">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-center">Parent Phone Mic</h1>
        <div className="text-center">
          <div className={cn('text-lg font-semibold', connectionState === 'error' && 'text-red-400')}>
            {statusLabel}
          </div>
          {transcript && <div className="text-sm text-white/70 mt-2">&ldquo;{transcript}&rdquo;</div>}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {}}
            className="p-4 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-transform"
            aria-label="Mute"
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={() => {}}
            className="p-4 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-transform"
            aria-label="Interrupt"
          >
            <VolumeX className="w-6 h-6" />
          </button>
          <button
            onClick={stop}
            className="p-4 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 active:scale-95 transition-transform"
            aria-label="Disconnect"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/40">
          <Volume2 className="w-4 h-4" />
          <span>Use this phone as the microphone for the kid&apos;s character.</span>
        </div>
      </div>
    </div>
  );
}
