'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Tv,
  Film,
  Play,
  Check,
  User,
  Sliders,
  BookmarkCheck,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playGlassClick, playGlassHover } from '@/lib/sound';
import { getPlaylist } from '@/lib/storage';

interface TopNavigationProps {
  onOpenSearch: () => void;
  onOpenPreferences: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  onOpenSearch,
  onOpenPreferences,
}) => {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [playlistCount, setPlaylistCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setPlaylistCount(getPlaylist().length);
    };

    updateCount();
    window.addEventListener('playlist_changed', updateCount);
    return () => window.removeEventListener('playlist_changed', updateCount);
  }, []);

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/explore' },
    { label: 'Movies', href: '/movies' },
    { label: 'TV Shows', href: '/tv' },
    { label: 'Anime', href: '/anime' },
    { label: 'Watchlist', href: '/playlist' },
    { label: 'Cinema Player', href: '/player' },
  ];

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 px-1 relative z-30 flex-wrap select-none">
      {/* ========================================================
          LEFT: BRAND EMBLEM & COMMAND PALETTE SEARCH
      ======================================================== */}
      <div className="flex items-center gap-3">
        {/* CINEMAVERSE Brand Emblem */}
        <Link
          href="/"
          onClick={playGlassClick}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-2.5 group mr-2 select-none"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 p-[1.5px] shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-[14px] flex items-center justify-center bg-white/95 backdrop-blur-md">
              <span className="font-black text-xs tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">
                CM
              </span>
            </div>
          </div>
          <span className="font-black text-sm sm:text-base tracking-display uppercase text-slate-900">
            CINEMA<span className="text-indigo-600">VERSE</span>
          </span>
        </Link>

        {/* Expandable Glass Command-Palette Search Capsule */}
        <div
          onClick={() => {
            playGlassClick();
            onOpenSearch();
          }}
          onMouseEnter={playGlassHover}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenSearch();
            }
          }}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/90 bg-white/85 hover:bg-white text-slate-700 hover:text-slate-950 transition-all duration-300 cursor-pointer shadow-sm backdrop-blur-xl"
        >
          <Search className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold tracking-wide hidden md:inline text-slate-700">
            Search titles, anime, IMDb...
          </span>
          <span className="text-xs font-semibold tracking-wide md:hidden text-slate-700">Search</span>
          <div className="hidden sm:flex items-center gap-1 pl-1">
            <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-600">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* ========================================================
          CENTER: SLIDING ACTIVE SEGMENTED PILL NAVIGATION
      ======================================================== */}
      <nav className="hidden xl:flex items-center gap-1 p-1.5 rounded-full liquid-glass-panel border border-white/90 shadow-md">
        {links.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href) ||
                (link.href === '/explore' && pathname.startsWith('/genres'));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={playGlassClick}
              onMouseEnter={playGlassHover}
              className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavSegmentLight"
                  className="absolute inset-0 rounded-full bg-white border border-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ========================================================
          RIGHT: NOTIFICATIONS & PROFILE PILL (NO DARK TOGGLE!)
      ======================================================== */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell with Unread Pulse */}
        <div className="relative">
          <button
            onClick={() => {
              playGlassClick();
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            className="p-2 sm:p-2.5 rounded-full liquid-glass-pill text-slate-700 hover:text-slate-950 relative transition hover:scale-105 border border-white shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white" />
            )}
          </button>

          {/* Quick Notification Popover */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 p-4 rounded-3xl liquid-glass-panel z-50 text-xs shadow-2xl border border-white bg-white/95 backdrop-blur-3xl text-slate-900"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 font-bold">
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cinema Releases &amp; Updates</span>
                  </div>
                  <button
                    onClick={() => setHasUnread(false)}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold"
                  >
                    Mark read
                  </button>
                </div>
                <div className="py-2.5 space-y-3">
                  <div className="flex items-start gap-2.5 group/item cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <div>
                      <p className="font-bold text-slate-900">Universal Cinema Player Ready</p>
                      <p className="text-[11px] text-slate-600">
                        Paste any YouTube link to auto-play or drop local video files.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 group/item cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <div>
                      <p className="font-bold text-slate-900">Multi-Server Streaming Active</p>
                      <p className="text-[11px] text-slate-600">
                        Nxsha Space, VidSrc &amp; AutoEmbed backup servers enabled.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 group/item cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                    <div>
                      <p className="font-bold text-slate-900">Anime Catalog Online</p>
                      <p className="text-[11px] text-slate-600">
                        Explore Demon Slayer, Jujutsu Kaisen, and top AniList releases.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Pill with Interactive Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              playGlassClick();
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            onMouseEnter={playGlassHover}
            className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full liquid-glass-pill transition text-left group hover:scale-102 border border-white shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 via-rose-500 to-sky-400 p-[1.5px] overflow-hidden shadow-xs shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                alt="Cinema VIP"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[11px] font-bold text-slate-900">
                Cinema VIP
              </span>
              <span className="text-[9px] text-indigo-600 font-semibold tracking-wide">
                Daylight Pro
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition" />
          </button>

          {/* Profile & Quick Settings Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 p-3.5 rounded-3xl liquid-glass-panel z-50 text-xs shadow-2xl border border-white bg-white/95 backdrop-blur-3xl space-y-3 text-slate-900"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] overflow-hidden shadow-xs">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Cinema Guest</h4>
                    <p className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-bold border border-emerald-200 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Premium Active
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/playlist"
                    onClick={() => {
                      playGlassClick();
                      setProfileOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-slate-800 transition font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>My Watchlist</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                      {playlistCount}
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      playGlassClick();
                      setProfileOpen(false);
                      onOpenPreferences();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 text-slate-800 transition text-left font-semibold"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>Playback Settings</span>
                  </button>

                  <Link
                    href="/player"
                    onClick={() => {
                      playGlassClick();
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 text-slate-800 transition font-semibold"
                  >
                    <Tv className="w-3.5 h-3.5 text-rose-600" />
                    <span>Universal Player</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
