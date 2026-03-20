import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Zap, Film, Tv2, Subtitles, Sparkles, Layers, PlayCircle, Star, ShieldCheck, LayoutGrid, List, X, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MovieItem } from '../types';
import Pagination from '../components/Pagination';
import { MovieCard } from '../components/MovieCard';
import { Spinner } from '../components/Spinner';
import { Seo } from '../components/Seo';

const TRENDING = ['Inception', 'The Matrix', 'Interstellar', 'Dune', 'Oppenheimer', 'Breaking Bad'];
const FEATURES = [
  { icon: <Zap size={16} />, label: 'Ultra Fast' },
  { icon: <ShieldCheck size={16} />, label: 'Secure SSL' },
  { icon: <Tv2 size={16} />, label: '4K Support' },
  { icon: <Subtitles size={16} />, label: 'Multi-Sub' },
];

interface Props {
  results: MovieItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  favorites: string[];
  query: string;
  onSearch: (q: string, page?: number) => void;
  onSelectMovie: (path: string) => void;
  onToggleFav: (title: string) => void;
}

const HomePage: React.FC<Props> = ({
  results, loading, currentPage, totalPages, totalResults,
  favorites, query: externalQuery, onSearch, onSelectMovie, onToggleFav,
}) => {
  const [query, setQuery] = useState(externalQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search while typing — 400 ms debounce
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) return;
    debounceRef.current = setTimeout(() => {
      onSearch(val, 1);
      scrollToResults();
    }, 400);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const scrollToResults = () => {
    setTimeout(() => {
      const el = document.getElementById('results-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const submit = (e: React.FormEvent, page = 1) => {
    e.preventDefault();
    if (query.trim()) { onSearch(query, page); scrollToResults(); }
  };

  const quickSearch = (term: string) => {
    setQuery(term);
    onSearch(term, 1);
    scrollToResults();
  };

  const hasResults = results.length > 0;
  const seoTitle = externalQuery
    ? `Download "${externalQuery}" — Search Results`
    : undefined;
  const seoDesc = externalQuery
    ? `Search results for "${externalQuery}". Download HD movies and series free on Downloaderino.`
    : undefined;

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      <Seo title={seoTitle} description={seoDesc} />
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-24 md:pb-32">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/5"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>Premium Media Hub v2.0</span>
            </motion.div>

            {/* Stream CTA */}
            <motion.a
              href="https://streamarino.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-500 text-xs font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all"
            >
              <Tv size={13} />
              <span>Want to stream instead? Visit Streamarino</span>
            </motion.a>

            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-foreground"
              >
                UNLIMITED<br />
                <span className="text-primary drop-shadow-[0_10px_30px_rgba(34,197,94,0.3)]">ENTERTAINMENT.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed"
              >
                Time to download-diddly that file-erino.
              </motion.p>
            </div>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              onSubmit={submit}
              className="relative max-w-2xl mx-auto group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-center p-1.5 bg-surface border border-border-subtle rounded-2xl shadow-2xl focus-within:border-primary transition-all">
                  <div className="flex-grow flex items-center px-4">
                    <Search className="text-gray-400 group-focus-within:text-primary transition-colors shrink-0" size={20} />
                    <input
                      id="hero-search"
                      type="text"
                      value={query}
                      onChange={e => handleQueryChange(e.target.value)}
                      placeholder="Search for movies, TV shows, anime..."
                      className="w-full bg-transparent py-4 pl-3 pr-4 text-base md:text-lg font-semibold outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    {query && (
                      <button type="button" onClick={() => { setQuery(''); }} className="shrink-0 text-gray-400 hover:text-foreground transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary h-12 px-8 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 shrink-0"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Explore'}
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Trending */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-4"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mr-2">
                <TrendingUp size={14} className="text-primary" />
                <span>Trending:</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    onClick={() => quickSearch(t)}
                    className="px-4 py-1.5 rounded-full bg-surface border border-border-subtle text-xs font-bold hover:border-primary hover:text-primary transition-all hover:shadow-md active:scale-95"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10"
            >
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-surface/50 border border-border-subtle text-xs font-black uppercase tracking-wider text-gray-500 hover:border-primary/30 transition-all"
                >
                  <span className="text-primary">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results-section" className="container-custom">
        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <Spinner />
            {/* Skeleton grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] rounded-xl bg-surface border border-border-subtle" />
                  <div className="mt-3 space-y-2 px-1">
                    <div className="h-3 bg-surface rounded-full w-3/4" />
                    <div className="h-2 bg-surface rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                  <Layers size={14} />
                  <span>Catalogue</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">Search Results</h2>
                <p className="text-sm font-medium text-gray-400">
                  Showing{' '}
                  <span className="text-foreground font-bold">{results.length}</span>{' '}
                  of{' '}
                  <span className="text-foreground font-bold">{totalResults > 0 ? totalResults.toLocaleString() : results.length}</span>{' '}
                  titles found.
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-xl shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-background border border-border-subtle shadow-sm text-foreground'
                      : 'text-gray-500 hover:text-foreground'
                  }`}
                >
                  <LayoutGrid size={14} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-background border border-border-subtle shadow-sm text-foreground'
                      : 'text-gray-500 hover:text-foreground'
                  }`}
                >
                  <List size={14} /> List
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8"
                >
                  {results.map((item, idx) => (
                    <MovieCard
                      key={item.detailPath + idx}
                      item={item}
                      isFavorite={favorites.includes(item.title)}
                      onToggleFavorite={onToggleFav}
                      onClick={() => onSelectMovie(item.detailPath)}
                      viewMode="grid"
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  {results.map((item, idx) => (
                    <MovieCard
                      key={item.detailPath + idx}
                      item={item}
                      isFavorite={favorites.includes(item.title)}
                      onToggleFavorite={onToggleFav}
                      onClick={() => onSelectMovie(item.detailPath)}
                      viewMode="list"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <Pagination
              current={currentPage}
              total={totalPages}
              onChange={p => { onSearch(query, p); scrollToResults(); }}
            />
          </motion.div>
        )}

        {/* Empty State */}
        <AnimatePresence>
          {!loading && !hasResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12"
            >
              <div className="max-w-5xl mx-auto rounded-[32px] overflow-hidden bg-surface border border-border-subtle shadow-2xl relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-grow space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                      <Star size={12} fill="currentColor" /> Ready to Search
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black leading-[1.1]">Your next binge<br />starts here.</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md text-lg leading-relaxed">
                      Search for your favorite movie or series title in the bar above. Our high-speed indexer will find the best links for you.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-border-subtle shadow-sm hover:border-primary/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <PlayCircle size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Library</p>
                          <p className="text-sm font-bold">100k+ Titles</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-border-subtle shadow-sm hover:border-primary/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Zap size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Speed</p>
                          <p className="text-sm font-bold">10Gbps Links</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-56 h-56 md:w-72 md:h-72 relative flex-shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative w-full h-full bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl rotate-3 flex items-center justify-center">
                      <Film size={100} className="text-primary opacity-20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl">
                          <PlayCircle size={32} fill="currentColor" strokeWidth={0} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default HomePage;
