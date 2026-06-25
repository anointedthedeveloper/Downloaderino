import React from 'react';
import { motion } from 'framer-motion';

export const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-16 h-16">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-full h-full border-4 border-primary/10 border-t-primary rounded-full"
        />
        <motion.div 
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 m-auto w-6 h-6 bg-primary rounded-full blur-sm"
        />
      </div>
      <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Loading content...</p>
    </div>
  );
};
