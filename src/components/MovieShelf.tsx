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
    <div className="w-full select-none space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 text-[#7A242B]" />}
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231215] tracking-tight">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={seeAllHref}
            onClick={playGlassClick}
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] font-semibold text-[#54383B] hover:text-[#231215] transition border border-[#E5DDD2] shadow-xs"
          >
            Explore Archive
          </Link>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              onMouseEnter={playGlassHover}
              aria-label="Scroll left"
              className="p-1.5 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] text-[#54383B] hover:text-[#231215] transition shadow-xs border border-[#E5DDD2] hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              onMouseEnter={playGlassHover}
              aria-label="Scroll right"
              className="p-1.5 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] text-[#54383B] hover:text-[#231215] transition shadow-xs border border-[#E5DDD2] hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Cards Rail */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1 touch-pan-x"
      >
        {movies.map((movie, idx) => {
          const inList = watchlistIds[movie.id];
          const isPoster = aspectRatio === 'poster';

          return (
            <motion.div
              key={`${movie.id}-${idx}`}
              whileHover={{ y: -3 }}
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
              className={`group relative flex-none rounded-2xl sm:rounded-[1.6rem] overflow-hidden border border-[#E5DDD2] hover:border-[#D6CBC0] transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer bg-[#F5EFE6] ${
                isPoster
                  ? 'w-[145px] sm:w-[180px] md:w-[200px] h-[215px] sm:h-[265px] md:h-[295px]'
                  : 'w-[200px] sm:w-[245px] md:w-[275px] h-[150px] sm:h-[180px] md:h-[200px]'
              }`}
            >
              {/* Image Artwork */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-106"
                style={{
                  backgroundImage: `url(${
                    isPoster
                      ? movie.posterUrl || movie.backdropUrl
                      : movie.backdropUrl || movie.posterUrl
                  })`,
                }}
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#231215] via-[#231215]/35 to-transparent opacity-85 group-hover:opacity-80 transition-opacity" />

              {/* Top Rank Number (For Trending Top 10) */}
              {showRankNumber && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="font-serif text-2xl sm:text-3xl font-black text-white/90 drop-shadow-md">
                    #{idx + 1}
                  </span>
                </div>
              )}

              {/* Top Rating Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                {movie.rating ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5EE]/95 border border-[#E8DFD4] text-[#231215] shadow-xs tabular-nums">
                    <Star className="w-3 h-3 fill-[#C27803] text-[#C27803]" />
                    {movie.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>

              {/* Central Play Trigger on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <div className="w-11 h-11 rounded-full bg-[#7A242B] text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>

              {/* Bottom Film Metadata */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5 z-10 space-y-1">
                <h3 className="font-serif text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-amber-100 transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-white/80 tabular-nums">
                  <div className="flex items-center gap-1.5">
                    {movie.releaseYear && <span>{movie.releaseYear}</span>}
                    {movie.type === 'tv' && (
                      <span className="px-1.5 py-0.2 rounded bg-white/20 text-white font-medium">
                        Series
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleToggleWatchlist(e, movie)}
                    aria-label={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    className={`p-1 rounded-full transition ${
                      inList ? 'text-[#C27803]' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {inList ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
