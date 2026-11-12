'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, ChevronLeft, ChevronRight, Star, Clock, Plus, Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '@/lib/types';
import { addToPlaylist, removeFromPlaylist, isInPlaylist } from '@/lib/storage';
import { playGlassClick, playGlassHover } from '@/lib/sound';

interface RecommendedCarouselProps {
  title?: string;
  seeAllHref?: string;
  movies: Movie[];
  onOpenDetails?: (movie: Movie) => void;
}

export const RecommendedCarousel: React.FC<RecommendedCarouselProps> = ({
  title = 'Recommended for you',
  seeAllHref = '/movies',
  movies,
  onOpenDetails,
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

  return (
    <div className="w-full select-none">
      {/* Header with Title & See All Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-wide">{title}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={seeAllHref}
            onClick={playGlassClick}
            className="text-xs px-3.5 py-1.5 rounded-full liquid-glass-pill font-bold text-slate-700 hover:text-slate-950 transition border border-white/80 bg-white/70 shadow-xs"
          >
            See all
          </Link>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              onMouseEnter={playGlassHover}
              aria-label="Scroll left"
              className="p-1.5 rounded-full liquid-glass-pill text-slate-700 hover:text-slate-950 transition shadow-xs border border-white/80 bg-white/70 hover:scale-110 active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              onMouseEnter={playGlassHover}
              aria-label="Scroll right"
              className="p-1.5 rounded-full liquid-glass-pill text-slate-700 hover:text-slate-950 transition shadow-xs border border-white/80 bg-white/70 hover:scale-110 active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1 select-none"
      >
        {movies.map((movie) => {
          const inList = watchlistIds[movie.id];

          return (
            <motion.div
              key={movie.id}
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
              className="group relative flex-none w-[220px] sm:w-[245px] h-[165px] sm:h-[180px] rounded-[2rem] overflow-hidden border border-white/90 hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-2xl cursor-pointer bg-white/40 liquid-gloss"
            >
              {/* Movie Backdrop Artwork */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                style={{
                  backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
                }}
              />

              {/* Multi-stop VisionOS gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />

              {/* Subtle Poster Shine Glare */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/15 to-transparent" />

              {/* Top Quick Action Overlay (Bookmark & Info Details) */}
              <div className="relative z-10 p-3.5 flex items-center justify-between">
                {movie.genres?.[0] ? (
                  <span className="text-[10px] font-extrabold text-white bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/25 inline-block shadow-sm">
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
                    className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-white backdrop-blur-md transition hover:scale-110 shadow-md"
                  >
                    <Info className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => handleToggleWatchlist(e, movie)}
                    aria-label={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    className={`p-1.5 rounded-full backdrop-blur-md border transition hover:scale-110 shadow-md ${
                      inList
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-white/90 hover:bg-white border-white text-slate-800'
                    }`}
                  >
                    {inList ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Card Bottom Content & Play CTA */}
              <div className="relative z-10 w-full p-3.5 mt-auto flex items-end justify-between gap-2">
                <div className="space-y-1 max-w-[76%]">
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight truncate group-hover:text-indigo-200 transition-colors drop-shadow-md">
                    {movie.title}
                  </h3>

                  <div className="flex items-center gap-2.5 text-[10px] text-white/80 font-medium">
                    {movie.rating ? (
                      <span className="flex items-center gap-1 text-amber-300 font-extrabold tabular-nums">
                        <Star className="w-3 h-3 fill-amber-300" />
                        {movie.rating.toFixed(1)}
                      </span>
                    ) : null}

                    {movie.runtime && (
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock className="w-2.5 h-2.5 text-indigo-300" />
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
                  className="w-8 h-8 rounded-full bg-white hover:bg-indigo-50 text-slate-950 flex items-center justify-center backdrop-blur-md border border-white transition-all shadow-lg shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
