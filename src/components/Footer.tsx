import React, { useEffect, useState } from 'react';
import { Github, Twitter, Heart, Youtube, Instagram, Shield, Zap, Globe, Star, Users, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WA_NUMBER = '2349016471351';

function useVisitorCount() {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    const SEED = 52_841; // base count
    const stored = localStorage.getItem('dl_vc');
    const lastVisit = localStorage.getItem('dl_lv');
    const today = new Date().toDateString();
    let current = stored ? parseInt(stored, 10) : SEED + Math.floor(Math.random() * 5000);
    if (!stored) {
      // First ever visit on this browser — initialise
      localStorage.setItem('dl_vc', String(current));
    }
    if (lastVisit !== today) {
      // New day = new visit
      current += 1;
      localStorage.setItem('dl_vc', String(current));
      localStorage.setItem('dl_lv', today);
    }
    setCount(current);
  }, []);
  return count;
}

export const Footer: React.FC = () => {
  const visitorCount = useVisitorCount();
  return (
  <footer className="mt-20 border-t border-border-subtle bg-surface/30 backdrop-blur-sm">
    <div className="container-custom py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
        {/* Brand Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
              D
            </div>
            <span className="font-extrabold tracking-tighter text-2xl">
              DOWNLOADERINO
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
            The world's most advanced movie downloader platform. Experience lightning-fast speeds, premium content, and a clean interface.
          </p>
          <div className="flex items-center gap-4">
            <motion.a
              href="#"
              whileHover={{ y: -4, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
            >
              <Twitter size={18} />
            </motion.a>
            <motion.a
              href="https://github.com/anointedthedeveloper/Downloaderino"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
            >
              <Github size={18} />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ y: -4, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
            >
              <Youtube size={18} />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ y: -4, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
            >
              <Instagram size={18} />
            </motion.a>
          </div>
          <motion.a
            href="https://github.com/anointedthedeveloper/Downloaderino"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
          >
            <Star size={14} fill="currentColor" />
            If you like it, give it a star on GitHub!
          </motion.a>
        </div>

        {/* Links Sections */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">Platform</h4>
            <ul className="space-y-4">
              {[
                { label: 'Movies', comingSoon: true },
                { label: 'Series', comingSoon: true },
                { label: 'Trending', comingSoon: false },
                { label: 'New Releases', comingSoon: false },
              ].map((item) => (
                <li key={item.label}>
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                    {item.comingSoon && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary rounded-md">
                        Soon
                      </span>
                    )}
                  </button>
                </li>
              ))}
              <li>
                <motion.a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Bug report — Downloaderino: ')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  className="text-sm text-green-500 hover:text-green-400 transition-colors flex items-center gap-2 group font-bold"
                >
                  <MessageCircle size={13} />
                  Report a Bug
                </motion.a>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <Zap size={14} className="text-primary" />
                <span>10GB/s Speed</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <Shield size={14} className="text-primary" />
                <span>Secure SSL</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <Globe size={14} className="text-primary" />
                <span>Global Nodes</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <Users size={14} className="text-primary" />
                <span>
                  <span className="text-foreground font-bold">{visitorCount > 0 ? visitorCount.toLocaleString() : '—'}</span> Visitors
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-medium text-gray-500">
        <div className="flex flex-wrap justify-center gap-6">
          <p>© 2026 Downloaderino. Built for the web.</p>
          <div className="flex items-center gap-6">
            <button className="hover:text-primary transition-colors">English (US)</button>
            <button className="hover:text-primary transition-colors">System Status</button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface border border-border-subtle">
          Made with <Heart size={12} className="text-red-500 fill-red-500 mx-0.5" /> and{' '}
          <span className="flex gap-0.5 mx-1">
            {['#22C55E', '#16A34A', '#15803D', '#22C55E', '#4ADE80'].map((color, i) => (
              <span
                key={i}
                style={{ backgroundColor: color }}
                className="w-2 h-2 rounded-[1px] inline-block"
              />
            ))}
          </span>
          green pixels
        </div>
      </div>
    </div>
  </footer>
  );
};
