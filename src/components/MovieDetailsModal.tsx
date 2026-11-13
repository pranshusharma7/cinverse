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
        {/* Soft Ambient Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playGlassClick();
            onClose();
          }}
          className="fixed inset-0 bg-[#231215]/50 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-2xl z-10 flex flex-col my-auto text-[#231215]"
        >
          {/* Hero Backdrop Banner */}
          <div className="relative w-full h-56 sm:h-80 shrink-0 overflow-hidden">
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#231215] via-[#231215]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#231215]/80 via-transparent to-transparent" />

            {/* Close Button */}
            <button
              onClick={() => {
                playGlassClick();
                onClose();
              }}
              onMouseEnter={playGlassHover}
              aria-label="Close details"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 rounded-full bg-[#FFFDFB]/90 hover:bg-[#FFFDFB] text-[#231215] border border-[#E5DDD2] backdrop-blur-md transition hover:scale-105 active:scale-95 shadow-md z-20"
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
                      className="px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-semibold backdrop-blur-md border border-white/25 shadow-xs"
                    >
                      {genre}
                    </span>
                  ))}
                  {movie.rating ? (
                    <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FAF5EE]/95 border border-[#E8DFD4] text-[#231215] text-[10px] sm:text-xs font-bold tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#C27803] text-[#C27803]" />
                      {movie.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                  {movie.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Modal Body: Details & Actions */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* Action Buttons: Watch Now, Watchlist, Share */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleWatchNow}
                onMouseEnter={playGlassHover}
                className="flex items-center gap-2 px-7 sm:px-9 py-3 rounded-full btn-terracotta text-white font-medium text-xs sm:text-sm tracking-wide shadow-md"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Screen Feature Film</span>
              </button>

              <button
                onClick={handleToggleWatchlist}
                onMouseEnter={playGlassHover}
                className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full border text-xs sm:text-sm font-medium transition ${
                  inWatchlist
                    ? 'bg-[#F4ECE1] border-[#7A242B] text-[#7A242B]'
                    : 'bg-[#FAF7F2] hover:bg-[#F4ECE1] border-[#D4C8BB] text-[#3D2528]'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                onMouseEnter={playGlassHover}
                className="p-3 rounded-full bg-[#FAF7F2] hover:bg-[#F4ECE1] border border-[#D4C8BB] text-[#54383B] transition shadow-xs"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {copied && <span className="text-xs text-[#7A242B] font-semibold">Link Copied!</span>}
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#7A242B]">
                Curatorial Overview &amp; Synopsis
              </h3>
              <p className="text-sm sm:text-base text-[#4F3639] leading-relaxed font-normal">
                {movie.overview}
              </p>
            </div>

            {/* Cast & Credits */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#7A242B]">
                  Featured Cast &amp; Auteurs
                </h3>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DDD2] shrink-0"
                    >
                      <User className="w-3.5 h-3.5 text-[#7A242B]" />
                      <span className="text-xs font-medium text-[#231215]">
                        {typeof actor === 'string' ? actor : (actor as any).name}
                      </span>
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
