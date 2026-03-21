import React from 'react';
import { ArrowLeft, Download, ExternalLink, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AltSourceDetail } from '../types';

interface Props {
  detail: AltSourceDetail;
  loading: boolean;
  onBack: () => void;
}

export const AltSourceDetailView: React.FC<Props> = ({ detail, loading, onBack }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="space-y-8 pb-20"
  >
    <motion.button
      whileHover={{ x: -5 }}
      onClick={onBack}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border-subtle text-sm font-bold text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
    >
      <ArrowLeft size={16} /> Back to catalogue
    </motion.button>

    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
      {/* Poster */}
      <div className="space-y-4">
        <div className="relative rounded-[24px] overflow-hidden shadow-2xl border border-border-subtle aspect-[2/3] max-w-[260px] mx-auto lg:max-w-none bg-orange-500/5 flex items-center justify-center">
          {detail.cover
            ? <img src={detail.cover} alt={detail.title} className="w-full h-full object-cover" />
            : <Film size={64} className="text-orange-500/30" />}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
              AltSource
            </span>
          </div>
        </div>
        <a
          href={detail.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-11 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl transition-all text-sm"
        >
          <ExternalLink size={15} /> View Source Page
        </a>
      </div>

      {/* Info + Downloads */}
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-[0.2em] text-[10px]">
            <Film size={14} /> AltSource
          </div>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">{detail.title}</h2>
          {detail.description && (
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base font-medium max-w-3xl">
              {detail.description}
            </p>
          )}
        </div>

        {/* Download Center */}
        <div className="bg-surface border border-border-subtle rounded-[24px] p-6 md:p-8 shadow-2xl space-y-6">
          <div className="border-b border-border-subtle pb-5 space-y-1">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Download size={22} className="text-orange-500" /> Download Links
            </h3>
            <p className="text-xs font-medium text-gray-400">
              Direct third-party links — click to download via your browser.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 py-6 text-gray-400 text-sm font-medium">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                Loading download links…
              </motion.div>
            ) : detail.downloads.length === 0 ? (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-gray-400 font-medium py-4">
                No direct download links found. Visit the source page directly.
              </motion.p>
            ) : (
              <motion.div key="links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3">
                {detail.downloads.map((dl, idx) => (
                  <motion.a
                    key={idx}
                    href={dl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 px-4 py-3 bg-background border border-border-subtle rounded-2xl hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                      <Download size={16} />
                    </div>
                    <span className="flex-grow font-bold text-sm group-hover:text-orange-500 transition-colors">
                      {dl.label}
                    </span>
                    <ExternalLink size={13} className="text-gray-400 shrink-0" />
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </motion.div>
);
