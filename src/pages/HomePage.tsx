import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Zap, Film, Tv2, Subtitles, Sparkles, Layers, ShieldCheck, LayoutGrid, List, X, Tv, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { MovieItem, AltSourceItem } from '../types';
import Pagination from '../components/Pagination';
import { MovieCard } from '../components/MovieCard';
import { Seo } from '../components/Seo';

const TRENDING = ['Inception', 'The Matrix', 'Interstellar', 'Dune', 'Oppenheimer', 'Breaking Bad'];
const FEATURES = [
  { icon: <Zap size={14} />, label: 'Ultra Fast' },
  { icon: <ShieldCheck size={14} />, label: 'Secure SSL' },
  { icon: <Tv2 size={14} />, label: '4K Support' },
  { icon: <Subtitles size={14} />, label: 'Multi-Sub' },
];

interface Props {
  results: MovieItem[];
  altsource: AltSourceItem[];
  featured: MovieItem[];
  loading: boolean;
  wakingUp?: boolean;
  currentPage: number;
  totalPages: number;
  favorites: string[];
  query: string;
  onSearch: (q: string, page?: number) => void;
  onSelectMovie: (path: string) => void;
  onSelectAltSource: (item: AltSourceItem) => void;
  onToggleFav: (title: string) => void;
}

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[2/3] rounded-2xl bg-surface border border-border-subtle" />
        <div className="mt-3 space-y-2 px-0.5">
          <div className="h-3 bg-surface rounded-full w-3/4" />
          <div className="h-2 bg-surface rounded-full w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count?: number }> = ({ icon, title, count }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="px-2 py-0.5 rounded-full bg-surface border border-border-subtle text-xs font-bold text-gray-400">
          {count}
        </span>
      )}
    </div>
    <div className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-primary transition-colors cursor-default">
      <ChevronRight size={14} />
    </div>
  </div>
);

const AltSourceCard: React.FC<{ item: AltSourceItem; viewMode: 'grid' | 'list'; onClick: () => void }> = ({ item, viewMode, onClick }) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ x: 4 }}
        className="flex items-center gap-4 p-3 rounded-2xl bg-surface border border-border-subtle hover:border-orange-500/40 cursor-pointer transition-all group"
      >
        <div className="w-14 h-20 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0 overflow-hidden flex items-center justify-center">
          {item.cover
            ? <img src={item.cover} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
            : <ExternalLink size={18} className="text-orange-500" />}
        </div>
        <div className="flex-grow min-w-0 space-y-1.5">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-orange-500 transition-colors">{item.title}</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-wider">
            AltSource
          </span>
        </div>
        <ExternalLink size={13} className="text-gray-400 shrink-0" />
      </motion.div>
    );
  }
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -6 }}
      className="cursor-pointer group rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-orange-500/40 hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-orange-500/5 flex items-center justify-center">
        {item.cover
          ? <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          : <ExternalLink size={28} className="text-orange-500/30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-lg">
            Alt
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-xs line-clamp-1 group-hover:text-orange-500 transition-colors">{item.title}</h3>
        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
          <ExternalLink size={8} /> Netnaija
        </p>
      </div>
    </motion.div>
  );
};

const HomePage: React.FC<Props> = ({
  results, altsource, featured, loading, wakingUp = false, currentPage, totalPages,
  favorites, query: externalQuery, onSearch, onSelectMovie, onSelectAltSource, onToggleFav,
}) => {
  const [query, setQuery] = useState(externalQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stickyVisible, setStickyVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setStickyVisible(!e.isIntersecting), { threshold: 0 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) return;
    debounceRef.current = setTimeout(() => { onSearch(val, 1); scrollToResults(); }, 600);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const scrollToResults = () => {
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { onSearch(query, 1); scrollToResults(); }
  };

  const quickSearch = (term: string) => {
    setQuery(term);
    onSearch(term, 1);
    scrollToResults();
  };

  const hasResults = results.length > 0 || altsource.length > 0;
  const showFeatured = !hasResults && !loading && featured.length > 0;
  const featuredMovies = featured.filter(i => i.subjectType === 1);
  const featuredSeries = featured.filter(i => i.subjectType !== 1);

  const qNorm = externalQuery.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const altTop = altsource.filter(i => {
    const t = i.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\b(download|movie|series|season|\d{4})\b/g, '').trim();
    return t === qNorm || t.startsWith(qNorm) || qNorm.split(' ').every(w => t.includes(w));
  });
  const altBottom = altsource.filter(i => !altTop.includes(i));

  const SearchBar = ({ compact = false }: { compact?: boolean }) => (
    <form onSubmit={submit} className={`relative ${compact ? 'w-full max-w-xl' : 'max-w-2xl mx-auto w-full'} group`}>
      <div className={`relative flex items-center ${compact ? 'bg-surface border border-border-subtle rounded-xl shadow-lg' : 'bg-surface border border-border-subtle rounded-2xl shadow-2xl'} focus-within:border-primary transition-all duration-200`}>
        <div className="absolute inset-0 bg-primary/5 rounded-[inherit] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        <Search className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors shrink-0 z-10" size={compact ? 16 : 18} />
        <input
          id={compact ? 'sticky-search' : 'hero-search'}
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search movies, series, anime…"
          className={`w-full bg-transparent ${compact ? 'py-2.5 pl-10 pr-20 text-sm' : 'py-4 pl-11 pr-28 text-base md:text-lg'} font-semibold outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 relative z-10`}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-16 text-gray-400 hover:text-foreground transition-colors z-10">
            <X size={14} />
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`absolute right-1.5 ${compact ? 'h-8 px-4 text-xs rounded-lg' : 'h-11 px-6 text-sm rounded-xl'} bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center gap-2 z-10`}
        >
          {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Search'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="pb-20 overflow-hidden">
      <Seo
        title={externalQuery ? `Download "${externalQuery}" — Search Results` : undefined}
        description={externalQuery ? `Search results for "${externalQuery}". Download HD movies and series free on Downloaderino.` : undefined}
      />

      {/* Sticky search bar */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] left-0 right-0 z-40 border-b border-border-subtle bg-background/90 backdrop-blur-md px-4 py-2.5 shadow-lg"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-4">
              <SearchBar compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">

            {/* Badges row */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-widest">
                <Sparkles size={11} className="animate-pulse" /> Premium Media Hub
              </span>
              <a
                href="https://streamarino.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all"
              >
                <Tv size={11} /> Stream on Streamarino
              </a>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.88]">
                UNLIMITED<br />
                <span className="text-primary" style={{ textShadow: '0 0 60px rgba(34,197,94,0.25)' }}>DOWNLOADS.</span>
              </h1>
              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                Movies, series, anime — all in HD. Free, fast, no sign-up.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div ref={heroRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <SearchBar />
            </motion.div>

            {/* Trending chips */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400">
                <TrendingUp size={12} className="text-primary" /> Trending
              </span>
              {TRENDING.map(t => (
                <button
                  key={t}
                  onClick={() => quickSearch(t)}
                  className="px-3 py-1 rounded-full bg-surface border border-border-subtle text-xs font-semibold hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                  {t}
                </button>
              ))}
            </motion.div>

            {/* Feature pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex flex-wrap justify-center gap-3 pt-2">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/60 border border-border-subtle text-[11px] font-bold text-gray-500">
                  <span className="text-primary">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results / Featured */}
      <section id="results-section" className="container-custom space-y-10">

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {wakingUp && (
              <div className="flex flex-col items-center gap-2 py-6">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-400">Waking up the server… <span className="text-primary">hang tight</span></p>
                <p className="text-xs text-gray-500">Cold-starting after inactivity. Retrying automatically.</p>
              </div>
            )}
            <SkeletonGrid />
          </motion.div>
        )}

        {/* Search results */}
        {!loading && hasResults && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                  <Layers size={12} /> Catalogue
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Results for <span className="text-primary">"{externalQuery}"</span>
                </h2>
                <p className="text-xs font-medium text-gray-400">
                  <span className="text-foreground font-bold">{results.length + altsource.length}</span> titles
                  {altsource.length > 0 && <span className="text-gray-500"> · <span className="text-orange-400">{altsource.length} AltSource</span></span>}
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-xl shrink-0">
                {(['grid', 'list'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === m ? 'bg-background border border-border-subtle shadow-sm text-foreground' : 'text-gray-500 hover:text-foreground'}`}
                  >
                    {m === 'grid' ? <LayoutGrid size={13} /> : <List size={13} />}
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
                  {altTop.map((item, idx) => <AltSourceCard key={'t'+idx} item={item} viewMode="grid" onClick={() => onSelectAltSource(item)} />)}
                  {results.map((item, idx) => <MovieCard key={item.detailPath+idx} item={item} isFavorite={favorites.includes(item.title)} onToggleFavorite={onToggleFav} onClick={() => onSelectMovie(item.detailPath)} viewMode="grid" />)}
                  {altBottom.map((item, idx) => <AltSourceCard key={'b'+idx} item={item} viewMode="grid" onClick={() => onSelectAltSource(item)} />)}
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2.5">
                  {altTop.map((item, idx) => <AltSourceCard key={'t'+idx} item={item} viewMode="list" onClick={() => onSelectAltSource(item)} />)}
                  {results.map((item, idx) => <MovieCard key={item.detailPath+idx} item={item} isFavorite={favorites.includes(item.title)} onToggleFavorite={onToggleFav} onClick={() => onSelectMovie(item.detailPath)} viewMode="list" />)}
                  {altBottom.map((item, idx) => <AltSourceCard key={'b'+idx} item={item} viewMode="list" onClick={() => onSelectAltSource(item)} />)}
                </motion.div>
              )}
            </AnimatePresence>

            <Pagination current={currentPage} total={totalPages} onChange={p => { onSearch(query, p); scrollToResults(); }} />
          </motion.div>
        )}

        {/* Featured sections */}
        {showFeatured && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
            {featuredMovies.length > 0 && (
              <div id="section-movies">
                <SectionHeader icon={<Film size={16} />} title="Movies" count={featuredMovies.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
                  {featuredMovies.map((item, idx) => (
                    <MovieCard key={item.detailPath+idx} item={item} isFavorite={favorites.includes(item.title)} onToggleFavorite={onToggleFav} onClick={() => onSelectMovie(item.detailPath)} viewMode="grid" />
                  ))}
                </div>
              </div>
            )}
            {featuredSeries.length > 0 && (
              <div id="section-series">
                <SectionHeader icon={<Tv2 size={16} />} title="Series" count={featuredSeries.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
                  {featuredSeries.map((item, idx) => (
                    <MovieCard key={item.detailPath+idx} item={item} isFavorite={favorites.includes(item.title)} onToggleFavorite={onToggleFav} onClick={() => onSelectMovie(item.detailPath)} viewMode="grid" />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        <AnimatePresence>
          {!loading && !hasResults && !showFeatured && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center">
                <Film size={28} className="text-gray-400" />
              </div>
              <p className="text-lg font-black text-foreground">Nothing found</p>
              <p className="text-sm text-gray-400 max-w-xs">Try a different title or check the spelling.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default HomePage;
