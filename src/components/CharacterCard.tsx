import type { Character } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  character: Character;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function CharacterCard({ character, onClick, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'w-20 h-24',
    md: 'w-[100px] h-[120px]',
    lg: 'w-full h-40',
  };

  const imgSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 active:scale-95',
        'hover:shadow-xl hover:-translate-y-0.5',
        sizeClasses[size]
      )}
      style={{
        background: `linear-gradient(180deg, ${character.color}18 0%, ${character.color}08 100%)`,
        borderColor: `${character.color}30`,
      }}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center mb-1 overflow-hidden',
          'border-2 shadow-md',
          imgSizes[size]
        )}
        style={{
          borderColor: `${character.color}50`,
          boxShadow: `0 4px 16px ${character.color}30`,
        }}
      >
        <img
          src={character.imageUrl || `/characters/${character.id}.jpg`}
          alt={character.name}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.style.background = `linear-gradient(135deg, ${character.color}60, ${character.color}30)`;
            parent.innerHTML = `<span style="color:white;font-size:1.4rem;font-weight:800;text-shadow:0 2px 12px ${character.color};">${character.name[0]}</span>`;
          }}
        />
      </div>
      <span className="font-bold text-xs leading-tight text-center px-1" style={{ color: character.color }}>
        {character.name}
      </span>
      {size === 'lg' && (
        <span className="text-white/50 text-[10px] mt-0.5 text-center leading-tight px-2">
          {character.tagline}
        </span>
      )}
    </button>
  );
}
