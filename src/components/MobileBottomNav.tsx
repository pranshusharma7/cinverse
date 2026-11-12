'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Film, Tv, Sparkles, BookmarkCheck, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { playGlassClick, playGlassHover } from '@/lib/sound';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Movies', href: '/movies', icon: Film },
    { label: 'TV', href: '/tv', icon: Tv },
    { label: 'Anime', href: '/anime', icon: Sparkles },
    { label: 'Watchlist', href: '/playlist', icon: BookmarkCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-md select-none">
      <div className="liquid-glass-panel px-2 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center justify-around border border-white shadow-2xl backdrop-blur-3xl bg-white/95">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href) ||
                (item.href === '/explore' && pathname.startsWith('/genres'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={playGlassClick}
              onMouseEnter={playGlassHover}
              className={`relative flex flex-col items-center gap-0.5 p-1 sm:p-1.5 rounded-full transition-all ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveDockIndicatorLight"
                  className="absolute inset-0 bg-white rounded-full border border-white shadow-xs"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="text-[9px] font-bold tracking-tight relative z-10">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => {
            playGlassClick();
            onOpenSearch();
          }}
          onMouseEnter={playGlassHover}
          className="flex flex-col items-center gap-0.5 p-1 sm:p-1.5 rounded-full text-slate-600 hover:text-slate-950 transition"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="text-[9px] font-bold tracking-tight">Search</span>
        </button>
      </div>
    </nav>
  );
};
