'use client';

import React, { useState, useEffect } from 'react';
import { SidebarDock } from './SidebarDock';
import { MobileBottomNav } from './MobileBottomNav';
import { TopNavigation } from './TopNavigation';
import { SearchModal } from './SearchModal';
import { PreferencesModal } from './PreferencesModal';
import { BackgroundMesh } from './BackgroundMesh';
import { motion } from 'framer-motion';

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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start py-2 sm:py-5 px-2 sm:px-5 lg:pl-24 lg:pr-8 pb-28 sm:pb-32 lg:pb-8 text-slate-900">
      {/* Pearlescent Ambient Background Mesh */}
      <BackgroundMesh />

      {/* Floating Vertical Sidebar Dock (Desktop) */}
      <SidebarDock onOpenSearch={() => setSearchOpen(true)} />

      {/* Mobile Floating Bottom Dock */}
      <MobileBottomNav onOpenSearch={() => setSearchOpen(true)} />

      {/* Main Centered Full-Screen Pure Crystalline Liquid Glass Dashboard Container */}
      <div className="w-full max-w-[1550px] my-auto mt-0.5 sm:mt-1 mb-6 rounded-2xl sm:rounded-[36px] md:rounded-[42px] liquid-glass-panel shadow-2xl p-3 sm:p-6 lg:p-8 relative z-20 flex flex-col gap-5 sm:gap-6 overflow-hidden">
        {/* Top Floating Navigation */}
        <TopNavigation
          onOpenSearch={() => setSearchOpen(true)}
          onOpenPreferences={() => setPreferencesOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="w-full min-h-[520px]">{children}</main>
      </div>

      {/* Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <PreferencesModal isOpen={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
    </div>
  );
};
