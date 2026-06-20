import { useKidProfile } from '@/hooks/useKidProfile';
import { characters } from '@/data/characters';
import { CharacterAvatar } from '@/components/CharacterAvatar';

interface Props {
  onNext: () => void;
}

export function PietroIntroPage({ onNext }: Props) {
  const { name: kidName } = useKidProfile();
  const pietro = characters.find(c => c.slug === 'pietro')!;

  return (
    <div
      className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1a103c 50%, #0a0a1a 100%)' }}
    >
      <div
        className="absolute w-48 h-48 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)',
          bottom: '20%',
          right: '-10%',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      <div className="flex flex-col items-center text-center animate-fade-in-up z-10 max-w-sm">
        {/* Pietro Avatar - BOX shape */}
        <CharacterAvatar
          character={pietro}
          size="xl"
          shape="box"
          autoPlay
          isSpeaking
          className="mb-6"
        />

        {/* Speech bubble */}
        <div
          className="bg-white/10 backdrop-blur-lg rounded-2xl px-5 py-4 border relative mb-6"
          style={{ borderColor: `${pietro.accentColor}40` }}
        >
          <p className="text-white text-base leading-relaxed mb-3 text-center">
            "Hi, I'm <span className="font-bold text-amber-400">{pietro.name}</span>, founder of Casa Companion. How you doing today?"
          </p>
          <p className="text-white/60 text-sm leading-relaxed text-center">
            {kidName ? `Welcome, ${kidName}! ` : ''}We're building something special — a place where you can talk, play, and learn with friends from all around the world. Pick a companion and let's get started!"
          </p>
        </div>

        <button
          onClick={onNext}
          className="px-10 py-4 rounded-full text-white font-bold text-lg transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #D4A853, #f59e0b)',
            boxShadow: '0 4px 20px rgba(212,168,83,0.4), 0 0 40px rgba(212,168,83,0.2)',
          }}
        >
          Let's go! 🚀
        </button>
      </div>
    </div>
  );
}
