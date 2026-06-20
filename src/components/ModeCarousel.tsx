import { useRef, useState } from 'react';
import { allModes as modes } from '@/data/modes';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  selectedMode: string;
  onSelect: (modeId: string) => void;
}

export function ModeCarousel({ selectedMode, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -150 : 150, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="relative w-full">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar px-1 py-2 snap-x"
      >
        {modes.map((mode) => (
          <button
            key={mode.slug}
            onClick={() => onSelect(mode.slug)}
            className={cn(
              'flex-shrink-0 snap-start flex flex-col items-center justify-center',
              'w-[72px] h-[80px] rounded-xl border transition-all duration-200',
              'active:scale-95',
              selectedMode === mode.slug
                ? 'border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20',
            )}
          >
            <span className="text-2xl mb-1">✨</span>
            <span className="text-[9px] text-white/70 font-medium text-center leading-tight px-1">
              {mode.label}
            </span>
          </button>
        ))}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}
