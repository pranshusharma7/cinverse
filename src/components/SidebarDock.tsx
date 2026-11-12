'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, BookmarkCheck, Compass, Search, PlaySquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { playGlassClick, playGlassHover } from '@/lib/sound';

interface SidebarDockProps {
  onOpenSearch?: () => void;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Movies', href: '/movies', icon: Film },
    { label: 'TV Shows', href: '/tv', icon: Tv },
    { label: 'Anime', href: '/anime', icon: Sparkles },
    { label: 'Watchlist', href: '/playlist', icon: BookmarkCheck },
    { label: 'Cinema Player', href: '/player', icon: PlaySquare },
  ];

  return (
    <aside className="hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center select-none">
      <div className="liquid-glass-panel px-2.5 py-4 rounded-full flex flex-col items-center gap-3.5 shadow-xl border border-white/90 bg-white/85 backdrop-blur-2xl">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href) ||
                (item.href === '/explore' && pathname.startsWith('/genres'));
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="relative group"
            >
              <Link
                href={item.href}
                onClick={playGlassClick}
                onMouseEnter={playGlassHover}
                className="relative p-2.5 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label={item.label}
              >
                {/* Glowing active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveDockIndicatorLight"
                    className="absolute inset-0 rounded-full bg-indigo-50 border border-indigo-200/80 shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  />
                )}

                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive
                      ? 'text-indigo-600 drop-shadow-xs font-bold'
                      : 'text-slate-600 group-hover:text-slate-950'
                  }`}
                />

                {/* visionOS Liquid Glass Tooltip */}
                <div className="pointer-events-none absolute left-full ml-4 px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-bold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl border border-white translate-x-1 group-hover:translate-x-0 backdrop-blur-2xl z-50">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-white/95" />
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* Specular glass divider */}
        <div className="w-5 h-px bg-slate-200 my-0.5" />

        {/* Quick Search Action Icon */}
        <motion.div
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="relative group"
        >
          <button
            onClick={() => {
              playGlassClick();
              onOpenSearch?.();
            }}
            onMouseEnter={playGlassHover}
            className="p-2.5 rounded-full flex items-center justify-center transition-all duration-300 text-slate-600 hover:text-slate-950 hover:bg-white/60"
            aria-label="Search (⌘K)"
          >
            <Search className="w-5 h-5" />
            <div className="pointer-events-none absolute left-full ml-4 px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-bold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl border border-white translate-x-1 group-hover:translate-x-0 backdrop-blur-2xl z-50 flex items-center gap-1.5">
              <span>Quick Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono border border-slate-200 text-slate-700">
                ⌘K
              </kbd>
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-white/95" />
            </div>
          </button>
        </motion.div>
      </div>
    </aside>
  );
};
