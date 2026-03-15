import React from 'react';
import { 
  ArrowLeft, Star, Clock, Play, Heart, Download, 
  Layers, Film, Calendar, Globe, Award, ExternalLink, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieDetail, LinksResponse } from '../types';
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

export const MovieDetailView: React.FC<MovieDetailViewProps> = ({
  movie, onBack, onToggleFavorite, isFavorite, onWatchTrailer,
  season, setSeason, episode, setEpisode, links, loadLinks, loading, detailPath
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-12 pb-20"
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

      <div className="grid lg:grid-cols-[380px_1fr] gap-12 lg:gap-16">
        {/* Sidebar / Poster Section */}
        <div className="space-y-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative rounded-[32px] overflow-hidden shadow-2xl border border-border-subtle group aspect-[2/3]"
          >
            <img
              src={movie.cover}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute top-4 left-4 flex gap-2">
               <div className="px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/40">
                Premium 4K
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Star} label="IMDb" value={movie.imdb_rating ? `⭐ ${movie.imdb_rating}` : 'N/A'} />
            <StatCard icon={Award} label="Quality" value="Ultra HD" />
          </div>

          <div className="space-y-3">
             {movie.trailer_url && (
              <button
                onClick={() => onWatchTrailer(movie.trailer_url!)}
                className="w-full h-14 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all hover:shadow-xl hover:shadow-red-600/20 active:scale-95 group"
              >
                <Play size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" /> 
                Watch Trailer
              </button>
            )}

            <button 
              onClick={() => onToggleFavorite(movie.title)}
              className={`w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-black transition-all border-2 active:scale-95 ${
                isFavorite 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-surface border-border-subtle text-foreground hover:border-primary hover:text-primary shadow-sm"
              }`}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? "Saved to Library" : "Add to Library"}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                  <Film size={14} />
                  <span>Movie Details</span>
               </div>
               <h2 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                {movie.title}
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {movie.genre.split(',').map(g => (
                <span key={g} className="px-4 py-2 rounded-xl bg-surface border border-border-subtle text-gray-500 text-xs font-bold uppercase tracking-wider hover:border-primary/30 hover:text-primary transition-all cursor-default">
                  {g.trim()}
                </span>
              ))}
            </div>

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg font-medium max-w-3xl">
              {movie.description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <StatCard icon={Calendar} label="Released" value={movie.release_date} />
            <StatCard icon={Globe} label="Country" value={movie.country} />
            <StatCard icon={Zap} label="Server" value="Node-01 (Ultra)" />
          </div>

          {/* Download Center */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-surface border border-border-subtle rounded-[32px] p-8 md:p-10 shadow-2xl space-y-10 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                 <Download size={120} strokeWidth={3} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border-subtle pb-8">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Download size={32} className="text-primary" /> Download Center
                  </h3>
                  <p className="text-sm font-medium text-gray-400">Select your preferred format and generate direct links.</p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Encrypted Tunnel Active
                </div>
              </div>

              {movie.seasons.length > 0 && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Layers size={14} className="text-primary" /> Select Season
                    </label>
                    <select
                      value={season}
                      onChange={(e) => { setSeason(Number(e.target.value)); }}
                      className="input-base h-14 font-bold text-base bg-background"
                    >
                      {movie.seasons.map(s => (
                        <option key={s.number} value={s.number}>Season {s.number}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Film size={14} className="text-primary" /> Episode Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={movie.seasons.find(s => s.number === season)?.episodes_count || 100}
                      value={episode}
                      onChange={(e) => { setEpisode(Number(e.target.value)); }}
                      className="input-base h-14 font-bold text-base bg-background"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={loadLinks}
                  disabled={loading}
                  className="flex-grow h-16 btn btn-primary text-lg rounded-2xl shadow-xl shadow-primary/20 group"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Indexing Database...
                    </div>
                  ) : (
                    <>
                      <Zap size={20} className="group-hover:scale-110 transition-transform" /> 
                      Generate High-Speed Links
                    </>
                  )}
                </button>

                {movie.seasons.length > 0 && (
                  <a
                    href={api.getSeasonStreamUrl(movie.subject_id, detailPath, season)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-16 px-8 btn btn-outline rounded-2xl group"
                  >
                    <ExternalLink size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
                    Full Stream
                  </a>
                )}
              </div>

              {/* Links Display */}
              <AnimatePresence>
                {links && links.downloads && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 pt-6"
                  >
                    <div className="flex items-center gap-3">
                       <ShieldCheck size={18} className="text-primary" />
                       <h4 className="font-black text-sm uppercase tracking-widest text-gray-400">Available Direct Mirrors</h4>
                    </div>
                    <div className="grid gap-4">
                      {links.downloads.map((link, idx) => (
                        <motion.a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-between p-5 bg-background border border-border-subtle rounded-2xl hover:border-primary/50 transition-all group hover:shadow-lg active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-primary font-black text-xs shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                              {link.resolution.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors">{link.resolution} — {link.format}</p>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{link.size_mb} MB</span>
                                 <div className="w-1 h-1 rounded-full bg-gray-300" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">High-Speed CDN</span>
                              </div>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                             <ExternalLink size={20} />
                          </div>
                        </motion.a>
                      ))}
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
