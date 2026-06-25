import React from 'react';
import { AlertCircle, Home, MoveLeft, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotFoundProps {
  onBack: () => void;
}

const WA_NUMBER = '2349016471351';

export const NotFound: React.FC<NotFoundProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative"
    >
      <div className="absolute inset-0 -z-10 flex items-center justify-center blur-[150px] opacity-20">
        <div className="w-96 h-96 bg-primary rounded-full" />
      </div>

      <div className="relative mb-12">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-[180px] md:text-[240px] font-black text-primary/10 select-none leading-none"
        >
          404
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <AlertCircle size={80} className="text-primary drop-shadow-[0_0_15px_var(--color-primary-glow)]" />
          </motion.div>
        </div>
      </div>
      
      <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Oops! Lost in Space?</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-10 text-lg leading-relaxed font-medium">
        The movie you're looking for might have been archived or moved to a different universe.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="btn btn-primary px-10 py-4 text-base rounded-2xl group"
        >
          <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
          Back to Dashboard
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className="btn btn-outline px-10 py-4 text-base rounded-2xl group"
        >
          <MoveLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Go Back
        </motion.button>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Bug report — Downloaderino 404: ')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline px-10 py-4 text-base rounded-2xl group border-green-500/40 text-green-500 hover:bg-green-500/10"
        >
          <MessageCircle size={20} />
          Report Bug
        </motion.a>
      </div>
    </motion.div>
  );
};
