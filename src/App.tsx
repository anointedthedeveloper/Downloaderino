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
import { RequestPage } from './pages/RequestPage';
import { trackVisit, trackSearch } from './analytics';

const linksCache = new Map<string, LinksResponse>();
const FEATURED_CACHE_KEY = 'dl_featured';

type View = 'home' | 'detail' | 'altsource' | 'admin' | '404' | 'request';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem('dl_dark') === '1' ||
    (!localStorage.getItem('dl_dark') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
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
  const [featured, setFeatured] = useState<MovieItem[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(FEATURED_CACHE_KEY) || '[]'); } catch { return []; }
  });
  const [featuredLoading, setFeaturedLoading] = useState(featured.length === 0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('dl_dark', isDarkMode ? '1' : '0');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('dl_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    trackVisit();
    if (featured.length > 0) { setFeaturedLoading(false); return; }
    setFeaturedLoading(true);
    Promise.all(['action', 'drama', 'thriller'].map(q => api.search(q, 1)))
      .then(responses => {
        const seen = new Set<string>();
        const all: MovieItem[] = [];
        for (const r of responses)
          for (const item of (r.data?.items || []))
            if (!seen.has(item.detailPath)) { seen.add(item.detailPath); all.push(item); }
        setFeatured(all);
        sessionStorage.setItem(FEATURED_CACHE_KEY, JSON.stringify(all));
      })
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = useCallback(async (path: string, pushState = true) => {
    setLoading(true);
    setDetailPath(path);
    setView('detail');
    if (pushState) window.history.pushState({ view: 'detail', path }, '', `/${path}`);
    try {
      const res = await api.getDetail(path);
      const detail = res.data;
      setSelectedMovie(detail);
      const isMovie = detail.seasons?.[0]?.se === 0;
      setSeason(isMovie ? 0 : 1);
      setEpisode(isMovie ? 0 : 1);
      setLinks(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setView('404'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'admin-analytics') {
      setView('admin');
      window.history.replaceState({ view: 'admin' }, '', '/admin-analytics');
    } else if (path === 'request') {
      setView('request');
      window.history.replaceState({ view: 'request' }, '', '/request');
    } else if (path) {
      loadDetail(path, false);
    } else {
      window.history.replaceState({ view: 'home' }, '', '/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'admin-analytics') { setView('admin'); setSelectedMovie(null); }
      else if (path === 'request') { setView('request'); }
      else if (path === '') { setView('home'); setSelectedMovie(null); setAltSourceDetail(null); }
      else { loadDetail(path, false); }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [loadDetail]);

  const processSearchData = (data: any, page: number) => {
    const seen = new Set<string>();
    const items: MovieItem[] = (data.primary || []).filter((item: MovieItem) => {
      if (seen.has(item.detailPath)) return false;
      seen.add(item.detailPath); return true;
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

  const handleSearch = async (q: string, page = 1) => {
    if (!q.trim()) return;
    setQuery(q);
    trackSearch(q);
    setLoading(true);
    setWakingUp(false);
    window.history.pushState({ view: 'home', q, page }, '', '/');
    try {
      const res = await api.searchAll(q, page);
      processSearchData(res.data, page);
    } catch (err: any) {
      if (err?.response?.status === 503) {
        setWakingUp(true);
        await new Promise(r => setTimeout(r, 4000));
        setWakingUp(false);
        try { processSearchData((await api.searchAll(q, page)).data, page); }
        catch { setView('404'); }
      } else { setView('404'); }
    } finally { setLoading(false); }
  };

  const loadLinks = async () => {
    if (!selectedMovie || !detailPath) return;
    const isMovie = selectedMovie.seasons?.[0]?.se === 0;
    const se = isMovie ? 0 : season;
    const ep = isMovie ? 0 : episode;
    const key = `${selectedMovie.subject_id}:${detailPath}:${se}:${ep}`;
    if (linksCache.has(key)) { setLinks(linksCache.get(key)!); return; }
    setLoading(true);
    try {
      const res = await api.getLinks(selectedMovie.subject_id, detailPath, se, ep);
      linksCache.set(key, res.data);
      setLinks(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const toggleFavorite = (title: string) =>
    setFavorites(prev => prev.includes(title) ? prev.filter(f => f !== title) : [...prev, title]);

  const loadAltSourceDetail = async (item: AltSourceItem) => {
    setAltSourceLoading(true);
    setAltSourceDetail({ title: item.title, cover: item.cover || '', description: '', url: item.url, source: 'altsource', downloads: [] });
    setView('altsource');
    window.history.pushState({ view: 'altsource' }, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try { setAltSourceDetail((await api.getAltSourceDetail(item.url)).data); }
    catch { /* silent */ }
    finally { setAltSourceLoading(false); }
  };

  const handleBackToHome = () => {
    setView('home'); setSelectedMovie(null); setAltSourceDetail(null);
    window.history.pushState({ view: 'home' }, '', '/');
  };

  const handleRequest = () => {
    setView('request');
    window.history.pushState({ view: 'request' }, '', '/request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const wrap = (key: string, node: React.ReactNode) => (
    <div key={key} className="container-custom pt-8 pb-20">{node}</div>
  );

  return (
    <Layout
      isDark={isDarkMode}
      onToggleDark={() => setIsDarkMode(d => !d)}
      favCount={favorites.length}
      onLogoClick={handleBackToHome}
      onRequest={handleRequest}
      onSearchFocus={() => {
        handleBackToHome();
        setTimeout(() => {
          const el = document.getElementById('hero-search');
          if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); }
        }, 50);
      }}
    >
      <AnimatePresence mode="wait">
        {view === 'admin' && wrap('admin', <AdminAnalytics onBack={handleBackToHome} />)}
        {view === '404' && wrap('404', <NotFound onBack={handleBackToHome} />)}
        {view === 'request' && wrap('request', <RequestPage onBack={handleBackToHome} />)}
        {view === 'altsource' && altSourceDetail && wrap('altsource',
          <AltSourceDetailView detail={altSourceDetail} loading={altSourceLoading} onBack={handleBackToHome} />
        )}
        {view === 'detail' && selectedMovie && wrap('detail',
          <MovieDetailView
            movie={selectedMovie}
            onBack={() => { setView('home'); window.history.back(); }}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(selectedMovie.title)}
            onWatchTrailer={setTrailerUrl}
            season={season} setSeason={setSeason}
            episode={episode} setEpisode={setEpisode}
            links={links} loadLinks={loadLinks}
            loading={loading} detailPath={detailPath!}
          />
        )}
        {view === 'detail' && loading && !selectedMovie && (
          <div key="detail-loading" className="container-custom pt-8 pb-20 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-400">Loading…</p>
            </div>
          </div>
        )}
        {(view === 'home' || (view === 'altsource' && !altSourceDetail)) && (
          <HomePage
            key="home"
            results={results} altsource={altSource}
            featured={featured} featuredLoading={featuredLoading}
            loading={loading} wakingUp={wakingUp}
            currentPage={currentPage} totalPages={totalPages}
            favorites={favorites} query={query}
            onSearch={handleSearch} onSelectMovie={loadDetail}
            onSelectAltSource={loadAltSourceDetail} onToggleFav={toggleFavorite}
            onRequest={handleRequest}
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
