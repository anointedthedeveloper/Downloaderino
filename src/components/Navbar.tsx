import React, { useState, useEffect } from 'react';
import { Sun, Moon, Heart, Menu, X, Github, Download, Search, Tv, Film, Tv2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
  favCount: number;
  onLogoClick: () => void;
  onSearchFocus: () => void;
  onRequest?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, onToggleDark, favCount, onLogoClick, onSearchFocus, onRequest }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    onLogoClick();
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };

  const navLinks = [
    { label: 'Home', icon: <Download size={14} />, action: () => { setIsMenuOpen(false); onLogoClick(); } },
    { label: 'Movies', icon: <Film size={14} />, action: () => scrollTo('section-movies') },
    { label: 'Series', icon: <Tv2 size={14} />, action: () => scrollTo('section-series') },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'nav-blur py-2.5' : 'bg-transparent py-4'}`}>
      <div className="container-custom flex items-center justify-between gap-4">

        {/* Logo */}
        <button onClick={onLogoClick} className="flex items-center gap-2.5 group shrink-0 active:scale-95 transition-transform">
          <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(34,197,94,0.3)] group-hover:rotate-6 transition-transform duration-300">
            <Download size={18} strokeWidth={3} />
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="font-black tracking-tighter text-lg group-hover:text-primary transition-colors">DOWNLOADERINO</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Premium Content</span>
          </div>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0.5 bg-surface/60 border border-border-subtle rounded-xl p-1">
          {navLinks.map(link => (
            <button key={link.label} onClick={link.action}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-background hover:text-primary hover:shadow-sm transition-all">
              {link.icon} {link.label}
            </button>
          ))}
          <a href="https://streamarino.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-purple-400 hover:bg-background hover:shadow-sm transition-all">
            <Tv size={14} /> Stream
          </a>
          {onRequest && (
            <button onClick={onRequest}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 transition-all">
              <Send size={14} /> Request
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={onSearchFocus} className="p-2 rounded-lg hover:bg-surface text-gray-500 hover:text-primary transition-colors" aria-label="Search">
            <Search size={18} />
          </button>

          <a href="https://github.com/anointedthedeveloper/Downloaderino" target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex p-2 rounded-lg hover:bg-surface text-gray-500 hover:text-foreground transition-colors">
            <Github size={18} />
          </a>

          <AnimatePresence>
            {favCount > 0 && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                <Heart size={11} fill="currentColor" /> {favCount}
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={onToggleDark} className="p-2 rounded-lg hover:bg-surface transition-colors" aria-label="Toggle theme">
            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-500" />}
          </button>

          <button className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors" onClick={() => setIsMenuOpen(o => !o)}>
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-border-subtle bg-background/98 backdrop-blur-md"
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <button key={link.label} onClick={link.action}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base text-gray-600 dark:text-gray-300 hover:bg-surface hover:text-primary transition-all text-left">
                  <span className="text-primary">{link.icon}</span> {link.label}
                </button>
              ))}
              <a href="https://streamarino.vercel.app/" target="_blank" rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base text-purple-400 hover:bg-purple-500/10 transition-all">
                <Tv size={16} /> Stream on Streamarino
              </a>
              {onRequest && (
                <button onClick={() => { onRequest(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base text-primary hover:bg-primary/10 transition-all">
                  <Send size={16} /> Request a Title
                </button>
              )}
              <div className="mt-2 pt-3 border-t border-border-subtle flex items-center justify-between px-4">
                <span className="text-sm text-gray-500">Theme</span>
                <button onClick={() => { onToggleDark(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border-subtle text-sm font-semibold">
                  {isDark ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} />}
                  {isDark ? 'Light' : 'Dark'} Mode
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
