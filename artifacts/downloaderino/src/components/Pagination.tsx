import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  current: number;
  total: number;
  onChange: (p: number) => void;
}

const Pagination: React.FC<Props> = ({ current, total, onChange }) => {
  if (total <= 1) return null;

  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  let pages: (number | '…')[];
  if (total <= 7) {
    pages = range(1, total);
  } else if (current <= 4) {
    pages = [...range(1, 5), '…', total];
  } else if (current >= total - 3) {
    pages = [1, '…', ...range(total - 4, total)];
  } else {
    pages = [1, '…', ...range(current - 1, current + 1), '…', total];
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-16 flex-wrap">
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 flex items-center justify-center rounded-xl border border-border-subtle hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all hover:bg-surface shadow-sm"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </motion.button>

      <div className="flex items-center gap-2 bg-surface p-1 rounded-2xl border border-border-subtle shadow-inner">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-3 text-gray-400 font-bold">…</span>
          ) : (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all font-bold text-sm ${
                current === p 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                  : 'text-gray-500 hover:bg-background hover:text-primary'
              }`}
              onClick={() => onChange(p as number)}
            >
              {p}
            </motion.button>
          )
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 flex items-center justify-center rounded-xl border border-border-subtle hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all hover:bg-surface shadow-sm"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </motion.button>
    </div>
  );
};

export default Pagination;
