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
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getYear(dateStr?: string): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 4);
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, isFavorite, onToggleFavorite, onClick, viewMode = 'grid' }) => {
  const year = getYear(item.releaseDate);
  const duration = formatDuration(item.duration);
  const isMovie = item.subjectType === 1;

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        className="flex items-center gap-4 p-3 rounded-2xl bg-surface border border-border-subtle hover:border-primary/30 cursor-pointer transition-all group hover:shadow-md"
        onClick={onClick}
      >
        <div className="w-16 h-24 rounded-xl overflow-hidden shrink-0 relative">
          <img
            src={item.cover.url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="flex-grow min-w-0 space-y-1.5">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {year && <span className="flex items-center gap-1"><Calendar size={9} />{year}</span>}
            {duration && <span className="flex items-center gap-1"><Clock size={9} />{duration}</span>}
            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{isMovie ? 'Movie' : 'Series'}</span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{item.genre}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.title); }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
            isFavorite
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
              : 'bg-background text-gray-400 border-border-subtle hover:border-primary hover:text-primary'
          }`}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={isFavorite ? 0 : 2} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="card cursor-pointer group animate-slide-up bg-surface border-border-subtle"
      onClick={onClick}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={item.cover.url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-1 rounded-md bg-primary text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-primary/40">
              {isMovie ? 'Movie' : 'Series'}
            </div>
          </div>
          <h3 className="text-white font-extrabold text-sm leading-tight line-clamp-2 drop-shadow-md">
            {item.title}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-white/70 text-[10px] font-semibold flex items-center gap-1">
              <Film size={10} className="text-primary" />
              {item.genre?.split(',')[0]}
            </span>
            <div className="flex items-center gap-1 text-primary">
              <Star size={10} fill="currentColor" />
              <span className="text-[10px] font-black">HD</span>
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.title); }}
            className={`w-9 h-9 backdrop-blur-md rounded-xl flex items-center justify-center border transition-all duration-300 ${
              isFavorite
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                : 'bg-black/20 text-white border-white/20 hover:bg-white hover:text-black hover:border-white'
            }`}
          >
            <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={isFavorite ? 0 : 2} />
          </button>
        </div>

        {/* Year tag */}
        {year && (
          <div className="absolute top-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity">
            <div className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
              {year}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-background">
        <h3 className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            {duration ? (
              <><Clock size={9} />{duration}</>
            ) : (
              <><Film size={9} />{isMovie ? 'Movie' : 'Series'}</>
            )}
          </span>
          <span className="text-primary truncate max-w-[60%] text-right">{item.genre?.split(',')[0]}</span>
        </div>
      </div>
    </motion.div>
  );
};
