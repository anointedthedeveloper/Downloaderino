import React from 'react';
import { Github, Heart, Shield, Zap, Globe, Star, Users, MessageCircle, Tv, Film, Tv2, Send, Download } from 'lucide-react';

interface FooterProps { onRequest?: () => void; onScrollTo?: (id: string) => void; }

export const Footer: React.FC<FooterProps> = ({ onRequest, onScrollTo }) => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border-subtle">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Download size={18} strokeWidth={3} />
              </div>
              <span className="font-black tracking-tighter text-lg">DOWNLOADERINO</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Fast, free movie & series downloads. No sign-up, no ads, just content.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://github.com/anointedthedeveloper/Downloaderino" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all">
                <Github size={16} />
              </a>
              <a href="https://streamarino.vercel.app/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-purple-400 hover:border-purple-400/30 transition-all">
                <Tv size={16} />
              </a>
            </div>
            <a href="https://github.com/anointedthedeveloper/Downloaderino" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
              <Star size={12} fill="currentColor" /> Star on GitHub
            </a>
          </div>

          {/* Browse */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Browse</h4>
            <ul className="space-y-3">
              {[
                { label: 'Movies', icon: <Film size={13} />, action: () => onScrollTo?.('section-movies') },
                { label: 'Series', icon: <Tv2 size={13} />, action: () => onScrollTo?.('section-series') },
                { label: 'Stream on Streamarino', icon: <Tv size={13} />, href: 'https://streamarino.vercel.app/', purple: true },
              ].map(item => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-2 text-sm transition-colors ${item.purple ? 'text-purple-400 hover:text-purple-300 font-semibold' : 'text-gray-500 hover:text-primary'}`}>
                      {item.icon} {item.label}
                    </a>
                  ) : (
                    <button onClick={item.action}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                      {item.icon} {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Support</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={onRequest}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-semibold transition-colors">
                  <Send size={13} /> Request a Title
                </button>
              </li>
              <li>
                <a href={`https://wa.me/2349016471351?text=${encodeURIComponent('Bug report — Downloaderino: ')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                  <MessageCircle size={13} /> Report a Bug
                </a>
              </li>
              <li>
                <a href="https://github.com/anointedthedeveloper/Downloaderino" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                  <Github size={13} /> GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Platform</h4>
            <div className="space-y-3">
              {[
                { icon: <Zap size={13} />, label: '10GB/s Speed' },
                { icon: <Shield size={13} />, label: 'Secure SSL' },
                { icon: <Globe size={13} />, label: 'Global CDN' },
                { icon: <Users size={13} />, label: '40K+ Visitors' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <span className="text-primary">{s.icon}</span> {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {year} Downloaderino. Built for the web.</p>
          <div className="flex items-center gap-1.5">
            Made with <Heart size={11} className="text-red-500 fill-red-500 mx-0.5" /> and green pixels
          </div>
        </div>
      </div>
    </footer>
  );
};
