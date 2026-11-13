'use client';

import React, { useState, useEffect } from 'react';
import { SidebarDock } from './SidebarDock';
import { MobileBottomNav } from './MobileBottomNav';
import { TopNavigation } from './TopNavigation';
import { SearchModal } from './SearchModal';
import { PreferencesModal } from './PreferencesModal';
import { BackgroundMesh } from './BackgroundMesh';

interface GlassContainerProps {
  children: React.ReactNode;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ children }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start py-2 sm:py-6 px-2 sm:px-6 lg:pl-24 lg:pr-8 pb-28 sm:pb-32 lg:pb-8 text-[#231215]">
      {/* Sunlit Architectural Ambient Lighting */}
      <BackgroundMesh />

      {/* Vertical Handcrafted Sidebar Dock (Desktop) */}
      <SidebarDock onOpenSearch={() => setSearchOpen(true)} />

      {/* Floating Bottom Navigation (Mobile) */}
      <MobileBottomNav onOpenSearch={() => setSearchOpen(true)} />

      {/* Main Bespoke Editorial Film Salon Container */}
      <div className="w-full max-w-[1550px] my-auto mt-0.5 sm:mt-1 mb-6 rounded-2xl sm:rounded-[36px] md:rounded-[42px] bg-[#FAF7F2]/90 backdrop-blur-2xl border border-[#E7DFD4] shadow-[0_24px_70px_-15px_rgba(45,18,22,0.07)] p-3 sm:p-7 lg:p-9 relative z-20 flex flex-col gap-6 sm:gap-7 overflow-hidden">
        {/* Top Editorial Navigation */}
        <TopNavigation
          onOpenSearch={() => setSearchOpen(true)}
          onOpenPreferences={() => setPreferencesOpen(true)}
        />

        {/* Dynamic Curated Page Content */}
        <main className="w-full min-h-[520px]">{children}</main>
      </div>

      {/* Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <PreferencesModal isOpen={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
    </div>
  );
};
