import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Zap, Film, Tv2, Subtitles, Sparkles, Layers, ShieldCheck, LayoutGrid, List, X, Tv, ChevronDown, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { MovieItem, AltSourceItem } from '../types';
import Pagination from '../components/Pagination';
import { MovieCard } from '../components/MovieCard';
import { Seo } from '../components/Seo';

const TRENDING = ['Inception', 'The Matrix', 'Interstellar', 'Dune', 'Oppenheimer', 'Breaking Bad'];
const FEATURES = [
  { icon: <Zap size={13} />, label: 'Ultra Fast' },
  { icon: <ShieldCheck size={13} />, label: 'Secure SSL' },
  { icon: <Tv2 size={13} />, label: '4K Support' },
  { icon: <Subtitles size={13} />, label: 'Multi-Sub' },
];
const PAGE_SIZE = 18;

interface Props {
  results: MovieItem[];
  altsource: AltSourceItem[];
  featured: MovieItem[];
  featuredLoading: boolean;
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
  onRequest: () => void;
}

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] rounded-2xl bg-surface border border-border-subtle" />
    <div className="mt-3 space-y-2">
      <div className="h-3 bg-surface rounded-full w-3/4" />
      <div className="h-2 bg-surface rounded-full w-1/2" />
    </div>
  </div>
);

const SkeletonGrid = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count?: number }> = ({ icon, title, count }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <h2 className="text-xl font-black tracking-tight">{title}</h2>
    {count !== undefined && (
      <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border-subtle text-xs font-bold text-gray-400">
        {count}
      </span>
    )}
  </div>
);

const AltSourceCard: React.FC<{ item: AltSourceItem; viewMode: 'grid' | 'list'; onClick: () => void }> = ({ item, viewMode, onClick }) => {
  if (viewMode === 'list') {
    return (
      <motion.div onClick={onClick} whileHover={{ x: 3 }}
        className="flex items-center gap-4 p-3 rounded-2xl bg-surface border border-border-subtle hover:border-orange-500/40 cursor-pointer transition-all group">
        <div className="w-14 h-20 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0 overflow-hidden flex items-center justify-center">
          {item.cover ? <img src={item.cover} alt={item.title} className="w-full h-full object-cover" loading="lazy" /> : <ExternalLink size={16} className="text-orange-500" />}
        </div>
        <div className="flex-grow min-w-0 space-y-1.5">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-orange-500 transition-colors">{item.title}</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-wider">AltSource</span>
        </div>
        <ExternalLink size={13} className="text-gray-400 shrink-0" />
      </motion.div>
    );
  }
  return (
    <motion.div onClick={onClick} whileHover={{ y: -6 }}
      className="cursor-pointer group rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-orange-500/40 hover:shadow-xl transition-all duration-300">
      <div className="aspect-[2/3] relative overflow-hidden bg-orange-500/5 flex items-center justify-center">
        {item.cover
          ? <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          : <ExternalLink size={28} className="text-orange-500/30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-lg bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-lg">Alt</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-xs line-clamp-1 group-hover:text-orange-500 transition-colors">{item.title}</h3>
        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1"><ExternalLink size={8} /> Netnaija</p>
      </div>
    </motion.div>
  );
};

const HomePage: React.FC<Props> = ({
  results, altsource, featured, featuredLoading, loading, wakingUp = false,
  currentPage, totalPages, favorites, query: externalQuery,
  onSearch, onSelectMovie, onSelectAltSource, onToggleFav, onRequest,
}) => {
  const [query, setQuery] = useState(externalQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stickyVisible, setStickyVisible] = useState(false);
  const [moviesShown, setMoviesShown] = useState(PAGE_SIZE);
  const [seriesShown, setSeriesShown] = useState(PAGE_SIZE);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);

  // Sync external query
  useEffect(() => { setQuery(externalQuery); }, [externalQuery]);

  // Reset load-more when featured changes
  useEffect(() => { setMoviesShown(PAGE_SIZE); setSeriesShown(PAGE_SIZE); }, [featured]);

  // Sticky search observer
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setStickyVisible(!e.isIntersecting), { threshold: 0, rootMargin: '-80px 0px 0px 0px' });
    if (heroSearchRef.current) obs.observe(heroSearchRef.current);
    return () => obs.disconnect();
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) return;
    debounceRef.current = setTimeout(() => { onSearch(val, 1); scrollToResults(); }, 600);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const scrollToResults = () => setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { onSearch(query, 1); scrollToResults(); }
  };

  const quickSearch = (term: string) => { setQuery(term); onSearch(term, 1); scrollToResults(); };

  const hasResults = results.length > 0 || altsource.length > 0;
  const showFeatured = !hasResults && !loading;
  const featuredMovies = featured.filter(i => i.subjectType === 1);
  const featuredSeries = featured.filter(i => i.subjectType !== 1);

  const qNorm = externalQuery.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const altTop = altsource.filter(i => {
    const t = i.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\b(download|movie|series|season|\d{4})\b/g, '').trim();
    return t === qNorm || t.startsWith(qNorm) || qNorm.split(' ').every(w => t.includes(w));
  });
  const altBottom = altsource.filter(i => !altTop.includes(i));

  const SearchInput = ({ compact = false }: { compact?: boolean }) => (
    <form onSubmit={submit} className={`relative w-full ${compact ? '' : 'max-w-2xl mx-auto'} group`}>
      <div className={`relative flex items-center bg-surface border border-border-subtle ${compact ? 'rounded-xl' : 'rounded-2xl shadow-2xl'} focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all duration-200`}>
        <Search className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors shrink-0 z-10" size={compact ? 15 : 18} />
        <input
          id={compact ? 'sticky-search' : 'hero-search'}
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search movies, series, anime…"
          className={`w-full bg-transparent ${compact ? 'py-2.5 pl-10 pr-24 text-sm' : 'py-4 pl-12 pr-32 text-base md:text-lg'} font-semibold outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600`}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); }} className={`absolute ${compact ? 'right-20' : 'right-24'} text-gray-400 hover:text-foreground transition-colors z-10`}>
            <X size={14} />
          </button>
        )}
        <button type="submit" disabled={loading}
          className={`absolute right-1.5 ${compact ? 'h-8 px-4 text-xs rounded-lg' : 'h-11 px-7 text-sm rounded-xl'} bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center gap-2 z-10 shrink-0`}>
          {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Search'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="pb-24 overflow-hidden">
      <Seo
        title={externalQuery ? `Download "${externalQuery}" — Search Results` : undefined}
        description={externalQuery ? `Search results for "${externalQuery}". Download HD movies and series free on Downloaderino.` : undefined}
      />

      {/* Sticky search */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -56, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed top-[57px] left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border-subtle shadow-sm"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
              <SearchInput compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative pt-14 pb-16 md:pt-20 md:pb-24">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-7">

            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-widest">
                <Sparkles size={10} className="animate-pulse" /> Premium Media Hub
              </span>
              <a href="https://streamarino.vercel.app/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all">
                <Tv size={10} /> Stream on Streamarino
              </a>
            </motion.div>

            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="text-5xl sm:text-7xl md:text-[88px] font-black tracking-tight leading-[0.88] mb-3">
                UNLIMITED<br />
                <span className="text-primary" style={{ textShadow: '0 0 80px rgba(34,197,94,0.3)' }}>DOWNLOADS.</span>
              </h1>
              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-lg mx-auto">
                Movies, series, anime — all in HD. Free, fast, no sign-up.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div ref={heroSearchRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <SearchInput />
            </motion.div>

            {/* Trending */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
              className="flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400 mr-1">
                <TrendingUp size={11} className="text-primary" /> Trending
              </span>
              {TRENDING.map(t => (
                <button key={t} onClick={() => quickSearch(t)}
                  className="px-3 py-1 rounded-full bg-surface border border-border-subtle text-xs font-semibold text-gray-500 hover:border-primary hover:text-primary transition-all active:scale-95">
                  {t}
                </button>
              ))}
            </motion.div>

            {/* Feature pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 pt-1">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface/70 border border-border-subtle text-[11px] font-semibold text-gray-500">
                  <span className="text-primary">{f.icon}</span>{f.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section id="results-section" className="container-custom space-y-10">

        {/* Loading skeleton */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {wakingUp && (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
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
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-1">
                  <Layers size={11} /> Catalogue
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Results for <span className="text-primary">"{externalQuery}"</span>
                </h2>
                <p className="text-xs font-medium text-gray-400 mt-0.5">
                  <span className="text-foreground font-bold">{results.length + altsource.length}</span> titles found
                  {altsource.length > 0 && <span> · <span className="text-orange-400">{altsource.length} AltSource</span></span>}
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-xl shrink-0">
                {(['grid', 'list'] as const).map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === m ? 'bg-background border border-border-subtle shadow-sm text-foreground' : 'text-gray-500 hover:text-foreground'}`}>
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

        {/* Request CTA */}
        {showFeatured && !featuredLoading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div>
              <p className="text-sm font-black text-foreground">Can't find what you're looking for?</p>
              <p className="text-xs text-gray-400 mt-0.5">Request a movie, series, or anime and we'll add it.</p>
            </div>
            <button onClick={onRequest}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary-hover transition-all shadow-md shadow-primary/20">
              <Send size={13} /> Request
            </button>
          </motion.div>
        )}

        {/* Featured sections */}
        {showFeatured && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">

            {/* Movies */}
            <div id="section-movies">
              <SectionHeader icon={<Film size={15} />} title="Movies" count={featuredMovies.length || undefined} />
              {featuredLoading ? <SkeletonGrid count={PAGE_SIZE} /> : featuredMovies.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
                    {featuredMovies.slice(0, moviesShown).map((item, idx) => (
                      <MovieCard key={item.detailPath+idx} item={item} isFavorite={favorites.includes(item.title)} onToggleFavorite={onToggleFav} onClick={() => onSelectMovie(item.detailPath)} viewMode="grid" />
                    ))}
                  </div>
                  {moviesShown < featuredMovies.length && (
                    <div className="flex justify-center mt-8">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setMoviesShown(n => n + PAGE_SIZE)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface border border-border-subtle text-sm font-bold hover:border-primary hover:text-primary transition-all"
                      >
                        <ChevronDown size={16} /> Load more movies
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 py-4">No movies found.</p>
              )}
            </div>

            {/* Series */}
            <div id="section-series">
              <SectionHeader icon={<Tv2 size={15} />} title="Series" count={featuredSeries.length || undefined} />
              {featuredLoading ? <SkeletonGrid count={PAGE_SIZE} /> : featuredSeries.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
                    {featuredSeries.slice(0, seriesShown).map((item, idx) => (
                      <MovieCard key={item.detailPath+idx} item={item} isFavorite={favorites.includes(item.title)} onToggleFavorite={onToggleFav} onClick={() => onSelectMovie(item.detailPath)} viewMode="grid" />
                    ))}
                  </div>
                  {seriesShown < featuredSeries.length && (
                    <div className="flex justify-center mt-8">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSeriesShown(n => n + PAGE_SIZE)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface border border-border-subtle text-sm font-bold hover:border-primary hover:text-primary transition-all"
                      >
                        <ChevronDown size={16} /> Load more series
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 py-4">No series found.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        <AnimatePresence>
          {!loading && !hasResults && !featuredLoading && featured.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center">
                <Film size={28} className="text-gray-400" />
              </div>
              <p className="text-lg font-black">Nothing found</p>
              <p className="text-sm text-gray-400 max-w-xs">Try a different title or check the spelling.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default HomePage;
