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

// Helper to compute a realistic countdown string from a date string or release year
function getReleaseCountdown(dateStr?: string, year?: number): string {
  if (!dateStr && !year) return 'Coming Soon';
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
  return year ? `In ${year}` : 'Coming Soon';
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
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-extrabold text-slate-900 tracking-wide">
            Upcoming Trailers
          </h2>
        </div>
        <Link
          href="/movies?category=upcoming"
          onClick={playGlassClick}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
        >
          View all
        </Link>
      </div>

      {/* Two Stacked Vertical Glass Cards */}
      <div className="flex flex-col gap-3.5 flex-1 justify-between">
        {upcomingList.map((movie) => {
          const countdownText = getReleaseCountdown(movie.releaseDate, movie.releaseYear);

          return (
            <motion.div
              key={movie.id}
              whileHover={{ y: -3 }}
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
              className="group relative flex-1 min-h-[200px] rounded-[2rem] overflow-hidden border border-white/90 hover:border-white transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer block liquid-gloss bg-white/40 backdrop-blur-md"
            >
              {/* Landscape Backdrop Artwork with hover zoom preview */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108"
                style={{
                  backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
                }}
              />

              {/* Multi-stop VisionOS gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-transparent to-transparent" />

              {/* Top Countdown Badge */}
              <div className="relative z-10 p-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white border border-indigo-400 text-[11px] font-bold backdrop-blur-xl shadow-md flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-3 h-3 text-white" />
                  <span>{countdownText}</span>
                </span>

                {movie.genres?.[0] && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/30 backdrop-blur-md">
                    {movie.genres[0]}
                  </span>
                )}
              </div>

              {/* Bottom Info & Magnetic Play Button */}
              <div className="relative z-10 w-full p-4 mt-auto flex items-end justify-between gap-3">
                <div className="space-y-1 max-w-[75%]">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-snug drop-shadow-sm group-hover:text-indigo-200 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  {movie.releaseDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
                      <Calendar className="w-3 h-3 text-indigo-300" />
                      <span>{movie.releaseDate}</span>
                    </div>
                  )}
                </div>

                {/* Magnetic Circular Play Button */}
                <motion.button
                  whileHover={{ scale: 1.18 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playGlassClick();
                    router.push(`/watch/${movie.id}`);
                  }}
                  aria-label={`Play trailer for ${movie.title}`}
                  className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center backdrop-blur-xl border border-white shadow-lg shrink-0"
                >
                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
