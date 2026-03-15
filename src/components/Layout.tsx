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
  onAdminClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, isDark, onToggleDark, favCount, onLogoClick, onSearchFocus, onAdminClick,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
        {isDark && (
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/2 blur-[100px] rounded-full"></div>
        )}
      </div>

      <Navbar 
        isDark={isDark} 
        onToggleDark={onToggleDark} 
        favCount={favCount} 
        onLogoClick={onLogoClick}
        onSearchFocus={onSearchFocus}
        onAdminClick={onAdminClick}
      />
      
      <main className="flex-grow relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
};
