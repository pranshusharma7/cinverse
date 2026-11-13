'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Clock,
  Calendar,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/lib/types';
import { playGlassClick, playGlassHover } from '@/lib/sound';
import { addToPlaylist, removeFromPlaylist, isInPlaylist } from '@/lib/storage';

interface HeroSectionProps {
  movies: Movie[];
  onOpenDetails?: (movie: Movie) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ movies, onOpenDetails }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);

  const featuredList = movies.length > 0 ? movies : [];
  const currentMovie = featuredList[currentIndex] || featuredList[0];

  // Track watchlist state for current movie
  useEffect(() => {
    if (currentMovie) {
      setInWatchlist(isInPlaylist(currentMovie.id));
    }
    const handleUpdate = () => {
      if (currentMovie) setInWatchlist(isInPlaylist(currentMovie.id));
    };
    window.addEventListener('playlist_changed', handleUpdate);
    return () => window.removeEventListener('playlist_changed', handleUpdate);
  }, [currentMovie]);

  const handleNext = useCallback(() => {
    playGlassClick();
    if (featuredList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  }, [featuredList.length]);

  const handlePrev = useCallback(() => {
    playGlassClick();
    if (featuredList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  }, [featuredList.length]);

  useEffect(() => {
    if (featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [featuredList.length]);

  if (!currentMovie) return null;

  const handleDetailsClick = () => {
    playGlassClick();
    if (onOpenDetails) {
      onOpenDetails(currentMovie);
    } else {
      router.push(`/movie/${currentMovie.id}`);
    }
  };

  const handleToggleWatchlist = () => {
    playGlassClick();
    if (inWatchlist) {
      removeFromPlaylist(currentMovie.id);
      setInWatchlist(false);
    } else {
      addToPlaylist(currentMovie);
      setInWatchlist(true);
    }
  };

  return (
    <div className="w-full bg-[#FFFDFB] rounded-3xl sm:rounded-[2.5rem] border border-[#E5DDD2] p-6 sm:p-9 lg:p-11 shadow-[0_12px_40px_-15px_rgba(45,18,22,0.06)] relative overflow-hidden select-none">
      {/* Background Subtle Sunlit Gradient */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#FAF4EC]/70 via-[#FFFDFB]/40 to-transparent pointer-events-none" />

      {/* Asymmetric Split Layout: Left Editorial Typography & Right Framed Cinema Artwork */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
        
        {/* ========================================================
            LEFT (7 COLS): LITERARY HEADLINE & EDITORIAL CONTROLS
        ======================================================== */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5 sm:space-y-6">
          {/* Editorial Micro-Label / Curator Note */}
          <div className="flex items-center gap-3">
            <span className="font-serif italic text-xs tracking-[0.2em] uppercase text-[#7A242B] font-semibold">
              Curator's Spotlight • Vol. IX
            </span>
            <div className="h-px w-10 bg-[#E5DDD2]" />
            {currentMovie.isTrending && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F6ECE6] border border-[#E9DDD0] text-[10px] font-sans font-bold text-[#7A242B] uppercase tracking-wider">
                Festival Winner
              </span>
            )}
          </div>

          {/* Large Editorial Serif Headline (Inspired by Reference) */}
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${currentMovie.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-3xl sm:text-5xl lg:text-[3.6rem] font-bold text-[#231215] leading-[1.08] tracking-tight"
              >
                {currentMovie.title}
              </motion.h1>
            </AnimatePresence>

            {/* Tagline / Subtitle in Refined Serif Italic */}
            <p className="font-serif italic text-base sm:text-lg text-[#6E4E52]">
              Experience Cinematic Poetry &amp; Modern Narrative
            </p>
          </div>

          {/* Film Metadata Pills */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap text-xs">
            {currentMovie.rating ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] font-bold text-[#7A242B] tabular-nums shadow-xs">
                <Star className="w-3.5 h-3.5 fill-[#C27803] text-[#C27803]" />
                IMDb {currentMovie.rating.toFixed(1)}
              </span>
            ) : null}

            {currentMovie.runtime && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] text-[#5C4548] font-medium tabular-nums">
                <Clock className="w-3 h-3 text-[#7A242B]" />
                {currentMovie.runtime}
              </span>
            )}

            {currentMovie.releaseYear && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] text-[#5C4548] font-medium tabular-nums">
                <Calendar className="w-3 h-3 text-[#7A242B]" />
                {currentMovie.releaseYear}
              </span>
            )}

            {currentMovie.genres?.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 rounded-full bg-[#F7F2EB] border border-[#E5DDD2] text-[#695155] font-medium"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Curator's Synopsis */}
          <p className="text-xs sm:text-sm text-[#5B4346] leading-relaxed line-clamp-3 max-w-xl font-normal">
            {currentMovie.overview}
          </p>

          {/* Action Buttons: Solid Terracotta Pill (Like Reference "Get Started") + Framed Notes */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Link
              href={`/watch/${currentMovie.id}`}
              onClick={playGlassClick}
              onMouseEnter={playGlassHover}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full btn-terracotta font-sans text-xs sm:text-sm font-semibold tracking-wide"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Feature Film</span>
            </Link>

            <button
              onClick={handleDetailsClick}
              onMouseEnter={playGlassHover}
              className="flex items-center gap-2 px-5 sm:px-7 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F4ECE1] border border-[#DCD3C7] text-[#3D2528] font-medium text-xs sm:text-sm transition-all duration-300 shadow-xs hover:scale-102"
            >
              <Info className="w-4 h-4 text-[#7A242B]" />
              <span>Film Archive &amp; Notes</span>
            </button>

            <button
              onClick={handleToggleWatchlist}
              onMouseEnter={playGlassHover}
              aria-label={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              className={`p-3 rounded-full border transition-all duration-300 ${
                inWatchlist
                  ? 'bg-[#F4ECE1] border-[#7A242B] text-[#7A242B]'
                  : 'bg-[#FAF7F2] hover:bg-[#F4ECE1] border-[#DCD3C7] text-[#5E474A]'
              }`}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {/* Bottom Film Index & Chevron Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#F0E8DD]">
            <div className="flex items-center gap-2">
              {featuredList.slice(0, 5).map((movie, idx) => (
                <button
                  key={movie.id}
                  onClick={() => {
                    playGlassClick();
                    setCurrentIndex(idx);
                  }}
                  onMouseEnter={playGlassHover}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="group py-1 flex items-center gap-1.5 transition-all"
                >
                  <span
                    className={`text-[11px] font-mono transition-colors ${
                      idx === currentIndex ? 'font-bold text-[#7A242B]' : 'text-[#A08E90]'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <div
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: idx === currentIndex ? '24px' : '8px',
                      backgroundColor: idx === currentIndex ? '#7A242B' : '#E5DDD2',
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                onMouseEnter={playGlassHover}
                aria-label="Previous film"
                className="p-2 rounded-full bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E5DDD2] text-[#4F3639] transition hover:scale-105 active:scale-95 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                onMouseEnter={playGlassHover}
                aria-label="Next film"
                className="p-2 rounded-full bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E5DDD2] text-[#4F3639] transition hover:scale-105 active:scale-95 shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT (5 COLS): FRAMED ARTISANAL CINEMA STILL (Inspired by Reference Photo)
        ======================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div
            onClick={() => router.push(`/watch/${currentMovie.id}`)}
            className="group relative rounded-3xl sm:rounded-[2.2rem] overflow-hidden border-2 border-[#E8DFD3] shadow-[0_16px_40px_-10px_rgba(45,18,22,0.12)] cursor-pointer aspect-[4/5] sm:aspect-[4/4.8] bg-[#F5EFE6]"
          >
            {/* Framed Cinematic Photograph */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentMovie.id}
                src={currentMovie.posterUrl || currentMovie.backdropUrl}
                alt={currentMovie.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </AnimatePresence>

            {/* Subtle Vignette Gradient for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#231215]/80 via-transparent to-transparent opacity-85 group-hover:opacity-75 transition-opacity" />

            {/* Central Magnetic Play Emblem */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#7A242B]/90 backdrop-blur-md text-white flex items-center justify-center border-2 border-white/60 shadow-xl group-hover:scale-110 group-hover:bg-[#641C22] transition-all duration-300">
                <Play className="w-6 h-6 fill-white text-white ml-0.5" />
              </div>
            </div>

            {/* Bottom Caption Pill (Like Curated Gallery Tag) */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/95 text-xs z-10 px-4 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
              <span className="font-serif italic text-white truncate pr-2">
                Curator's Screen Edition
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-amber-200 shrink-0">
                Direct nxsha stream
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
