import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft, Star, Play, Heart, Download,
  Layers, Film, Calendar, Globe, Award, ExternalLink, ShieldCheck, Zap, Clock, X, Package, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MovieDetail, LinksResponse } from '../types';
import { StatCard } from './StatCard';
import { api } from '../api';

interface MovieDetailViewProps {
  movie: MovieDetail;
  onBack: () => void;
  onToggleFavorite: (title: string) => void;
  isFavorite: boolean;
  onWatchTrailer: (url: string) => void;
  season: number;
  setSeason: (s: number) => void;
  episode: number;
  setEpisode: (e: number) => void;
  links: LinksResponse | null;
  loadLinks: () => void;
  loading: boolean;
  detailPath: string;
}

interface DownloadTask {
  id: string;
  name: string;
  url: string;
  progress: number;
  status: 'downloading' | 'done' | 'error' | 'bg';
  size?: string;
  background?: boolean;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getYear(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 4);
}

// In-app download using fetch + ReadableStream for progress
async function downloadWithProgress(
  url: string,
  filename: string,
  onProgress: (pct: number) => void,
  signal: AbortSignal
) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentLength = res.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  const reader = res.body!.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) onProgress(Math.round((received / total) * 100));
    else onProgress(-1); // indeterminate
  }
  const blob = new Blob(chunks);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const MovieDetailView: React.FC<MovieDetailViewProps> = ({
  movie, onBack, onToggleFavorite, isFavorite, onWatchTrailer,
  season, setSeason, episode, setEpisode, links, loadLinks, loading, detailPath
}) => {
  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  const [seasonQuality, setSeasonQuality] = useState<string>('');
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);
  const [rangeQuality, setRangeQuality] = useState<string>('');
  const abortRefs = useRef<Record<string, AbortController>>({});

  const isMovie = movie.seasons?.[0]?.se === 0;

  const currentSeason = movie.seasons.find(s => s.se === season) ?? movie.seasons.find((s, idx) => (s.number ?? s.season_number ?? idx + 1) === season);
  const maxEp = currentSeason?.max_ep ?? currentSeason?.episodes_count ?? currentSeason?.episode_count ?? currentSeason?.episodes ?? 0;
  const episodeList = maxEp > 0 ? Array.from({ length: maxEp }, (_, i) => i + 1) : [];

  // Available resolutions from current season or links
  const seasonResolutions: string[] = currentSeason?.resolutions
    ? currentSeason.resolutions.map(String)
    : links?.downloads?.map(d => String(d.resolution)) ?? ['360', '480', '720'];

  const effectiveSe = isMovie ? 0 : season;
  const effectiveEp = isMovie ? 0 : episode;

  // Set default qualities when resolutions available
  useEffect(() => {
    if (seasonResolutions.length > 0) {
      const best = seasonResolutions[seasonResolutions.length - 1];
      if (!seasonQuality) setSeasonQuality(best);
      if (!rangeQuality) setRangeQuality(best);
    }
  }, [seasonResolutions.join(',')]);

  const duration = formatDuration(movie.duration ?? 0);
  const year = getYear(movie.release_date);

  const startDownload = async (url: string, filename: string, size?: string) => {
    const id = Date.now().toString();
    const ctrl = new AbortController();
    abortRefs.current[id] = ctrl;
    setDownloads(prev => [...prev, { id, name: filename, url, progress: 0, status: 'downloading', size }]);
    try {
      await downloadWithProgress(url, filename, (pct) => {
        setDownloads(prev => prev.map(d => d.id === id ? { ...d, progress: pct < 0 ? 50 : pct } : d));
      }, ctrl.signal);
      setDownloads(prev => prev.map(d => d.id === id ? { ...d, progress: 100, status: 'done' } : d));
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setDownloads(prev => prev.map(d => d.id === id ? { ...d, status: 'error' } : d));
      }
    }
  };

  const cancelDownload = (id: string) => {
    abortRefs.current[id]?.abort();
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  const buildFilename = (resolution: string, format = 'mp4', isSeason = false) => {
    const title = movie.title.replace(/[^a-z0-9]/gi, '_');
    if (isSeason) return `${title}_S${String(season).padStart(2,'0')}_${resolution}p.zip`;
    const epLabel = isMovie ? '' : `_S${String(effectiveSe).padStart(2,'0')}E${String(effectiveEp).padStart(2,'0')}`;
    return `${title}${epLabel}_${resolution}p.${format || 'mp4'}`;
  };

  const handleInAppDownload = (resolution: string, format: string, sizeMb: string, isSeason = false, epFrom?: number, epTo?: number) => {
    const filename = epFrom != null
      ? `${movie.title.replace(/[^a-z0-9]/gi, '_')}_S${String(season).padStart(2,'0')}E${String(epFrom).padStart(2,'0')}-E${String(epTo).padStart(2,'0')}_${resolution}p.zip`
      : buildFilename(resolution, format, isSeason);
    const url = isSeason || epFrom != null
      ? api.getSeasonStreamUrl(movie.subject_id, detailPath, season, resolution, 'en', 'folder', epFrom, epTo)
      : api.getStreamUrl(movie.subject_id, detailPath, effectiveSe, effectiveEp, resolution);
    startDownload(url, filename, sizeMb ? `${sizeMb} MB` : undefined);
  };

  const handleDirectDownload = (resolution: string, format: string, isSeason = false, epFrom?: number, epTo?: number) => {
    const filename = epFrom != null
      ? `${movie.title.replace(/[^a-z0-9]/gi, '_')}_S${String(season).padStart(2,'0')}E${String(epFrom).padStart(2,'0')}-E${String(epTo).padStart(2,'0')}_${resolution}p.zip`
      : buildFilename(resolution, format, isSeason);
    const url = isSeason || epFrom != null
      ? api.getSeasonStreamUrl(movie.subject_id, detailPath, season, resolution, 'en', 'folder', epFrom, epTo)
      : api.getStreamUrl(movie.subject_id, detailPath, effectiveSe, effectiveEp, resolution);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const sendToBackground = (id: string) => {
    setDownloads(prev => prev.map(d => d.id === id ? { ...d, background: true } : d));
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-8 pb-20"
    >
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border-subtle text-sm font-bold text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
      >
        <ArrowLeft size={16} />
        <span>Back to catalogue</span>
      </motion.button>

      {/* Download Progress Panel */}
      <AnimatePresence>
        {downloads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 right-6 z-50 w-80 space-y-2"
          >
            {downloads.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">{task.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {task.status === 'done' ? '✓ Complete' :
                       task.status === 'error' ? '✗ Failed' :
                       task.background ? `⬇ Background · ${task.progress > 0 ? task.progress + '%' : '…'}` :
                       task.size ? `${task.size} · ${task.progress}%` : `Downloading… ${task.progress > 0 ? task.progress + '%' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {task.status === 'downloading' && !task.background && (
                      <button
                        onClick={() => sendToBackground(task.id)}
                        title="Send to background"
                        className="w-6 h-6 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                      >
                        <WifiOff size={11} />
                      </button>
                    )}
                    <button
                      onClick={() => cancelDownload(task.id)}
                      className="w-6 h-6 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${task.status === 'error' ? 'bg-red-500' : task.status === 'done' ? 'bg-primary' : 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: task.status === 'downloading' && task.progress === 0 ? '30%' : `${task.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {task.status === 'downloading' && task.progress === 0 && (
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full">
                    <motion.div
                      className="h-full w-1/3 bg-primary/40 rounded-full"
                      animate={{ x: ['0%', '300%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episode Range Modal */}
      <AnimatePresence>
        {showRangeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowRangeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface border border-border-subtle rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Film size={20} className="text-primary" /> Episode Range ZIP
                </h3>
                <button onClick={() => setShowRangeModal(false)} className="w-8 h-8 rounded-xl bg-background border border-border-subtle flex items-center justify-center text-gray-400 hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
              <p className="text-sm text-gray-400 font-medium">Download a range of episodes from Season {season} as a ZIP.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">From</label>
                  <select value={rangeFrom} onChange={e => { const v = Number(e.target.value); setRangeFrom(v); if (rangeTo < v) setRangeTo(v); }} className="input-base h-11 font-bold text-sm bg-background w-full">
                    {episodeList.map(ep => <option key={ep} value={ep}>Ep {ep}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">To</label>
                  <select value={rangeTo} onChange={e => setRangeTo(Number(e.target.value))} className="input-base h-11 font-bold text-sm bg-background w-full">
                    {episodeList.filter(ep => ep >= rangeFrom).map(ep => <option key={ep} value={ep}>Ep {ep}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {(seasonResolutions.length > 0 ? seasonResolutions : ['360', '480', '720']).map(res => (
                    <button key={res} onClick={() => setRangeQuality(res)}
                      className={`py-3 rounded-xl text-sm font-black border transition-all ${
                        rangeQuality === res ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-background border-border-subtle text-gray-500 hover:border-primary hover:text-primary'
                      }`}>{res}p</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { handleInAppDownload(rangeQuality, 'zip', '', false, rangeFrom, rangeTo); setShowRangeModal(false); }} disabled={!rangeQuality} className="h-12 btn btn-primary rounded-2xl font-black text-sm">
                  <Download size={16} /> In-App
                </button>
                <button onClick={() => { handleDirectDownload(rangeQuality, 'zip', false, rangeFrom, rangeTo); setShowRangeModal(false); }} disabled={!rangeQuality} className="h-12 btn btn-outline rounded-2xl font-black text-sm">
                  <ExternalLink size={16} /> Direct
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Season Quality Modal */}
      <AnimatePresence>
        {showSeasonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowSeasonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface border border-border-subtle rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Package size={20} className="text-primary" /> Full Season ZIP
                </h3>
                <button onClick={() => setShowSeasonModal(false)} className="w-8 h-8 rounded-xl bg-background border border-border-subtle flex items-center justify-center text-gray-400 hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Download all episodes of Season {season} as a ZIP archive.
              </p>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Select Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {(seasonResolutions.length > 0 ? seasonResolutions : ['360', '480', '720']).map(res => (
                    <button
                      key={res}
                      onClick={() => setSeasonQuality(res)}
                      className={`py-3 rounded-xl text-sm font-black border transition-all ${
                        seasonQuality === res
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'bg-background border-border-subtle text-gray-500 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {res}p
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { handleInAppDownload(seasonQuality, 'zip', '', true); setShowSeasonModal(false); }}
                  disabled={!seasonQuality}
                  className="h-12 btn btn-primary rounded-2xl font-black text-sm"
                >
                  <Download size={16} /> In-App
                </button>
                <button
                  onClick={() => { handleDirectDownload(seasonQuality, 'zip', true); setShowSeasonModal(false); }}
                  disabled={!seasonQuality}
                  className="h-12 btn btn-outline rounded-2xl font-black text-sm"
                >
                  <ExternalLink size={16} /> Direct
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
        {/* Poster */}
        <div className="space-y-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative rounded-[24px] overflow-hidden shadow-2xl border border-border-subtle group aspect-[2/3] max-w-[260px] mx-auto lg:max-w-none"
          >
            <img
              src={movie.cover}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/40">
                {isMovie ? 'Movie' : 'Series'}
              </div>
            </div>
            {movie.imdb_rating && (
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm text-yellow-400 text-[10px] font-black flex items-center gap-1 shadow-xl">
                  <Star size={11} fill="currentColor" /> {movie.imdb_rating}
                </div>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Star} label="IMDb" value={movie.imdb_rating ? `⭐ ${movie.imdb_rating}` : 'N/A'} sub={movie.imdb_votes ? `${(movie.imdb_votes / 1000).toFixed(0)}K votes` : undefined} />
            <StatCard icon={Award} label="Quality" value="Ultra HD" />
          </div>

          <div className="space-y-2">
            {movie.trailer_url && (
              <button
                onClick={() => onWatchTrailer(movie.trailer_url!)}
                className="w-full h-11 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all hover:shadow-xl hover:shadow-red-600/20 active:scale-95 text-sm"
              >
                <Play size={16} fill="currentColor" /> Watch Trailer
              </button>
            )}
            <button
              onClick={() => onToggleFavorite(movie.title)}
              className={`w-full h-11 flex items-center justify-center gap-2 rounded-2xl font-black transition-all border-2 active:scale-95 text-sm ${
                isFavorite
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface border-border-subtle text-foreground hover:border-primary hover:text-primary shadow-sm'
              }`}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Saved to Library' : 'Add to Library'}
            </button>
          </div>
        </div>

        {/* Info + Download */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                <Film size={14} />
                <span>{isMovie ? 'Movie' : 'Series'} Details</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight">
                {movie.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-medium">
                {year && <span className="flex items-center gap-1"><Calendar size={13} />{year}</span>}
                {duration && <span className="flex items-center gap-1"><Clock size={13} />{duration}</span>}
                {movie.country && <span className="flex items-center gap-1"><Globe size={13} />{movie.country}</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genre?.split(',').map(g => (
                <span key={g} className="px-3 py-1.5 rounded-xl bg-surface border border-border-subtle text-gray-500 text-xs font-bold uppercase tracking-wider hover:border-primary/30 hover:text-primary transition-all cursor-default">
                  {g.trim()}
                </span>
              ))}
            </div>

            {movie.description && (
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base font-medium max-w-3xl">
                {movie.description}
              </p>
            )}
          </div>

          {/* Download Center */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-surface border border-border-subtle rounded-[24px] p-6 md:p-8 shadow-2xl space-y-7 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.04]">
                <Download size={90} strokeWidth={3} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <Download size={24} className="text-primary" /> Download Center
                  </h3>
                  <p className="text-xs font-medium text-gray-400">Choose In-App (with progress) or Direct (browser native) download per quality.</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Encrypted Tunnel Active
                </div>
              </div>

              {/* Season + Episode — series only */}
              {!isMovie && movie.seasons.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Layers size={13} className="text-primary" /> Season
                    </label>
                    <select
                      value={season}
                      onChange={e => { setSeason(Number(e.target.value)); setEpisode(1); }}
                      className="input-base h-11 font-bold text-sm bg-background w-full"
                    >
                      {movie.seasons.map((s, idx) => {
                        const num = s.se ?? s.number ?? s.season_number ?? (idx + 1);
                        return <option key={num} value={num}>Season {num}</option>;
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Film size={13} className="text-primary" /> Episode
                    </label>
                    {episodeList.length > 0 ? (
                      <select
                        value={episode}
                        onChange={e => setEpisode(Number(e.target.value))}
                        className="input-base h-11 font-bold text-sm bg-background w-full"
                      >
                        {episodeList.map(ep => (
                          <option key={ep} value={ep}>Episode {ep}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        value={episode}
                        onChange={e => setEpisode(Number(e.target.value))}
                        className="input-base h-11 font-bold text-sm bg-background w-full"
                        placeholder="Episode number"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={loadLinks}
                  disabled={loading}
                  className="flex-grow h-12 btn btn-primary text-sm rounded-2xl shadow-xl shadow-primary/20 group"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Indexing…
                    </div>
                  ) : (
                    <><Zap size={16} className="group-hover:scale-110 transition-transform" /> Get Download Links</>
                  )}
                </button>

                {!isMovie && movie.seasons.length > 0 && (
                  <>
                    <button onClick={() => setShowSeasonModal(true)} className="h-12 px-5 btn btn-outline rounded-2xl group shrink-0 text-sm">
                      <Package size={16} /> Full Season
                    </button>
                    {episodeList.length > 1 && (
                      <button onClick={() => { setRangeFrom(1); setRangeTo(Math.min(episodeList.length, 5)); setShowRangeModal(true); }} className="h-12 px-5 btn btn-outline rounded-2xl group shrink-0 text-sm">
                        <Film size={16} /> Ep Range
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Links */}
              <AnimatePresence>
                {links && links.downloads && links.downloads.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-2"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-primary" />
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400">
                        Available Qualities
                      </h4>
                    </div>
                    <div className="grid gap-3">
                      {links.downloads.map((link, idx) => {
                        const activeTask = downloads.find(d => d.name === buildFilename(String(link.resolution), link.format) && d.status === 'downloading');
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.07 }}
                            className="bg-background border border-border-subtle rounded-2xl overflow-hidden"
                          >
                            {/* Header row */}
                            <div className="flex items-center gap-4 px-4 pt-4 pb-3">
                              <div className="w-11 h-11 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-primary font-black text-xs shadow-sm shrink-0">
                                {link.resolution || '?'}p
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="font-bold text-foreground text-sm">
                                  {link.resolution}p — {(link.format || 'mp4').toUpperCase()}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                                  {link.size_mb ? `${link.size_mb} MB` : 'Size N/A'}
                                </p>
                              </div>
                            </div>
                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-px bg-border-subtle">
                              <button
                                onClick={() => handleInAppDownload(String(link.resolution), link.format, link.size_mb)}
                                disabled={!!activeTask}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-background hover:bg-primary/5 text-xs font-black text-primary transition-colors disabled:opacity-50"
                              >
                                {activeTask
                                  ? <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Downloading…</>
                                  : <><Download size={13} /> In-App</>}
                              </button>
                              <button
                                onClick={() => handleDirectDownload(String(link.resolution), link.format)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-background hover:bg-surface text-xs font-black text-gray-400 hover:text-foreground transition-colors border-l border-border-subtle"
                              >
                                <ExternalLink size={13} /> Direct
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
