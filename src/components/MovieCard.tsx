'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Star, Plus, Check, Clock, Info } from 'lucide-react';
import { Movie } from '@/lib/types';
import { addToPlaylist, removeFromPlaylist, isInPlaylist } from '@/lib/storage';
import { playGlassClick, playGlassHover } from '@/lib/sound';

interface MovieCardProps {
  movie: Movie;
  showCategory?: boolean;
  onOpenDetails?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  showCategory = true,
  onOpenDetails,
}) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [inList, setInList] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setInList(isInPlaylist(movie.id));
    const handleUpdate = () => setInList(isInPlaylist(movie.id));
    window.addEventListener('playlist_changed', handleUpdate);
    return () => window.removeEventListener('playlist_changed', handleUpdate);
  }, [movie.id]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    playGlassHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const togglePlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    playGlassClick();
    if (inList) {
      removeFromPlaylist(movie.id);
    } else {
      addToPlaylist(movie);
    }
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    playGlassClick();
    if (onOpenDetails) {
      onOpenDetails(movie);
    } else {
      router.push(`/movie/${movie.id}`);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        playGlassClick();
        if (onOpenDetails) {
          onOpenDetails(movie);
        } else {
          router.push(`/movie/${movie.id}`);
        }
      }}
      className="group relative rounded-2xl sm:rounded-[1.6rem] overflow-hidden border border-[#E5DDD2] hover:border-[#D6CBC0] transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer bg-[#FFFDFB] flex flex-col aspect-[2/3] will-change-transform select-none"
    >
      {/* Poster Image */}
      <img
        src={movie.posterUrl || movie.backdropUrl}
        alt={movie.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-106"
      />

      {/* Warm Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#231215] via-[#231215]/40 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />

      {/* Top action pills: Rating, Info, and Watchlist */}
      <div className="relative z-10 p-3 sm:p-3.5 flex items-center justify-between">
        {movie.rating ? (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EE]/95 backdrop-blur-md border border-[#E8DFD4] text-[#231215] shadow-xs tabular-nums">
            <Star className="w-3 h-3 fill-[#C27803] text-[#C27803]" />
            {movie.rating.toFixed(1)}
          </span>
        ) : <div />}

        <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDetails}
            aria-label="Film details"
            className="p-1.5 rounded-full bg-[#FAF7F2]/90 hover:bg-white text-[#3A2427] border border-[#E5DDD2] backdrop-blur-md transition hover:scale-110 shadow-xs"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlaylist}
            aria-label={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`p-1.5 rounded-full backdrop-blur-md transition hover:scale-110 shadow-xs ${
              inList
                ? 'bg-[#7A242B] text-white border border-[#7A242B]'
                : 'bg-[#FAF7F2]/90 hover:bg-white text-[#3A2427] border border-[#E5DDD2]'
            }`}
          >
            {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Hover Center Quick Screen Trigger */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <div className="w-12 h-12 rounded-full bg-[#7A242B] text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Info: Title, Genres & Release Year */}
      <div className="relative z-10 mt-auto p-3.5 sm:p-4 space-y-1">
        {showCategory && movie.genres?.[0] && (
          <span className="text-[10px] uppercase font-sans tracking-wider text-[#FAF5EE]/80 font-medium">
            {movie.genres[0]}
          </span>
        )}
        <h3 className="font-serif text-sm sm:text-base font-bold text-white line-clamp-1 leading-snug group-hover:text-amber-100 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-[#FAF5EE]/75 tabular-nums">
          {movie.releaseYear && <span>{movie.releaseYear}</span>}
          {movie.runtime && (
            <>
              <span>•</span>
              <span>{movie.runtime}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
