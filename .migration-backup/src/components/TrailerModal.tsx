import React from 'react';
import { X, Youtube, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrailerModalProps {
  url: string;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ url, onClose }) => {
  // Extract YouTube video ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0` : url;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-2xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.15)] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <Youtube size={24} fill="currentColor" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Now Playing</p>
                <p className="text-white font-bold text-sm">Official Movie Trailer</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl transition-all border border-white/20 group"
          >
            <X size={24} className="text-white group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        
        <div className="w-full h-full relative group">
          {videoId ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : url ? (
            <video
              src={url}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-white">
               <AlertCircle size={64} className="text-primary" />
               <p className="text-xl font-bold">Trailer currently unavailable</p>
            </div>
          )}
          
          {/* Subtle Glow */}
          <div className="absolute -bottom-1 left-0 w-full h-1 bg-primary blur-md opacity-50" />
        </div>
      </motion.div>
    </motion.div>
  );
};
