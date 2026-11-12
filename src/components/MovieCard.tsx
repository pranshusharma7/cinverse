'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Star, Plus, Check, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setInList(isInPlaylist(movie.id));
    const handleUpdate = () => setInList(isInPlaylist(movie.id));
    window.addEventListener('playlist_changed', handleUpdate);
    return () => window.removeEventListener('playlist_changed', handleUpdate);
  }, [movie.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playGlassHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
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
      onMouseMove={handleMouseMove}
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
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.04, 1.04, 1.04)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
      }}
      className="group relative rounded-[2rem] overflow-hidden border border-white/90 hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-2xl cursor-pointer bg-white/40 flex flex-col aspect-[2/3] liquid-gloss will-change-transform select-none"
    >
      {/* Poster Image */}
      <img
        src={movie.posterUrl || movie.backdropUrl}
        alt={movie.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108"
      />

      {/* Multi-stop VisionOS high-contrast gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-95 group-hover:opacity-90 transition-opacity" />

      {/* Specular Liquid Glare Reflection Line (Moves with mouse) */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${(rotate.y + 8) * 6.25}% ${(-rotate.x + 8) * 6.25}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Top action pills: Rating, Info, and Watchlist */}
      <div className="relative z-10 p-3.5 flex items-center justify-between">
        {movie.rating ? (
          <span className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-white text-slate-900 shadow-md tabular-nums">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            {movie.rating.toFixed(1)}
          </span>
        ) : <div />}

        <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDetails}
            aria-label="Movie details"
            className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-white backdrop-blur-md transition hover:scale-110 shadow-md"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlaylist}
            aria-label={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`p-1.5 rounded-full backdrop-blur-md border transition hover:scale-110 shadow-md ${
              inList
                ? 'bg-indigo-600 border-indigo-400 text-white'
                : 'bg-white/90 hover:bg-white border-white text-slate-800'
            }`}
          >
            {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom info */}
      <div className="relative z-10 mt-auto p-4 space-y-1">
        {showCategory && movie.genres && movie.genres[0] && (
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-indigo-100 bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/25 inline-block shadow-sm">
            {movie.genres[0]}
          </span>
        )}
        <h3 className="text-xs sm:text-sm font-black text-white line-clamp-1 group-hover:text-indigo-200 transition-colors drop-shadow-md tracking-tight">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-white/80 font-medium pt-0.5 tabular-nums">
          <span>{movie.releaseYear}</span>
          {movie.runtime && (
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-indigo-300" />
              {movie.runtime}
            </span>
          )}
        </div>

        {/* Watch Now button shown on hover */}
        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playGlassClick();
              router.push(`/watch/${movie.id}`);
            }}
            className="w-full py-2 rounded-xl bg-white hover:bg-indigo-50 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xl active:scale-95 transition"
          >
            <Play className="w-3 h-3 fill-slate-950" />
            <span>Watch Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
