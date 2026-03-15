import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { api } from './api';
import type { MovieItem, MovieDetail, LinksResponse } from './types';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import { MovieDetailView } from './components/MovieDetailView';
import { TrailerModal } from './components/TrailerModal';
import { NotFound } from './components/NotFound';

const linksCache = new Map<string, LinksResponse>();

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [results, setResults] = useState<MovieItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailPath, setDetailPath] = useState<string | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [links, setLinks] = useState<LinksResponse | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [notFound, setNotFound] = useState(false);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname !== '/') {
        // Simple routing logic - if not home, show 404 or try to load if we had more complex routing
        setNotFound(true);
      } else {
        setNotFound(false);
        setSelectedMovie(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when movie is selected
  useEffect(() => {
    if (selectedMovie) {
      const slug = selectedMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      window.history.pushState({}, '', `/${slug}`);
    } else if (!notFound) {
      window.history.pushState({}, '', '/');
    }
  }, [selectedMovie, notFound]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleSearch = async (query: string, page: number = 1) => {
    if (!query) return;
    setLoading(true);
    setNotFound(false);
    try {
      const response = await api.search(query, page);
      const items = response.data.items || [];
      setResults(items);
      setTotalPages(response.data.pager?.pages || 1);
      const total =
        response.data.pager?.total ||
        response.data.pager?.total_items ||
        response.data.counts ||
        response.data.total ||
        items.length;
      setTotalResults(total);
      setCurrentPage(page);
      setSelectedMovie(null);
    } catch (error) {
      console.error(error);
      setNotFound(true);
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
      setSelectedMovie(response.data);
      setSeason(1);
      setEpisode(1);
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
    const cacheKey = `${selectedMovie.subject_id}:${detailPath}:${season}:${episode}`;
    if (linksCache.has(cacheKey)) {
      setLinks(linksCache.get(cacheKey)!);
      return;
    }
    setLoading(true);
    try {
      const response = await api.getLinks(selectedMovie.subject_id, detailPath, season, episode);
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
      prev.includes(title) 
        ? prev.filter(f => f !== title)
        : [...prev, title]
    );
  };

  const handleBackToHome = () => {
    setNotFound(false);
    setSelectedMovie(null);
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
          {notFound ? (
            <NotFound key="404" onBack={handleBackToHome} />
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
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              favorites={favorites}
              onSearch={handleSearch}
              onSelectMovie={loadDetail}
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
