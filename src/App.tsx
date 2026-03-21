import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { api } from './api';
import type { MovieItem, MovieDetail, LinksResponse, AltSourceItem, AltSourceDetail } from './types';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import { MovieDetailView } from './components/MovieDetailView';
import { TrailerModal } from './components/TrailerModal';
import { AltSourceDetailView } from './components/AltSourceDetailView';
import { NotFound } from './components/NotFound';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { trackVisit, trackSearch } from './analytics';

const linksCache = new Map<string, LinksResponse>();

type View = 'home' | 'detail' | 'altsource' | 'admin' | '404';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('dl_dark') === '1' ||
      (!localStorage.getItem('dl_dark') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [view, setView] = useState<View>('home');
  const [results, setResults] = useState<MovieItem[]>([]);
  const [altSource, setAltSource] = useState<AltSourceItem[]>([]);
  const [altSourceDetail, setAltSourceDetail] = useState<AltSourceDetail | null>(null);
  const [altSourceLoading, setAltSourceLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [detailPath, setDetailPath] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [links, setLinks] = useState<LinksResponse | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('dl_favs') || '[]'); } catch { return []; }
  });
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featured, setFeatured] = useState<MovieItem[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Persist dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('dl_dark', isDarkMode ? '1' : '0');
  }, [isDarkMode]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('dl_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Load featured
  useEffect(() => {
    trackVisit();
    setFeaturedLoading(true);
    const queries = ['action', 'drama', 'thriller'];
    Promise.all(queries.map(q => api.search(q, 1)))
      .then(responses => {
        const seen = new Set<string>();
        const all: MovieItem[] = [];
        for (const r of responses) {
          for (const item of (r.data?.items || [])) {
            if (!seen.has(item.detailPath)) { seen.add(item.detailPath); all.push(item); }
          }
        }
        setFeatured(all);
      })
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));
  }, []);

  const loadDetail = useCallback(async (path: string, pushState = true) => {
    setLoading(true);
    setDetailPath(path);
    setView('detail');
    if (pushState) window.history.pushState({ view: 'detail', path }, '', `/${path}`);
    try {
      const response = await api.getDetail(path);
      const detail = response.data;
      setSelectedMovie(detail);
      const isMovie = detail.seasons?.[0]?.se === 0;
      setSeason(isMovie ? 0 : 1);
      setEpisode(isMovie ? 0 : 1);
      setLinks(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setView('404');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle initial URL on load
  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'admin-analytics') {
      setView('admin');
      window.history.replaceState({ view: 'admin' }, '', '/admin-analytics');
    } else if (path && path !== '') {
      loadDetail(path, false);
    } else {
      window.history.replaceState({ view: 'home' }, '', '/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser back/forward
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'admin-analytics') {
        setView('admin');
        setSelectedMovie(null);
      } else if (path === '') {
        setView('home');
        setSelectedMovie(null);
        setAltSourceDetail(null);
      } else {
        loadDetail(path, false);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [loadDetail]);

  const processSearchData = (data: any, page: number) => {
    const rawItems: MovieItem[] = data.primary || [];
    const seen = new Set<string>();
    const items = rawItems.filter((item: MovieItem) => {
      if (seen.has(item.detailPath)) return false;
      seen.add(item.detailPath);
      return true;
    });
    const normalize = (t: string) =>
      t.toLowerCase().replace(/\b(download|movie|series|season|episode|\d+)\b/g, '').replace(/\s+/g, ' ').trim();
    const primaryTitles = new Set(items.map(i => normalize(i.title)));
    const altItems: AltSourceItem[] = (data.netnaija || []).filter(
      (n: AltSourceItem) => !primaryTitles.has(normalize(n.title))
    );
    setResults(items);
    setAltSource(!data.errors?.netnaija ? altItems : []);
    setTotalPages(data.pager?.pages || 1);
    setCurrentPage(page);
    setSelectedMovie(null);
    setAltSourceDetail(null);
    setView('home');
  };

  const handleSearch = async (q: string, page: number = 1) => {
    if (!q.trim()) return;
    setQuery(q);
    trackSearch(q);
    setLoading(true);
    setWakingUp(false);
    window.history.pushState({ view: 'home', q, page }, '', '/');
    try {
      const response = await api.searchAll(q, page);
      processSearchData(response.data, page);
    } catch (error: any) {
      if (error?.response?.status === 503) {
        setWakingUp(true);
        await new Promise(r => setTimeout(r, 4000));
        setWakingUp(false);
        try {
          const response = await api.searchAll(q, page);
          processSearchData(response.data, page);
        } catch { setView('404'); }
      } else {
        setView('404');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLinks = async () => {
    if (!selectedMovie || !detailPath) return;
    const isMovie = selectedMovie.seasons?.[0]?.se === 0;
    const effectiveSe = isMovie ? 0 : season;
    const effectiveEp = isMovie ? 0 : episode;
    const cacheKey = `${selectedMovie.subject_id}:${detailPath}:${effectiveSe}:${effectiveEp}`;
    if (linksCache.has(cacheKey)) { setLinks(linksCache.get(cacheKey)!); return; }
    setLoading(true);
    try {
      const response = await api.getLinks(selectedMovie.subject_id, detailPath, effectiveSe, effectiveEp);
      linksCache.set(cacheKey, response.data);
      setLinks(response.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const toggleFavorite = (title: string) => {
    setFavorites(prev => prev.includes(title) ? prev.filter(f => f !== title) : [...prev, title]);
  };

  const loadAltSourceDetail = async (item: AltSourceItem) => {
    setAltSourceLoading(true);
    setAltSourceDetail({ title: item.title, cover: item.cover || '', description: '', url: item.url, source: 'altsource', downloads: [] });
    setView('altsource');
    window.history.pushState({ view: 'altsource' }, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await api.getAltSourceDetail(item.url);
      setAltSourceDetail(res.data);
    } catch { /* silent */ }
    finally { setAltSourceLoading(false); }
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedMovie(null);
    setAltSourceDetail(null);
    window.history.pushState({ view: 'home' }, '', '/');
  };

  return (
    <Layout
      isDark={isDarkMode}
      onToggleDark={() => setIsDarkMode(d => !d)}
      favCount={favorites.length}
      onLogoClick={handleBackToHome}
      onSearchFocus={() => {
        handleBackToHome();
        setTimeout(() => {
          const el = document.getElementById('hero-search');
          if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); }
        }, 50);
      }}
    >
      <AnimatePresence mode="wait">
        {view === 'admin' ? (
          <div className="container-custom pt-8 pb-20">
            <AdminAnalytics key="admin" onBack={handleBackToHome} />
          </div>
        ) : view === '404' ? (
          <div className="container-custom pt-8 pb-20">
            <NotFound key="404" onBack={handleBackToHome} />
          </div>
        ) : view === 'altsource' && altSourceDetail ? (
          <div className="container-custom pt-8 pb-20">
            <AltSourceDetailView key="altsource" detail={altSourceDetail} loading={altSourceLoading} onBack={handleBackToHome} />
          </div>
        ) : view === 'detail' && selectedMovie ? (
          <div className="container-custom pt-8 pb-20">
            <MovieDetailView
              key="detail"
              movie={selectedMovie}
              onBack={() => { setView('home'); window.history.back(); }}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.includes(selectedMovie.title)}
              onWatchTrailer={setTrailerUrl}
              season={season}
              setSeason={setSeason}
              episode={episode}
              setEpisode={setEpisode}
              links={links}
              loadLinks={loadLinks}
              loading={loading}
              detailPath={detailPath!}
            />
          </div>
        ) : view === 'detail' && loading ? (
          <div key="detail-loading" className="container-custom pt-8 pb-20 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-400">Loading…</p>
            </div>
          </div>
        ) : (
          <HomePage
            key="home"
            results={results}
            altsource={altSource}
            featured={featured}
            featuredLoading={featuredLoading}
            loading={loading}
            wakingUp={wakingUp}
            currentPage={currentPage}
            totalPages={totalPages}
            favorites={favorites}
            query={query}
            onSearch={handleSearch}
            onSelectMovie={loadDetail}
            onSelectAltSource={loadAltSourceDetail}
            onToggleFav={toggleFavorite}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {trailerUrl && <TrailerModal url={trailerUrl} onClose={() => setTrailerUrl(null)} />}
      </AnimatePresence>
    </Layout>
  );
};

export default App;
