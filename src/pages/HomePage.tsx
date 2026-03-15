import React, { useState } from 'react';
import { Search, TrendingUp, Zap, Film, Tv2, Subtitles, Sparkles, Layers, PlayCircle, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieItem } from '../types';
import Pagination from '../components/Pagination';
import { MovieCard } from '../components/MovieCard';
import { Spinner } from '../components/Spinner';

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
  onSearch: (q: string, page?: number) => void;
  onSelectMovie: (path: string) => void;
  onToggleFav: (title: string) => void;
}

const HomePage: React.FC<Props> = ({
  results, loading, currentPage, totalPages, totalResults,
  favorites, onSearch, onSelectMovie, onToggleFav,
}) => {
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent, page = 1) => {
    e.preventDefault();
    if (query.trim()) onSearch(query, page);
  };

  const quickSearch = (term: string) => {
    setQuery(term);
    onSearch(term, 1);
  };

  const hasResults = results.length > 0;

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
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
  
            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-foreground"
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
                The fastest way to search and download high-quality movies and series. 
                Experience a clean, ad-free interface designed for enthusiasts.
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
                    <Search className="text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search for movies, TV shows, anime..."
                      className="w-full bg-transparent py-4 pl-3 pr-4 text-base md:text-lg font-semibold outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary h-12 px-8 rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
                  >
                    Explore
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
                {TRENDING.map((t, i) => (
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
      <section className="container-custom">
        {loading && <Spinner />}

        {!loading && hasResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                   <Layers size={14} />
                   <span>Catalogue</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight">
                  Search Results
                </h2>
                <p className="text-sm font-medium text-gray-400">
                  Showing <span className="text-foreground">{results.length}</span> titles from <span className="text-foreground">{totalResults}</span> found.
                </p>
              </div>
              
              <div className="flex items-center gap-2 p-1 bg-surface border border-border-subtle rounded-xl">
                 <button className="px-4 py-2 rounded-lg bg-background border border-border-subtle text-xs font-bold shadow-sm">Grid View</button>
                 <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-foreground transition-colors">List View</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
              {results.map((item, idx) => (
                <MovieCard
                  key={idx}
                  item={item}
                  isFavorite={favorites.includes(item.title)}
                  onToggleFavorite={onToggleFav}
                  onClick={() => onSelectMovie(item.detailPath)}
                />
              ))}
            </div>

            <Pagination 
              current={currentPage} 
              total={totalPages} 
              onChange={p => onSearch(query, p)} 
            />
          </motion.div>
        )}

        {/* Empty State / Welcome Screen */}
        <AnimatePresence>
          {!loading && !hasResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12"
            >
              <div className="max-w-5xl mx-auto rounded-[32px] overflow-hidden bg-surface border border-border-subtle shadow-2xl relative">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                
                <div className="relative p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-grow space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                      <Star size={12} fill="currentColor" /> Feature Update
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black leading-[1.1]">No content to show yet.</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md text-lg leading-relaxed">
                      Search for your favorite movie or series title in the bar above. Our high-speed indexer will find the best links for you.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-border-subtle shadow-sm group hover:border-primary/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <PlayCircle size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Library</p>
                          <p className="text-sm font-bold">100k+ Titles</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-border-subtle shadow-sm group hover:border-primary/30 transition-all">
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
                  <div className="w-64 h-64 md:w-80 md:h-80 relative flex-shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative w-full h-full bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl rotate-3 flex items-center justify-center">
                       <Film size={120} className="text-primary opacity-20" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl">
                             <PlayCircle size={40} fill="currentColor" strokeWidth={0} />
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
