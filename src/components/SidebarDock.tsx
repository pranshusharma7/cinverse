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
    { label: 'Archive', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Feature Films', href: '/movies', icon: Film },
    { label: 'Series', href: '/tv', icon: Tv },
    { label: 'Anime Vault', href: '/anime', icon: Sparkles },
    { label: 'Watchlist', href: '/playlist', icon: BookmarkCheck },
    { label: 'Screening Salon', href: '/player', icon: PlaySquare },
  ];

  return (
    <aside className="hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center select-none">
      <div className="px-2.5 py-4 rounded-full flex flex-col items-center gap-3.5 shadow-[0_12px_30px_-5px_rgba(45,18,22,0.08)] border border-[#E5DDD2] bg-[#FFFDFB]/95 backdrop-blur-xl">
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
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
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
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveDockIndicator"
                    className="absolute inset-0 rounded-full bg-[#F4ECE1] border border-[#E4DBD0] shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  />
                )}

                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive
                      ? 'text-[#7A242B] font-bold'
                      : 'text-[#6B5357] group-hover:text-[#231215]'
                  }`}
                />

                {/* Handcrafted Tooltip */}
                <div className="pointer-events-none absolute left-full ml-4 px-3 py-1.5 rounded-xl bg-[#FFFDFB] text-[#231215] text-xs font-semibold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl border border-[#E5DDD2] translate-x-1 group-hover:translate-x-0 backdrop-blur-xl z-50">
                  <span className="font-serif">{item.label}</span>
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#FFFDFB]" />
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* Divider */}
        <div className="w-5 h-px bg-[#E5DDD2] my-0.5" />

        {/* Quick Search Action */}
        <motion.div
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="relative group"
        >
          <button
            onClick={() => {
              playGlassClick();
              onOpenSearch?.();
            }}
            onMouseEnter={playGlassHover}
            className="p-2.5 rounded-full flex items-center justify-center transition-colors text-[#6B5357] hover:text-[#7A242B]"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
            <div className="pointer-events-none absolute left-full ml-4 px-3 py-1.5 rounded-xl bg-[#FFFDFB] text-[#231215] text-xs font-semibold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl border border-[#E5DDD2] translate-x-1 group-hover:translate-x-0 backdrop-blur-xl z-50">
              <span className="font-serif">Search Archive (⌘K)</span>
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#FFFDFB]" />
            </div>
          </button>
        </motion.div>
      </div>
    </aside>
  );
};
