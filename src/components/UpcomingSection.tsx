'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Calendar, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '@/lib/types';
import { playGlassClick, playGlassHover } from '@/lib/sound';

interface UpcomingSectionProps {
  movies: Movie[];
  onOpenDetails?: (movie: Movie) => void;
}

function getReleaseCountdown(dateStr?: string, year?: number): string {
  if (!dateStr && !year) return 'Premiering Soon';
  if (dateStr) {
    const target = new Date(dateStr);
    if (!isNaN(target.getTime())) {
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 14) return `In ${diffDays} Days`;
        if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} Weeks`;
        return `In ${Math.ceil(diffDays / 30)} Months`;
      }
    }
  }
  return year ? `Season ${year}` : 'Premiering Soon';
}

export const UpcomingSection: React.FC<UpcomingSectionProps> = ({ movies, onOpenDetails }) => {
  const router = useRouter();
  const upcomingList = movies.slice(0, 2);

  if (upcomingList.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#7A242B]" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#231215] tracking-tight">
            Upcoming Salon Premieres
          </h2>
        </div>
        <Link
          href="/movies?category=upcoming"
          onClick={playGlassClick}
          className="text-xs font-semibold text-[#7A242B] hover:text-[#56171D] transition"
        >
          View Archive
        </Link>
      </div>

      {/* Two Stacked Artisanal Editorial Cards */}
      <div className="flex flex-col gap-3.5 flex-1 justify-between">
        {upcomingList.map((movie) => {
          const countdownText = getReleaseCountdown(movie.releaseDate, movie.releaseYear);

          return (
            <motion.div
              key={movie.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => {
                playGlassClick();
                if (onOpenDetails) {
                  onOpenDetails(movie);
                } else {
                  router.push(`/movie/${movie.id}`);
                }
              }}
              onMouseEnter={playGlassHover}
              className="group relative flex-1 min-h-[190px] rounded-3xl overflow-hidden border border-[#E5DDD2] hover:border-[#D6CBC0] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer block bg-[#FFFDFB]"
            >
              {/* Backdrop Artwork */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                style={{
                  backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
                }}
              />

              {/* Editorial Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#231215]/90 via-[#231215]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#231215]/75 via-transparent to-transparent" />

              {/* Top Countdown Badge */}
              <div className="relative z-10 p-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#7A242B]/90 text-white border border-white/20 text-[11px] font-medium backdrop-blur-md shadow-xs flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-3 h-3 text-white" />
                  <span>{countdownText}</span>
                </span>

                {movie.genres?.[0] && (
                  <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-medium text-white/90 border border-white/20">
                    {movie.genres[0]}
                  </span>
                )}
              </div>

              {/* Bottom Info & Play Trailer Trigger */}
              <div className="relative z-10 p-4 flex items-end justify-between mt-auto">
                <div className="space-y-1 max-w-[70%]">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white leading-tight group-hover:text-amber-200 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-white/80">
                    <Calendar className="w-3 h-3 text-amber-300" />
                    <span>{movie.releaseDate || movie.releaseYear || 'Coming Soon'}</span>
                  </div>
                </div>

                {/* Magnetic Play Trailer Button */}
                <div className="w-10 h-10 rounded-full bg-white text-[#231215] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#7A242B] group-hover:text-white transition-all duration-300">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
