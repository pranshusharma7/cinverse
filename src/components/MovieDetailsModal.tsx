'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, Check, Star, Clock, Calendar, Film, User, Volume2, Share2 } from 'lucide-react';
import { Movie } from '@/lib/types';
import { addToPlaylist, removeFromPlaylist, isInPlaylist } from '@/lib/storage';
import { playGlassClick, playGlassHover } from '@/lib/sound';

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (movie) {
      setInWatchlist(isInPlaylist(movie.id));
    }
  }, [movie]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const handleToggleWatchlist = () => {
    playGlassClick();
    if (inWatchlist) {
      removeFromPlaylist(movie.id);
      setInWatchlist(false);
    } else {
      addToPlaylist(movie);
      setInWatchlist(true);
    }
  };

  const handleWatchNow = () => {
    playGlassClick();
    onClose();
    router.push(`/watch/${movie.id}`);
  };

  const handleShare = async () => {
    playGlassClick();
    try {
      if (navigator.share) {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} on CINÉVERSE!`,
          url: `${window.location.origin}/movie/${movie.id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/movie/${movie.id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or clipboard fallback
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none overflow-y-auto">
        {/* Spatial Frosted Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playGlassClick();
            onClose();
          }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white/95 border-2 border-white shadow-2xl backdrop-blur-3xl z-10 flex flex-col my-auto text-slate-900"
        >
          {/* Hero Backdrop Banner */}
          <div className="relative w-full h-52 sm:h-80 shrink-0 overflow-hidden">
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            {/* Multi-stop visionOS Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

            {/* Close Button */}
            <button
              onClick={() => {
                playGlassClick();
                onClose();
              }}
              onMouseEnter={playGlassHover}
              aria-label="Close details"
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-white backdrop-blur-xl transition hover:scale-105 active:scale-95 shadow-md z-20"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Overlay Info at bottom of hero banner */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end justify-between gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                {/* Genre Pills */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {movie.genres?.map((genre) => (
                    <span
                      key={genre}
                      className="px-2.5 sm:px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold backdrop-blur-md border border-white/25 shadow-sm"
                    >
                      {genre}
                    </span>
                  ))}
                  {movie.rating ? (
                    <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 text-[10px] sm:text-xs font-black border border-white backdrop-blur-md tabular-nums shadow-md">
                      <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-500" />
                      IMDb {movie.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>

                <h2 className="text-xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {movie.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white/50">
            {/* Metadata Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 sm:py-3.5 px-4 sm:px-5 rounded-2xl bg-slate-100/90 border border-slate-200/90 text-xs text-slate-700 shadow-inner">
              <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
                {movie.releaseYear && (
                  <span className="flex items-center gap-1.5 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{movie.releaseDate || movie.releaseYear}</span>
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1.5 font-bold tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{movie.runtime}</span>
                  </span>
                )}
                {movie.type && (
                  <span className="flex items-center gap-1.5 uppercase font-black tracking-wider text-[11px] text-indigo-600">
                    <Film className="w-3.5 h-3.5" />
                    <span>{movie.type}</span>
                  </span>
                )}
                {movie.director && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="text-slate-400 font-normal">Directed by</span>
                    <strong className="text-slate-900 font-bold">{movie.director}</strong>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleShare}
                  onMouseEnter={playGlassHover}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 transition flex items-center gap-1.5 text-xs font-bold shadow-xs flex-1 sm:flex-initial justify-center"
                  title="Share movie"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{copied ? 'Copied!' : 'Share'}</span>
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  onMouseEnter={playGlassHover}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border shadow-xs flex-1 sm:flex-initial justify-center ${
                    inWatchlist
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {inWatchlist ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>In List</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Watchlist</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleWatchNow}
                  onMouseEnter={playGlassHover}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 hover:scale-105 active:scale-95 transition flex-1 sm:flex-initial justify-center"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Watch Now</span>
                </button>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-black tracking-wider text-indigo-600">
                Synopsis
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {movie.overview || 'No synopsis available for this title.'}
              </p>
            </div>

            {/* Cast Members */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-black tracking-wider text-indigo-600">
                  Featured Cast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {movie.cast.slice(0, 8).map((actor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 flex items-center gap-3 transition shadow-xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                        {actor.avatarUrl ? (
                          <img
                            src={actor.avatarUrl}
                            alt={actor.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          actor.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{actor.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium truncate">{actor.role || 'Actor'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

