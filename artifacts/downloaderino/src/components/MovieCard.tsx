import React from 'react';
import { Film, Heart, Star, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MovieItem } from '../types';

interface MovieCardProps {
  item: MovieItem;
  isFavorite: boolean;
  onToggleFavorite: (title: string) => void;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getYear(dateStr?: string): string {
  return dateStr ? dateStr.slice(0, 4) : '';
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, isFavorite, onToggleFavorite, onClick, viewMode = 'grid' }) => {
  const year = getYear(item.releaseDate);
  const duration = formatDuration(item.duration);
  const isMovie = item.subjectType === 1;

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 3 }}
        className="flex items-center gap-4 p-3 rounded-2xl bg-surface border border-border-subtle hover:border-primary/30 cursor-pointer transition-all group"
        onClick={onClick}
      >
        <div className="w-14 h-20 rounded-xl overflow-hidden shrink-0">
          <img src={item.cover.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
        <div className="flex-grow min-w-0 space-y-1.5">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {year && <span className="flex items-center gap-1"><Calendar size={9} />{year}</span>}
            {duration && <span className="flex items-center gap-1"><Clock size={9} />{duration}</span>}
            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{isMovie ? 'Movie' : 'Series'}</span>
            {item.imdbRatingValue && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500">
                <Star size={9} fill="currentColor" /> {item.imdbRatingValue}
              </span>
            )}
          </div>
          {item.genre && <p className="text-[10px] text-gray-400 line-clamp-1">{item.genre}</p>}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(item.title); }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all shrink-0 ${isFavorite ? 'bg-primary text-white border-primary' : 'bg-background text-gray-400 border-border-subtle hover:border-primary hover:text-primary'}`}
        >
          <Heart size={13} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={isFavorite ? 0 : 2} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="cursor-pointer group rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-primary/30 hover:shadow-xl transition-all duration-300"
      onClick={onClick}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-surface">
        <img
          src={item.cover.url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-black uppercase tracking-wider">
              {isMovie ? 'Movie' : 'Series'}
            </span>
            {item.imdbRatingValue && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 text-[9px] font-black">
                <Star size={8} fill="currentColor" /> {item.imdbRatingValue}
              </span>
            )}
          </div>
          <p className="text-white/70 text-[10px] font-medium line-clamp-1">
            {item.genre?.split(',')[0]}
          </p>
        </div>

        {/* IMDb badge — visible when not hovered */}
        {item.imdbRatingValue && (
          <div className="absolute bottom-2.5 left-2.5 group-hover:opacity-0 transition-opacity">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-yellow-400 text-[10px] font-black border border-white/10">
              <Star size={8} fill="currentColor" /> {item.imdbRatingValue}
            </div>
          </div>
        )}

        {/* Year badge */}
        {year && (
          <div className="absolute top-2.5 left-2.5 group-hover:opacity-0 transition-opacity">
            <div className="px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold border border-white/10">
              {year}
            </div>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(item.title); }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 backdrop-blur-sm rounded-xl flex items-center justify-center border transition-all duration-200 ${isFavorite ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-black/30 text-white/80 border-white/20 hover:bg-white hover:text-black hover:border-white'}`}
        >
          <Heart size={13} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={isFavorite ? 0 : 2} />
        </button>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors mb-1">{item.title}</h3>
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
          <span className="flex items-center gap-1">
            {duration ? <><Clock size={9} />{duration}</> : <><Film size={9} />{isMovie ? 'Movie' : 'Series'}</>}
          </span>
          {item.genre && <span className="text-gray-400 truncate max-w-[55%] text-right">{item.genre.split(',')[0]}</span>}
        </div>
      </div>
    </motion.div>
  );
};
