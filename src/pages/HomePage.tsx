import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { characters } from '@/data/characters';
import { CharacterCard } from '@/components/CharacterCard';
import { Search, Sparkles } from 'lucide-react';

// Creative category names
const categoryLabels: Record<string, string> = {
  animal: 'Animals of the Wild',
  person: 'Culture & Learning',
  object: 'Music & Arts',
};

const categoryOrder = ['animal', 'person', 'object'];

export function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = categoryOrder.filter(c => characters.some(ch => ch.category === c));
    return ['all', ...cats];
  }, []);

  const filteredCharacters = useMemo(() => {
    let filtered = characters;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.italianMeaning.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [selectedCategory, searchQuery]);

  const pietro = characters.find(c => c.slug === 'pietro')!;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 px-4 pt-4 pb-3" style={{ background: 'rgba(30, 41, 59, 0.9)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Casa Companion</h1>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Find your friend..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition-colors"
          />
        </div>
      </header>

      <div className="px-4 pt-4 space-y-6">
        {/* Pietro Hero */}
        {!searchQuery && selectedCategory === 'all' && pietro && (
          <section className="animate-fade-in-up">
            <button
              onClick={() => navigate(`/chat/${pietro.slug}`)}
              className="w-full rounded-2xl border border-amber-500/20 p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(90deg, ${pietro.accentColor}15, transparent)` }}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-500/30">
                <img src={pietro.portrait} alt="Pietro" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">Meet the Founder</span>
                <h2 className="text-2xl font-bold text-white mt-0.5">{pietro.name}</h2>
                <p className="text-white/50 text-sm mt-0.5">{pietro.italianMeaning}</p>
              </div>
            </button>
          </section>
        )}

        {/* Category tabs */}
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All Friends' : categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {/* Character Grid */}
        <section>
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
            {searchQuery ? `Results (${filteredCharacters.length})` : selectedCategory === 'all' ? 'Pick Your Companion' : categoryLabels[selectedCategory]}
          </h3>
          {filteredCharacters.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <p className="text-lg">No friends found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredCharacters.map((character, i) => (
                <div key={character.slug} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <CharacterCard character={character} onClick={() => navigate(`/chat/${character.slug}`)} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
