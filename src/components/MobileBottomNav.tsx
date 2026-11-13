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
    { label: 'Archive', href: '/', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Films', href: '/movies', icon: Film },
    { label: 'Series', href: '/tv', icon: Tv },
    { label: 'Anime', href: '/anime', icon: Sparkles },
    { label: 'Watchlist', href: '/playlist', icon: BookmarkCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-md select-none">
      <div className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center justify-around border border-[#E5DDD2] shadow-2xl backdrop-blur-3xl bg-[#FFFDFB]/95">
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
                isActive ? 'text-[#7A242B] font-bold' : 'text-[#695155] hover:text-[#231215]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveDockIndicator"
                  className="absolute inset-0 bg-[#F4ECE1] rounded-full border border-[#E5DDD2] shadow-xs"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="text-[9px] font-medium tracking-tight relative z-10">
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
          className="flex flex-col items-center gap-0.5 p-1 sm:p-1.5 rounded-full text-[#695155] hover:text-[#231215] transition"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="text-[9px] font-medium tracking-tight">Search</span>
        </button>
      </div>
    </nav>
  );
};
