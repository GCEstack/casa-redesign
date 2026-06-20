import { cn } from '@/lib/utils';

interface Props {
  text: string;
  role: 'user' | 'character';
  characterColor?: string;
}

export function SpeechBubble({ text, role, characterColor = '#D4A853' }: Props) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-amber-500/20 text-white rounded-br-sm'
            : 'bg-white/10 text-white/90 rounded-bl-sm',
        )}
        style={!isUser ? { borderLeft: `3px solid ${characterColor}40` } : undefined}
      >
        {text}
      </div>
    </div>
  );
}
