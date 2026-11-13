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
    <div className="w-full select-none space-y-3.5">
      {/* Header with Title & See All Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231215] tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={seeAllHref}
            onClick={playGlassClick}
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] font-semibold text-[#54383B] hover:text-[#231215] transition border border-[#E5DDD2] shadow-xs"
          >
            Explore All
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
              className="group relative flex-none w-[220px] sm:w-[250px] h-[165px] sm:h-[185px] rounded-2xl sm:rounded-[1.6rem] overflow-hidden border border-[#E5DDD2] hover:border-[#D6CBC0] transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer bg-[#F5EFE6]"
            >
              {/* Movie Backdrop Artwork */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-106"
                style={{
                  backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
                }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#231215] via-[#231215]/40 to-transparent" />

              {/* Top Genre & Rating */}
              <div className="relative z-10 p-3.5 flex items-center justify-between">
                {movie.genres?.[0] ? (
                  <span className="text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 inline-block shadow-xs">
                    {movie.genres[0]}
                  </span>
                ) : <div />}

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

              {/* Bottom Film Details */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10 space-y-1">
                <h3 className="font-serif text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-amber-100 transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-white/80 tabular-nums">
                  <span>{movie.releaseYear || 'Cinema Edition'}</span>
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
