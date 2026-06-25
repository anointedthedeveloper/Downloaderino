import React, { useState } from 'react';
import { ArrowLeft, Send, Film, Tv2, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WA_NUMBER = '2349016471351';

interface Props { onBack: () => void; }

type ContentType = 'movie' | 'series' | 'anime';

const TYPES: { value: ContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'movie', label: 'Movie', icon: <Film size={16} /> },
  { value: 'series', label: 'Series', icon: <Tv2 size={16} /> },
  { value: 'anime', label: 'Anime', icon: <Sparkles size={16} /> },
];

export const RequestPage: React.FC<Props> = ({ onBack }) => {
  const [type, setType] = useState<ContentType>('movie');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const msg = `🎬 *Downloaderino Request*\n\nType: ${type.toUpperCase()}\nTitle: ${title}${year ? `\nYear: ${year}` : ''}${notes ? `\nNotes: ${notes}` : ''}`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    setTimeout(() => {
      window.open(url, '_blank');
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="max-w-xl mx-auto space-y-8 py-8">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary text-[11px] font-black uppercase tracking-widest">
          <Send size={12} /> Request
        </div>
        <h1 className="text-3xl font-black tracking-tight">Request a Title</h1>
        <p className="text-sm text-gray-400">Can't find what you're looking for? Send us a request and we'll add it.</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-black">Request Sent!</h2>
            <p className="text-sm text-gray-400 max-w-xs">Your WhatsApp should have opened. We'll try to add it as soon as possible.</p>
            <button onClick={() => { setSubmitted(false); setTitle(''); setYear(''); setNotes(''); }}
              className="mt-2 px-5 py-2 rounded-xl bg-surface border border-border-subtle text-sm font-bold hover:border-primary hover:text-primary transition-all">
              Request another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Content Type</label>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => setType(t.value)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${type === t.value ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border-subtle text-gray-500 hover:border-primary/40 hover:text-foreground'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Title <span className="text-red-400">*</span></label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)} required
                placeholder={`e.g. ${type === 'movie' ? 'Inception' : type === 'series' ? 'Breaking Bad' : 'Attack on Titan'}`}
                className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Year <span className="text-gray-500 font-normal normal-case">(optional)</span></label>
              <input
                type="text" value={year} onChange={e => setYear(e.target.value)}
                placeholder="e.g. 2024" maxLength={4}
                className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Notes <span className="text-gray-500 font-normal normal-case">(optional)</span></label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Season number, quality preference, etc."
                className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            <button type="submit" disabled={!title.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-black text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {loading ? 'Opening WhatsApp…' : 'Send Request via WhatsApp'}
            </button>

            <p className="text-center text-xs text-gray-400">
              This opens WhatsApp with your request pre-filled. We'll review and add it to the catalogue.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
