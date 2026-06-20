import { Mic, Loader2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VoiceState } from '@/types';

interface Props {
  state: VoiceState;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function MicButton({ state, onStart, onStop, disabled }: Props) {
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';

  return (
    <button
      onClick={isListening ? onStop : onStart}
      disabled={disabled || isProcessing}
      className={cn(
        'relative w-[120px] h-[120px] rounded-full flex items-center justify-center',
        'transition-all duration-300 border-4',
        'touch-target-lg',
        state === 'idle' && 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-400/50 mic-idle',
        state === 'listening' && 'bg-gradient-to-br from-red-500 to-red-700 border-red-400/50 mic-listening',
        state === 'processing' && 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400/50',
        state === 'speaking' && 'bg-gradient-to-br from-green-500 to-green-700 border-green-400/50',
        state === 'error' && 'bg-gradient-to-br from-gray-500 to-gray-700 border-gray-400/50',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {/* Ripple rings */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-ping" />
          <span className="absolute -inset-4 rounded-full border border-red-400/10 animate-pulse" />
        </>
      )}
      {state === 'speaking' && (
        <span className="absolute -inset-3 rounded-full border-2 border-green-400/20 animate-pulse" />
      )}

      {/* Icon */}
      <div className="relative z-10">
        {isProcessing ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : isListening ? (
          <Square className="w-10 h-10 text-white fill-white" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
      </div>

      {/* Label */}
      <span className={cn(
        'absolute -bottom-7 text-xs font-medium whitespace-nowrap',
        state === 'idle' && 'text-amber-400',
        state === 'listening' && 'text-red-400',
        state === 'processing' && 'text-blue-400',
        state === 'speaking' && 'text-green-400',
        state === 'error' && 'text-gray-400',
      )}>
        {state === 'idle' && 'Tap to talk'}
        {state === 'listening' && 'Listening...'}
        {state === 'processing' && 'Thinking...'}
        {state === 'speaking' && 'Speaking...'}
        {state === 'error' && 'Try again'}
      </span>
    </button>
  );
}
