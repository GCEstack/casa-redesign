import { useState, useRef, useEffect } from 'react';
import type { Character } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  character: Character;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  isListening?: boolean;
  className?: string;
  autoPlay?: boolean;
  shape?: 'circle' | 'box';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-36 h-36',
  xl: 'w-48 h-48',
};

export function CharacterAvatar({
  character,
  size = 'md',
  isSpeaking,
  isListening,
  className,
  autoPlay = false,
  shape = 'circle',
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [idleFailed, setIdleFailed] = useState(false);
  const [speakingFailed, setSpeakingFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeVideoSrc = isSpeaking
    ? character.speakingVideo || character.videoSrc
    : character.videoSrc;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoSrc) return;

    if (autoPlay) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (isSpeaking) setSpeakingFailed(true);
          else setIdleFailed(true);
        });
    }
  }, [autoPlay, activeVideoSrc, isSpeaking]);

  const handleTap = () => {
    const video = videoRef.current;
    if (!video || !activeVideoSrc) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (isSpeaking) setSpeakingFailed(true);
          else setIdleFailed(true);
        });
    }
  };

  const videoFailed = isSpeaking ? speakingFailed : idleFailed;
  const animClass = isSpeaking ? 'avatar-talk' : isListening ? 'avatar-listen' : 'avatar-breathe';
  const shapeClass = shape === 'box' ? 'rounded-3xl' : 'rounded-full';

  return (
    <div
      className={cn(
        'relative overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer',
        sizeClasses[size],
        shapeClass,
        animClass,
        className,
      )}
      style={{
        border: `3px solid ${character.accentColor}60`,
        boxShadow: isListening
          ? `0 0 30px ${character.accentColor}40`
          : `0 8px 32px ${character.accentColor}20`,
      }}
      onClick={handleTap}
    >
      {/* Active video (idle or speaking) */}
      {activeVideoSrc && !videoFailed && (
        <video
          ref={videoRef}
          key={activeVideoSrc}
          src={activeVideoSrc}
          loop
          muted
          playsInline
          autoPlay={autoPlay}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => {
            if (isSpeaking) setSpeakingFailed(true);
            else setIdleFailed(true);
          }}
        />
      )}

      {/* Fallback to portrait */}
      {(!activeVideoSrc || videoFailed) && (
        <img
          src={character.portrait}
          alt={character.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.style.background = `linear-gradient(135deg, ${character.accentColor}60, ${character.accentColor}30)`;
            parent.innerHTML = `<span style="color:white;font-weight:800;font-size:2rem;">${character.name[0]}</span>`;
          }}
        />
      )}

      {/* Tap to play indicator */}
      {activeVideoSrc && !isPlaying && !videoFailed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="text-white text-xs font-bold">▶</span>
        </div>
      )}

      {/* Listening ring */}
      {isListening && (
        <div
          className={cn('absolute inset-0 animate-pulse', shapeClass)}
          style={{ border: `3px solid ${character.accentColor}`, boxShadow: `0 0 20px ${character.accentColor}` }}
        />
      )}
    </div>
  );
}
