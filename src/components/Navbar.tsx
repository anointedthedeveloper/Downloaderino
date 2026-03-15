import React, { useState, useEffect } from 'react';
import { Sun, Moon, Heart, Menu, X, Github, Download, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
  favCount: number;
  onLogoClick: () => void;
  onSearchFocus: () => void;
}

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, onToggleDark, favCount, onLogoClick, onSearchFocus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', onClick: onLogoClick, comingSoon: false },
    { name: 'Movies', onClick: () => {}, comingSoon: true },
    { name: 'Series', onClick: () => {}, comingSoon: true },
  ];

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "nav-blur py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={onLogoClick} 
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-[0_0_20px_var(--color-primary-glow)] group-hover:rotate-6 transition-transform duration-300">
              <Download size={22} strokeWidth={3} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-black dark:bg-white rounded-full border-2 border-background" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-extrabold tracking-tighter text-xl group-hover:text-primary transition-colors">
              DOWNLOADERINO
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Premium Content</span>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.onClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface hover:text-primary transition-all"
            >
              {link.name}
              {link.comingSoon && (
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary rounded-md">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSearchFocus}
            className="p-2 rounded-lg hover:bg-surface text-gray-500 hover:text-primary transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </motion.button>
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <a 
              href="https://github.com/anointedthedeveloper/Downloaderino"
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-surface text-gray-500 hover:text-foreground transition-colors"
            >
              <Github size={20} />
            </a>
          </div>

          <div className="h-6 w-px bg-border-subtle mx-2 hidden sm:block" />

          {favCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-bold"
            >
              <Heart size={12} fill="currentColor" />
              {favCount}
            </motion.div>
          )}

          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg hover:bg-surface text-foreground transition-all duration-300"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border-subtle shadow-xl"
          >
            <div className="container-custom py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button 
                  key={link.name}
                  onClick={() => { link.onClick(); setIsMenuOpen(false); }} 
                  className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-lg hover:bg-surface hover:text-primary transition-all"
                >
                  <span className="flex items-center gap-2">
                    {link.name}
                    {link.comingSoon && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary rounded-md">
                        Soon
                      </span>
                    )}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100" />
                </button>
              ))}
              <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between px-4">
                <span className="text-sm font-medium text-gray-500">Theme</span>
                <button
                  onClick={onToggleDark}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface font-semibold text-sm"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
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
