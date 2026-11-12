'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, ChevronLeft, ChevronRight, Star, Clock, Plus, Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '@/lib/types';
import { addToPlaylist, removeFromPlaylist, isInPlaylist } from '@/lib/storage';
import { playGlassClick, playGlassHover } from '@/lib/sound';

interface MovieShelfProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  seeAllHref?: string;
  movies: Movie[];
  onOpenDetails?: (movie: Movie) => void;
  showRankNumber?: boolean;
  aspectRatio?: 'poster' | 'backdrop';
}

export const MovieShelf: React.FC<MovieShelfProps> = ({
  title,
  icon: Icon,
  seeAllHref = '/movies',
  movies,
  onOpenDetails,
  showRankNumber = false,
  aspectRatio = 'backdrop',
}) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [watchlistIds, setWatchlistIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateWatchlist = () => {
      const state: Record<string, boolean> = {};
      movies.forEach((m) => {
        state[m.id] = isInPlaylist(m.id);
      });
      setWatchlistIds(state);
    };

    updateWatchlist();
    window.addEventListener('playlist_changed', updateWatchlist);
    return () => window.removeEventListener('playlist_changed', updateWatchlist);
  }, [movies]);

  const scroll = (direction: 'left' | 'right') => {
    playGlassClick();
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleToggleWatchlist = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation();
    playGlassClick();
    if (watchlistIds[movie.id]) {
      removeFromPlaylist(movie.id);
    } else {
      addToPlaylist(movie);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="w-full select-none space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={seeAllHref}
            onClick={playGlassClick}
            className="text-xs px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white font-semibold text-slate-700 hover:text-slate-950 transition border border-white/90 shadow-sm"
          >
            See all
          </Link>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              onMouseEnter={playGlassHover}
              aria-label="Scroll left"
              className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 transition shadow-sm border border-white/90 hover:scale-110 active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              onMouseEnter={playGlassHover}
              aria-label="Scroll right"
              className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 transition shadow-sm border border-white/90 hover:scale-110 active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Cards Rail */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1 touch-pan-x"
      >
        {movies.map((movie, idx) => {
          const inList = watchlistIds[movie.id];
          const isPoster = aspectRatio === 'poster';

          return (
            <motion.div
              key={`${movie.id}-${idx}`}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => {
                playGlassClick();
                if (onOpenDetails) {
                  onOpenDetails(movie);
                } else {
                  router.push(`/movie/${movie.id}`);
                }
              }}
              onMouseEnter={playGlassHover}
              className={`group relative flex-none rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/60 hover:border-indigo-400/80 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer bg-slate-900/10 liquid-gloss ${
                isPoster
                  ? 'w-[140px] sm:w-[175px] md:w-[195px] h-[210px] sm:h-[260px] md:h-[290px]'
                  : 'w-[195px] sm:w-[240px] md:w-[270px] h-[145px] sm:h-[175px] md:h-[195px]'
              }`}
            >
              {/* Image Artwork */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                style={{
                  backgroundImage: `url(${
                    isPoster
                      ? movie.posterUrl || movie.backdropUrl
                      : movie.backdropUrl || movie.posterUrl
                  })`,
                }}
              />

              {/* Multi-stop VisionOS gradient vignette for crystal clear text */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />

              {/* Rank Number Badge for Top Charts */}
              {showRankNumber && (
                <div className="absolute top-2 left-3 font-black text-3xl sm:text-5xl text-white/30 select-none group-hover:text-white/50 transition-colors tracking-tighter">
                  {idx + 1}
                </div>
              )}

              {/* Top Quick Actions (Info & Watchlist) */}
              <div className="relative z-10 p-2.5 sm:p-3.5 flex items-center justify-between">
                {movie.genres?.[0] ? (
                  <span className="text-[9px] sm:text-[10px] font-bold text-white bg-slate-900/70 backdrop-blur-md px-2 sm:px-2.5 py-0.5 rounded-full border border-white/20 inline-block shadow-sm">
                    {movie.genres[0]}
                  </span>
                ) : <div />}

                <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playGlassClick();
                      if (onOpenDetails) {
                        onOpenDetails(movie);
                      } else {
                        router.push(`/movie/${movie.id}`);
                      }
                    }}
                    aria-label="View details"
                    className="p-1 sm:p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-white/30 backdrop-blur-md transition hover:scale-110"
                  >
                    <Info className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => handleToggleWatchlist(e, movie)}
                    aria-label={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    className={`p-1 sm:p-1.5 rounded-full backdrop-blur-md border transition hover:scale-110 ${
                      inList
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-slate-900/70 hover:bg-slate-900 border-white/30 text-white'
                    }`}
                  >
                    {inList ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Bottom Card Info & Play Button */}
              <div className="relative z-10 w-full p-2.5 sm:p-3.5 mt-auto flex items-end justify-between gap-2">
                <div className="space-y-0.5 sm:space-y-1 max-w-[76%]">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight truncate group-hover:text-indigo-200 transition-colors drop-shadow-sm">
                    {movie.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-white/80 font-medium">
                    {movie.rating ? (
                      <span className="flex items-center gap-1 text-amber-300 font-bold tabular-nums">
                        <Star className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-amber-300" />
                        {movie.rating.toFixed(1)}
                      </span>
                    ) : null}

                    {movie.runtime && (
                      <span className="flex items-center gap-1 tabular-nums text-white/70">
                        <Clock className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-indigo-300" />
                        {movie.runtime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Circular Play CTA */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playGlassClick();
                    router.push(`/watch/${movie.id}`);
                  }}
                  aria-label={`Play ${movie.title}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 group-hover:bg-white text-slate-950 flex items-center justify-center backdrop-blur-md border border-white transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] shrink-0"
                >
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950 ml-0.5" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

