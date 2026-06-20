import { useRef, useEffect, useState } from 'react';
import type { Character } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Try to load video
  useEffect(() => {
    if (character.videoSrc) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.src = character.videoSrc;
      v.onloadeddata = () => setVideoLoaded(true);
      v.onerror = () => setVideoLoaded(false);
    }
  }, [character.videoSrc]);

  const handleMouseEnter = () => {
    if (videoLoaded && videoRef.current) {
      setShowVideo(true);
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setShowVideo(false);
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        handleMouseEnter();
        e.currentTarget.style.borderColor = character.accentColor;
        e.currentTarget.style.boxShadow = `0 0 24px ${character.accentColor}50, inset 0 0 30px ${character.accentColor}20`;
      }}
      onMouseLeave={(e) => {
        handleMouseLeave();
        e.currentTarget.style.borderColor = `${character.accentColor}80`;
        e.currentTarget.style.boxShadow = `0 0 12px ${character.accentColor}20, inset 0 0 20px ${character.accentColor}10`;
      }}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl transition-all duration-200 active:scale-95',
        'hover:-translate-y-1 w-full aspect-[3/4] relative overflow-hidden group'
      )}
      style={{
        background: `linear-gradient(180deg, ${character.accentColor}20 0%, ${character.accentColor}08 100%)`,
        border: `3px solid ${character.accentColor}`,
        boxShadow: `0 0 16px ${character.accentColor}40, inset 0 0 20px ${character.accentColor}15`,
      }}
    >
      {/* Character image/video container - LARGE */}
      <div
        className="w-[80%] aspect-square rounded-2xl overflow-hidden mb-2 relative"
        style={{
          border: `2px solid ${character.accentColor}`,
          boxShadow: `0 4px 24px ${character.accentColor}40`,
        }}
      >
        {/* Video (hidden until hover) */}
        {character.videoSrc && (
          <video
            ref={videoRef}
            src={character.videoSrc}
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: showVideo ? 1 : 0 }}
          />
        )}
        {/* Portrait image */}
        <img
          src={character.portrait}
          alt={character.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: showVideo ? 0 : 1 }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.style.background = `linear-gradient(135deg, ${character.accentColor}60, ${character.accentColor}30)`;
            parent.innerHTML = `<span style="color:white;font-size:2rem;font-weight:800;">${character.name[0]}</span>`;
          }}
        />
      </div>

      {/* Name */}
      <span className="font-bold text-sm leading-tight text-center px-1" style={{ color: character.accentColor }}>
        {character.name}
      </span>

      {/* Italian meaning */}
      <span className="text-[10px] text-white/40 text-center px-2 mt-0.5 line-clamp-1">
        {character.italianMeaning}
      </span>
    </button>
  );
}
