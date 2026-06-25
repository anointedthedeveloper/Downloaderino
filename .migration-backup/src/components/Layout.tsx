import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleDark: () => void;
  favCount: number;
  onLogoClick: () => void;
  onSearchFocus: () => void;
  onRequest?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children, isDark, onToggleDark, favCount, onLogoClick, onSearchFocus, onRequest,
}) => {
  const scrollTo = (id: string) => {
    onLogoClick();
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none -z-10">
        <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-primary/4 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] bg-primary/4 blur-[120px] rounded-full" />
      </div>

      <Navbar isDark={isDark} onToggleDark={onToggleDark} favCount={favCount} onLogoClick={onLogoClick} onSearchFocus={onSearchFocus} onRequest={onRequest} />

      <main className="flex-grow relative z-10">
        {children}
      </main>

      <Footer onRequest={onRequest} onScrollTo={scrollTo} />
    </div>
  );
};
