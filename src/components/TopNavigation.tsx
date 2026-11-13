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
  Clapperboard,
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
    { label: 'Archive', href: '/' },
    { label: 'Explore', href: '/explore' },
    { label: 'Feature Films', href: '/movies' },
    { label: 'Series', href: '/tv' },
    { label: 'Anime Vault', href: '/anime' },
    { label: 'Watchlist', href: '/playlist' },
    { label: 'Screening Salon', href: '/player' },
  ];

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 px-1 relative z-30 flex-wrap select-none">
      {/* ========================================================
          LEFT: ARTISANAL BRAND EMBLEM & SEARCH CAPSULE
      ======================================================== */}
      <div className="flex items-center gap-3">
        {/* CINÉVERSE Artisanal Brand Emblem */}
        <Link
          href="/"
          onClick={playGlassClick}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-3 group mr-2 select-none"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#7A242B] flex items-center justify-center shadow-md shadow-[#7A242B]/20 group-hover:scale-105 transition-transform duration-300">
            <Clapperboard className="w-5 h-5 text-[#FAF5F0]" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#231215]">
              CINÉ<span className="text-[#7A242B]">VERSE</span>
            </span>
            <span className="text-[9px] tracking-[0.22em] uppercase font-sans font-semibold text-[#8C343B] mt-0.5">
              Curated Film Salon
            </span>
          </div>
        </Link>

        {/* Bespoke Editorial Command-Palette Search Capsule */}
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
          className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#E5DDD2] bg-[#FFFDFB] hover:bg-[#FAF6F0] text-[#422B2E] transition-all duration-300 cursor-pointer shadow-xs"
        >
          <Search className="w-4 h-4 text-[#7A242B]" />
          <span className="text-xs font-medium tracking-wide hidden md:inline text-[#5E474A]">
            Search curated cinema, auteurs, IMDb...
          </span>
          <span className="text-xs font-medium tracking-wide md:hidden text-[#5E474A]">Search</span>
          <div className="hidden sm:flex items-center gap-1 pl-1">
            <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-[#F2EAE0] border border-[#E4DBD0] text-[#70585B]">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* ========================================================
          CENTER: EDITORIAL SEGMENTED PILL NAVIGATION
      ======================================================== */}
      <nav className="hidden xl:flex items-center gap-1 p-1.5 rounded-full bg-[#F4EDE2] border border-[#E4DBD0] shadow-xs">
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
              className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'text-[#7A242B] font-semibold'
                  : 'text-[#61474B] hover:text-[#231215] hover:bg-white/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavSegmentLight"
                  className="absolute inset-0 rounded-full bg-[#FFFDFB] border border-[#E5DDD2] shadow-xs"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ========================================================
          RIGHT: WATCHLIST BADGE, NOTIFICATIONS & PROFILE
      ======================================================== */}
      <div className="flex items-center gap-2.5">
        {/* Watchlist Counter Pill (Quick Access) */}
        <Link
          href="/playlist"
          onClick={playGlassClick}
          onMouseEnter={playGlassHover}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDFB] hover:bg-[#F9F4EE] border border-[#E5DDD2] text-xs font-semibold text-[#54383B] transition shadow-xs"
        >
          <BookmarkCheck className="w-3.5 h-3.5 text-[#7A242B]" />
          <span>Watchlist</span>
          {playlistCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#7A242B] text-white text-[10px] font-bold">
              {playlistCount}
            </span>
          )}
        </Link>

        {/* Notification Bell with Terracotta Pulse */}
        <div className="relative">
          <button
            onClick={() => {
              playGlassClick();
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            className="p-2 sm:p-2.5 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] text-[#54383B] hover:text-[#231215] relative transition border border-[#E5DDD2] shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#7A242B] animate-pulse ring-2 ring-white" />
            )}
          </button>

          {/* Quick Notification Popover */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 p-4 rounded-3xl z-50 text-xs shadow-2xl border border-[#E5DDD2] bg-[#FFFDFB] text-[#231215]"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-[#F0E8DD] font-bold">
                  <div className="flex items-center gap-1.5 text-[#231215]">
                    <Sparkles className="w-3.5 h-3.5 text-[#7A242B]" />
                    <span className="font-serif">Salon Gazette &amp; Premieres</span>
                  </div>
                  <button
                    onClick={() => setHasUnread(false)}
                    className="text-[10px] text-[#7A242B] hover:underline font-semibold"
                  >
                    Mark read
                  </button>
                </div>
                <div className="py-2.5 space-y-3">
                  <div className="flex items-start gap-2.5 group/item cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-[#7A242B] shrink-0 mt-1.5" />
                    <div>
                      <p className="font-bold text-[#231215]">Direct Cinema Stream Connected</p>
                      <p className="text-[11px] text-[#694F52]">
                        Dedicated high-definition cinema streaming powered directly by nxsha.space.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 group/item cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                    <div>
                      <p className="font-bold text-[#231215]">Universal Screening Salon</p>
                      <p className="text-[11px] text-[#694F52]">
                        Paste external YouTube streams or drop local video files anytime.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 group/item cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-stone-600 shrink-0 mt-1.5" />
                    <div>
                      <p className="font-bold text-[#231215]">Curated Masterpieces Updated</p>
                      <p className="text-[11px] text-[#694F52]">
                        Explore the newly added Auteur Collection &amp; Anime Vault.
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
            className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] transition text-left group border border-[#E5DDD2] shadow-xs"
          >
            <div className="w-7 h-7 rounded-full bg-[#7A242B] p-[1.5px] overflow-hidden shadow-xs shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                alt="Cinema Patron"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[11px] font-bold text-[#231215]">
                Cinéaste Member
              </span>
              <span className="text-[9px] text-[#7A242B] font-semibold tracking-wide">
                Salon Patron
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A7174] group-hover:text-[#231215] transition" />
          </button>

          {/* Profile & Quick Settings Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 p-2 rounded-2xl z-50 text-xs shadow-2xl border border-[#E5DDD2] bg-[#FFFDFB] text-[#231215]"
              >
                <div className="p-2 border-b border-[#F0E8DD]">
                  <p className="font-bold text-sm text-[#231215]">Patron Screening Lounge</p>
                  <p className="text-[11px] text-[#7E6568]">Lifetime Editorial Access</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/playlist"
                    onClick={() => {
                      playGlassClick();
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F6EFE6] transition text-[#3A2427]"
                  >
                    <BookmarkCheck className="w-4 h-4 text-[#7A242B]" />
                    <span>My Curated Watchlist</span>
                  </Link>
                  <Link
                    href="/player"
                    onClick={() => {
                      playGlassClick();
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F6EFE6] transition text-[#3A2427]"
                  >
                    <Play className="w-4 h-4 text-[#7A242B]" />
                    <span>Universal Screening Salon</span>
                  </Link>
                  <button
                    onClick={() => {
                      playGlassClick();
                      setProfileOpen(false);
                      onOpenPreferences();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F6EFE6] transition text-[#3A2427] text-left"
                  >
                    <Sliders className="w-4 h-4 text-[#7A242B]" />
                    <span>Playback Preferences</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
