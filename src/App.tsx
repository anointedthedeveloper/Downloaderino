import React, { useState, useEffect } from 'react';
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

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notFound, setNotFound] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [featured, setFeatured] = useState<MovieItem[]>([]);

  useEffect(() => { trackVisit(); }, []);

  useEffect(() => {
    api.getFeatured().then(r => {
      const raw: MovieItem[] = r.data?.items || r.data || [];
      setFeatured(raw);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin-analytics') {
      setShowAdmin(true);
    } else if (path !== '/') {
      const slug = path.replace('/', '');
      sessionStorage.setItem('dl_reload_slug', slug);
      loadDetail(slug);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin-analytics') {
        setShowAdmin(true);
        setSelectedMovie(null);
        setNotFound(false);
      } else if (path === '/') {
        setNotFound(false);
        setSelectedMovie(null);
        setAltSourceDetail(null);
        setShowAdmin(false);
      } else {
        setShowAdmin(false);
        setNotFound(false);
        setAltSourceDetail(null);
        loadDetail(path.replace('/', ''));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      const slug = selectedMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      window.history.pushState({}, '', `/${slug}`);
    } else if (showAdmin) {
      window.history.pushState({}, '', '/admin-analytics');
    } else if (!notFound) {
      window.history.pushState({}, '', '/');
    }
  }, [selectedMovie, notFound, showAdmin]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

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
  };

  const handleSearch = async (q: string, page: number = 1) => {
    if (!q) return;
    setQuery(q);
    trackSearch(q);
    setLoading(true);
    setNotFound(false);
    setWakingUp(false);
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
        } catch {
          setNotFound(true);
        }
      } else {
        console.error(error);
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (path: string) => {
    setLoading(true);
    setDetailPath(path);
    setNotFound(false);
    try {
      const response = await api.getDetail(path);
      const detail = response.data;
      setSelectedMovie(detail);
      const firstSeason = detail.seasons?.[0];
      const isMovie = firstSeason?.se === 0;
      setSeason(isMovie ? 0 : 1);
      setEpisode(isMovie ? 0 : 1);
      setLinks(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      setNotFound(true);
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
    if (linksCache.has(cacheKey)) {
      setLinks(linksCache.get(cacheKey)!);
      return;
    }
    setLoading(true);
    try {
      const response = await api.getLinks(selectedMovie.subject_id, detailPath, effectiveSe, effectiveEp);
      linksCache.set(cacheKey, response.data);
      setLinks(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (title: string) => {
    setFavorites(prev =>
      prev.includes(title) ? prev.filter(f => f !== title) : [...prev, title]
    );
  };

  const loadAltSourceDetail = async (item: AltSourceItem) => {
    setAltSourceLoading(true);
    setAltSourceDetail({ title: item.title, cover: item.cover || '', description: '', url: item.url, source: 'altsource', downloads: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await api.getAltSourceDetail(item.url);
      setAltSourceDetail(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setAltSourceLoading(false);
    }
  };

  const handleBackToHome = () => {
    setNotFound(false);
    setShowAdmin(false);
    setSelectedMovie(null);
    setAltSourceDetail(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <Layout
      isDark={isDarkMode}
      onToggleDark={() => setIsDarkMode(!isDarkMode)}
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
      <div className="container-custom pt-8 pb-20">
        <AnimatePresence mode="wait">
          {showAdmin ? (
            <AdminAnalytics key="admin" onBack={handleBackToHome} />
          ) : notFound ? (
            <NotFound key="404" onBack={handleBackToHome} />
          ) : altSourceDetail ? (
            <AltSourceDetailView
              key="altsource"
              detail={altSourceDetail}
              loading={altSourceLoading}
              onBack={handleBackToHome}
            />
          ) : selectedMovie ? (
            <MovieDetailView
              key="detail"
              movie={selectedMovie}
              onBack={() => setSelectedMovie(null)}
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
          ) : (
            <HomePage
              key="home"
              results={results}
              altsource={altSource}
              featured={featured}
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
      </div>

      <AnimatePresence>
        {trailerUrl && (
          <TrailerModal url={trailerUrl} onClose={() => setTrailerUrl(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default App;
