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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/lib/types';
import { playGlassClick, playGlassHover } from '@/lib/sound';
import { addToPlaylist, removeFromPlaylist, isInPlaylist } from '@/lib/storage';

interface HeroSectionProps {
  movies: Movie[];
  onOpenDetails?: (movie: Movie) => void;
}

// Generate dynamic atmospheric ambient colors per movie based on genres or title
function getHeroPalette(movie: Movie): { primary: string; secondary: string } {
  const genres = (movie.genres || []).map((g) => g.toLowerCase());
  if (genres.includes('sci-fi') || genres.includes('science fiction')) {
    return { primary: 'rgba(6, 182, 212, 0.22)', secondary: 'rgba(139, 92, 246, 0.18)' };
  }
  if (genres.includes('horror') || genres.includes('mystery')) {
    return { primary: 'rgba(225, 29, 72, 0.24)', secondary: 'rgba(147, 51, 234, 0.16)' };
  }
  if (genres.includes('drama') || genres.includes('crime')) {
    return { primary: 'rgba(16, 185, 129, 0.20)', secondary: 'rgba(245, 158, 11, 0.16)' };
  }
  if (genres.includes('comedy') || genres.includes('romance')) {
    return { primary: 'rgba(236, 72, 153, 0.22)', secondary: 'rgba(251, 146, 60, 0.18)' };
  }
  // Default action / superhero: indigo + rose
  return { primary: 'rgba(99, 102, 241, 0.22)', secondary: 'rgba(244, 63, 94, 0.16)' };
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

  // Broadcast hero palette to the ambient BackgroundMesh on slide change
  useEffect(() => {
    if (!currentMovie) return;
    const palette = getHeroPalette(currentMovie);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('hero_color_changed', {
          detail: palette,
        })
      );
    }
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
    }, 9000);

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
    <div className="relative w-full h-[420px] sm:h-[460px] md:h-[500px] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 group liquid-gloss select-none">
      {/* Background artwork with smooth visionOS crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentMovie.backdropUrl || currentMovie.posterUrl})`,
          }}
        >
          {/* Multi-stop bottom-left cinematic vignette gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06070B] via-[#06070B]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-[#06070B]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Stage */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-7 md:p-10">
        {/* Top Badges & Micro-Labels */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {currentMovie.isTrending && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] sm:text-xs font-bold backdrop-blur-xl shadow-lg"
            >
              <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>Trending Spotlight</span>
            </motion.div>
          )}

          {/* Floating Glass Genre Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {currentMovie.genres?.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-[11px] sm:text-xs font-semibold backdrop-blur-xl shadow-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Rating, Runtime, & Year */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-white/80 ml-1">
            {currentMovie.rating ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 backdrop-blur-md tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                IMDb {currentMovie.rating.toFixed(1)}
              </span>
            ) : null}

            {currentMovie.runtime && (
              <span className="hidden sm:flex items-center gap-1 tabular-nums font-medium text-white/70">
                <Clock className="w-3 h-3 text-indigo-400" />
                {currentMovie.runtime}
              </span>
            )}

            {currentMovie.releaseYear && (
              <span className="hidden sm:flex items-center gap-1 tabular-nums font-medium text-white/70">
                <Calendar className="w-3 h-3 text-indigo-400" />
                {currentMovie.releaseYear}
              </span>
            )}
          </div>
        </div>

        {/* Center / Bottom Info */}
        <div className="max-w-2xl space-y-2.5 sm:space-y-3.5">
          <motion.h1
            key={`title-${currentMovie.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-display drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-[1.1]"
          >
            {currentMovie.title}
          </motion.h1>

          <motion.p
            key={`desc-${currentMovie.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs sm:text-sm text-white/85 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-xl font-normal"
          >
            {currentMovie.overview}
          </motion.p>

          {/* Action CTAs: Watch Now + Details + Add to Watchlist */}
          <div className="flex items-center gap-2 sm:gap-3 pt-2 flex-wrap">
            <Link
              href={`/watch/${currentMovie.id}`}
              onClick={playGlassClick}
              onMouseEnter={playGlassHover}
              className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-white hover:bg-white/95 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group/btn"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950 group-hover/btn:translate-x-0.5 transition-transform" />
              <span>Watch Now</span>
            </Link>

            <button
              onClick={handleDetailsClick}
              onMouseEnter={playGlassHover}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Info className="w-4 h-4 text-white" />
              <span>More Details</span>
            </button>

            <button
              onClick={handleToggleWatchlist}
              onMouseEnter={playGlassHover}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                inWatchlist
                  ? 'bg-indigo-600/80 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/25 text-white/90 hover:text-white'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Carousel Navigation: Progress Dots & Chevrons */}
        <div className="flex items-center justify-between pt-2">
          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {featuredList.slice(0, 6).map((movie, idx) => (
              <button
                key={movie.id}
                onClick={() => {
                  playGlassClick();
                  setCurrentIndex(idx);
                }}
                onMouseEnter={playGlassHover}
                aria-label={`Go to slide ${idx + 1}`}
                className="relative h-2 rounded-full transition-all duration-300 overflow-hidden"
                style={{
                  width: idx === currentIndex ? '28px' : '8px',
                  backgroundColor: idx === currentIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                }}
              />
            ))}
          </div>

          {/* Chevron Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              onMouseEnter={playGlassHover}
              aria-label="Previous movie"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl transition hover:scale-110 active:scale-90 shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              onMouseEnter={playGlassHover}
              aria-label="Next movie"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white backdrop-blur-xl transition hover:scale-110 active:scale-90 shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
