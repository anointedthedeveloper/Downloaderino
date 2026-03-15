import React from 'react';
import { Film, Heart, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MovieItem } from '../types';

interface MovieCardProps {
  item: MovieItem;
  isFavorite: boolean;
  onToggleFavorite: (title: string) => void;
  onClick: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, isFavorite, onToggleFavorite, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
          <div className="flex items-center gap-2 mb-3">
             <div className="px-2 py-1 rounded-md bg-primary text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-primary/40">
              HD Premium
            </div>
          </div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="space-y-3"
          >
            <h3 className="text-white font-extrabold text-lg leading-tight line-clamp-2 drop-shadow-md">
              {item.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                <Film size={12} className="text-primary" />
                {item.genre}
              </span>
              <div className="flex items-center gap-1 text-primary">
                <Star size={12} fill="currentColor" />
                <span className="text-[10px] font-black italic">8.5</span>
              </div>
            </div>
            
          </motion.div>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.title); }}
            className={`w-10 h-10 backdrop-blur-md rounded-xl flex items-center justify-center border transition-all duration-300 ${
              isFavorite 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" 
                : "bg-black/20 text-white border-white/20 hover:bg-white hover:text-black hover:border-white"
            }`}
          >
            <Heart 
              size={18} 
              fill={isFavorite ? "currentColor" : "none"} 
              strokeWidth={isFavorite ? 0 : 2}
            />
          </button>
        </div>

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-100 group-hover:opacity-0 transition-opacity">
           <div className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
            2026
          </div>
        </div>
      </div>

      <div className="p-4 bg-background">
        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
             <Clock size={10} />
             128 min
          </span>
          <span className="text-primary">{item.genre}</span>
        </div>
      </div>
    </motion.div>
  );
};
