import React, { useState, useEffect } from 'react';
import {
  Search, Moon, Sun, Download, Play, Info,
  ArrowLeft, ExternalLink, Clapperboard, Tv2, Film, Zap
} from 'lucide-react';
import { api } from './api';
import { MovieItem, MovieDetail, LinksResponse } from './types';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── tiny helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

const FEATURES = [
  { icon: <Zap size={14} />,        label: 'Instant links'   },
  { icon: <Film size={14} />,       label: 'Movies & series' },
  { icon: <Tv2 size={14} />,        label: 'Multi-quality'   },
  { icon: <Clapperboard size={14}/>, label: 'Subtitles'      },
];

/* ─── component ─── */
const App: React.FC = () => {
  const [isDark, setIsDark]               = useState(true);
  const [query, setQuery]                 = useState('');
  const [results, setResults]             = useState<MovieItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading]             = useState(false);
  const [detailPath, setDetailPath]       = useState<string | null>(null);
  const [season, setSeason]               = useState(1);
  const [episode, setEpisode]             = useState(1);
  const [links, setLinks]                 = useState<LinksResponse | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.search(query);
      setResults(res.data.items || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadDetail = async (path: string) => {
    setLoading(true);
    setDetailPath(path);
    try {
      const res = await api.getDetail(path);
      setSelectedMovie(res.data);
      setSeason(1); setEpisode(1); setLinks(null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadLinks = async () => {
    if (!selectedMovie || !detailPath) return;
    setLoading(true);
    try {
      const res = await api.getLinks(selectedMovie.subject_id, detailPath, season, episode);
      setLinks(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const goHome = () => { setSelectedMovie(null); setResults([]); setQuery(''); };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5"
           style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <button onClick={goHome} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary text-black font-black text-sm flex items-center justify-center glow transition-all group-hover:scale-110 group-hover:glow-ring">
            D
          </div>
          <span className="font-black tracking-tighter text-lg hidden sm:block">DOWNLOADERINO</span>
        </button>

        <button
          onClick={() => setIsDark(!isDark)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ border: '1px solid var(--border)' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {isDark
            ? <Sun size={17} style={{ color: 'var(--primary)' }} />
            : <Moon size={17} style={{ color: 'var(--primary)' }} />}
        </button>
      </nav>

      {/* ── MAIN ── */}
      <main>
        <AnimatePresence mode="wait">

          {/* ════════════════ HOME ════════════════ */}
          {!selectedMovie && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

              {/* Hero section */}
              <section className="relative overflow-hidden hero-grid" style={{ minHeight: '520px' }}>
                {/* Orbs */}
                <div className="orb orb-1" />
                <div className="orb orb-2" />

                <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 gap-6">

                  {/* Eyebrow */}
                  <motion.div {...fadeUp(0.05)} className="badge">
                    <Zap size={10} /> Free · Fast · No ads
                  </motion.div>

                  {/* Headline */}
                  <motion.h1 {...fadeUp(0.12)} className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95] max-w-3xl">
                    The fastest way to<br />
                    <span className="text-primary glow-text">download anything.</span>
                  </motion.h1>

                  {/* Sub */}
                  <motion.p {...fadeUp(0.2)} className="text-base max-w-md" style={{ color: 'var(--fg-2)' }}>
                    Search millions of movies and series. Get direct download links in seconds.
                  </motion.p>

                  {/* Search bar */}
                  <motion.form {...fadeUp(0.28)} onSubmit={handleSearch} className="w-full max-w-xl">
                    <div className="relative flex items-center" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '18px', boxShadow: 'var(--shadow-card)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                         onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(0,255,65,0.12)'; }}
                         onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)'; }}>
                      <Search size={18} className="absolute left-5 shrink-0" style={{ color: 'var(--fg-3)' }} />
                      <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search movies, series, anime..."
                        className="w-full bg-transparent py-4 pl-12 pr-4 text-base outline-none"
                        style={{ color: 'var(--fg)' }}
                      />
                      <button type="submit" className="btn-primary shrink-0 mr-2 py-2.5 px-5 text-sm rounded-xl">
                        Search
                      </button>
                    </div>
                  </motion.form>

                  {/* Feature pills */}
                  <motion.div {...fadeUp(0.36)} className="flex flex-wrap justify-center gap-2">
                    {FEATURES.map(f => (
                      <span key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}>
                        <span style={{ color: 'var(--primary)' }}>{f.icon}</span>
                        {f.label}
                      </span>
                    ))}
                  </motion.div>
                </div>
              </section>

              {/* Results section */}
              <section className="container mx-auto px-4 py-10 max-w-6xl">
                {loading && (
                  <div className="flex flex-col items-center gap-3 py-20">
                    <div className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--fg-2)' }}>Searching...</p>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-black text-xl tracking-tight">Results</h2>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--primary-dim)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                        {results.length} found
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {results.map((item, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.035, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -5 }}
                          onClick={() => loadDetail(item.detailPath)}
                          className="card card-shimmer text-left group cursor-pointer overflow-hidden"
                          style={{ transition: 'box-shadow 0.2s, border-color 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,65,0.4)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,255,65,0.2)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
                        >
                          <div className="aspect-[2/3] relative overflow-hidden rounded-t-[18px]">
                            <img src={item.cover.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108" />
                            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                 style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}>
                              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                                    style={{ background: 'var(--primary)', color: '#000' }}>
                                <Info size={12} /> View
                              </span>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="font-bold text-sm line-clamp-1 leading-tight">{item.title}</p>
                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--fg-2)' }}>{item.genre}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Empty state */}
                {!loading && results.length === 0 && query === '' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                              className="flex flex-col items-center gap-3 py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                         style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary)' }}>
                      <Clapperboard size={28} style={{ color: 'var(--primary)' }} />
                    </div>
                    <p className="font-bold text-lg">Start searching</p>
                    <p className="text-sm max-w-xs" style={{ color: 'var(--fg-2)' }}>
                      Type a movie or series name above to find download links instantly.
                    </p>
                  </motion.div>
                )}
              </section>
            </motion.div>
          )}

          {/* ════════════════ DETAIL ════════════════ */}
          {selectedMovie && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {/* Backdrop hero */}
              <div className="relative overflow-hidden" style={{ height: '340px' }}>
                <div className="detail-backdrop" style={{ backgroundImage: `url(${selectedMovie.cover})` }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 container mx-auto max-w-6xl">
                  <button onClick={goHome} className="flex items-center gap-1.5 text-sm font-semibold mb-4 transition-colors"
                          style={{ color: 'var(--fg-2)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-2)')}>
                    <ArrowLeft size={15} /> Back to search
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="container mx-auto px-4 max-w-6xl pb-16 -mt-4">
                <div className="grid md:grid-cols-[260px_1fr] gap-8">

                  {/* ── Sidebar ── */}
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
                      <img src={selectedMovie.cover} alt={selectedMovie.title} className="w-full block" />
                    </div>

                    {/* Rating */}
                    <div className="card p-4 flex items-center gap-3">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>IMDB</p>
                        <p className="text-xl font-black">{selectedMovie.imdb_rating || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Trailer */}
                    {selectedMovie.trailer_url && (
                      <a href={selectedMovie.trailer_url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center justify-center gap-2 w-full font-bold py-3 rounded-xl text-sm transition-all"
                         style={{ background: '#e50914', color: '#fff' }}
                         onMouseEnter={e => (e.currentTarget.style.background = '#f40612')}
                         onMouseLeave={e => (e.currentTarget.style.background = '#e50914')}>
                        <Play size={16} fill="currentColor" /> Watch Trailer
                      </a>
                    )}

                    {/* Meta */}
                    {[
                      { label: 'Released', value: selectedMovie.release_date },
                      { label: 'Country',  value: selectedMovie.country },
                    ].map(({ label, value }) => (
                      <div key={label} className="card p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-3)' }}>{label}</p>
                        <p className="font-semibold text-sm">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Main ── */}
                  <div className="space-y-6 pt-2">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
                        {selectedMovie.title}
                      </h1>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMovie.genre.split(',').map(g => (
                          <span key={g} className="badge">{g.trim()}</span>
                        ))}
                      </div>
                    </div>

                    <p className="leading-relaxed text-[15px]" style={{ color: 'var(--fg-2)' }}>
                      {selectedMovie.description}
                    </p>

                    {/* ── Download panel ── */}
                    <div className="card p-6 space-y-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-dim)' }}>
                          <Download size={16} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h2 className="font-black text-lg">Download Links</h2>
                      </div>

                      {/* Season / Episode selectors */}
                      {selectedMovie.seasons.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                          <div className="flex-1 min-w-[130px] space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>Season</label>
                            <select
                              value={season}
                              onChange={e => { setSeason(Number(e.target.value)); setLinks(null); }}
                              className="input-field"
                            >
                              {selectedMovie.seasons.map(s => (
                                <option key={s.number} value={s.number}>Season {s.number}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 min-w-[130px] space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>Episode</label>
                            <input
                              type="number" min="1"
                              max={selectedMovie.seasons.find(s => s.number === season)?.episodes_count || 100}
                              value={episode}
                              onChange={e => { setEpisode(Number(e.target.value)); setLinks(null); }}
                              className="input-field"
                            />
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <button onClick={loadLinks} disabled={loading} className="btn-primary flex-1">
                          {loading
                            ? <><span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" /> Fetching...</>
                            : <><Download size={16} /> Get Links</>}
                        </button>
                        {selectedMovie.seasons.length > 0 && (
                          <a href={api.getSeasonStreamUrl(selectedMovie.subject_id, detailPath!, season)}
                             className="btn-ghost flex-1 text-sm">
                            <Download size={15} /> Full Season ZIP
                          </a>
                        )}
                      </div>

                      {/* Links results */}
                      <AnimatePresence>
                        {links && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>
                                Video Qualities
                              </p>
                              <div className="grid gap-2">
                                {links.downloads.map((dl, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl transition-all"
                                       style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                                       onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,255,65,0.35)')}
                                       onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-black text-sm" style={{ color: 'var(--primary)' }}>{dl.resolution}</span>
                                      <span className="text-xs" style={{ color: 'var(--fg-3)' }}>{dl.size_mb} MB</span>
                                    </div>
                                    <div className="flex gap-2">
                                      {[
                                        { href: dl.url, icon: <Download size={15} />, title: 'Download' },
                                        { href: api.getStreamUrl(selectedMovie.subject_id, detailPath!, season, episode, dl.resolution.replace('p', '')), icon: <Play size={15} />, title: 'Stream' },
                                      ].map(btn => (
                                        <a key={btn.title} href={btn.href} title={btn.title}
                                           className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                           style={{ border: '1px solid var(--border)', color: 'var(--fg-2)' }}
                                           onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = '#000'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; }}
                                           onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
                                          {btn.icon}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {links.captions.length > 0 && (
                                <div className="space-y-3 pt-2">
                                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-3)' }}>Subtitles</p>
                                  <div className="flex flex-wrap gap-2">
                                    {links.captions.map((cap, idx) => (
                                      <a key={idx} href={cap.url}
                                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                         style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg-2)' }}
                                         onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--primary-dim)'; }}
                                         onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}>
                                        {cap.lang_name} <ExternalLink size={11} />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="py-8 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-3)' }}>
        <p className="font-medium tracking-wide">© 2026 Downloaderino &mdash; Built with ❤️ and green pixels</p>
      </footer>
    </div>
  );
};

export default App;
