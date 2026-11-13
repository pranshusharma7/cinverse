'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Maximize,
  Minimize,
  Tv,
  Film,
} from 'lucide-react';
import { Movie } from '@/lib/types';
import { updateWatchProgress } from '@/lib/storage';

interface VideoPlayerProps {
  movie: Movie;
  embedUrl?: string;
  streamUrl?: string;
  streamFormat?: 'hls' | 'mp4' | 'dash' | 'embed';
  availableQualities?: string[];
  subtitles?: any[];
  audioTracks?: any[];
  isAvailable?: boolean;
  unavailableMessage?: string;
  season?: number;
  episode?: number;
  onEpisodeChange?: (season: number, episode: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  embedUrl,
  streamUrl,
  streamFormat = 'embed',
  isAvailable = true,
  unavailableMessage,
  season = 1,
  episode = 1,
  onEpisodeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls after inactivity on both mobile touch and desktop
  const triggerControlsVisibility = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3800);
  }, []);

  useEffect(() => {
    triggerControlsVisibility();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [triggerControlsVisibility]);

  // Compute verified TMDB ID
  const effectiveId = movie.tmdbId || (/^\d+$/.test(movie.id) ? movie.id : 550);

  // Direct nxsha.space stream embed URL (single dedicated server)
  const activeStreamUrl =
    embedUrl ||
    (movie.type === 'tv'
      ? `https://nxsha.space/embed/tv/${effectiveId}/${season}/${episode}?color=green`
      : `https://nxsha.space/embed/movie/${effectiveId}?color=green`);

  // Save to continue watching when opened
  useEffect(() => {
    updateWatchProgress(
      {
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        streamUrl: activeStreamUrl,
      },
      120, // Initial bookmark progress
      movie.durationSeconds || 7200
    );
  }, [movie.id, activeStreamUrl]);

  // Reset iframe loading state when episode changes
  useEffect(() => {
    setIframeLoaded(false);
    setShowControls(true);
  }, [season, episode, movie.id]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const toggleTheatre = () => {
    setIsTheatreMode((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsVisibility}
      onTouchStart={triggerControlsVisibility}
      onClick={triggerControlsVisibility}
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/10 sm:border-white/20 shadow-2xl transition-all duration-500 group select-none flex flex-col ${
        isTheatreMode ? 'sm:aspect-[21/9] sm:max-h-[88vh] aspect-video' : 'aspect-video'
      }`}
    >
      {/* Top Floating Player Bar (Compact & Auto-Hiding on Mobile) */}
      <div
        className={`absolute top-2 left-2 right-2 sm:top-3.5 sm:left-4 sm:right-4 z-30 flex items-center justify-between gap-2 pointer-events-none transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Left Title Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto bg-black/75 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 text-white shadow-lg min-w-0 max-w-[62%] sm:max-w-md">
          <Film className="w-3.5 h-3.5 text-[#C27803] shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold truncate text-white">
            {movie.title}
          </span>
          {movie.type === 'tv' && (
            <span className="text-[9px] sm:text-[10px] bg-[#7A242B] px-1.5 py-0.2 rounded-full font-bold shrink-0">
              S{season} E{episode}
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* Active Server Badge (nxsha.space HD) */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-medium shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden xs:inline">nxsha</span>
            <span className="xs:hidden">HD</span>
          </div>

          {/* Theatre Mode (Only on larger screens) */}
          <button
            onClick={toggleTheatre}
            className="hidden sm:flex p-2 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md transition shadow-lg active:scale-90"
            title="Theatre Mode (T)"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md transition shadow-lg active:scale-90"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Streaming Display (Direct nxsha.space Iframe Embed) */}
      <div className="relative w-full h-full flex-1 bg-black">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-slate-950 text-white z-10 px-4 text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#7A242B] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">
              Connecting to nxsha.space stream...
            </span>
          </div>
        )}

        <iframe
          key={`${activeStreamUrl}-${season}-${episode}`}
          src={activeStreamUrl}
          title={`${movie.title} - Online Stream`}
          onLoad={() => setIframeLoaded(true)}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      </div>

      {/* TV Series Episode Bar (Touch-friendly on Mobile) */}
      {movie.type === 'tv' && (
        <div className="p-2 sm:p-3 bg-[#110B0D] border-t border-white/10 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar z-20">
          <span className="text-[11px] sm:text-xs font-bold text-white px-1 sm:px-2 shrink-0">Episodes:</span>
          {Array.from({ length: movie.episodes || 12 }).map((_, idx) => {
            const epNum = idx + 1;
            const isActive = episode === epNum;
            return (
              <button
                key={epNum}
                onClick={() => {
                  onEpisodeChange?.(season, epNum);
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition shrink-0 ${
                  isActive
                    ? 'bg-[#7A242B] text-white shadow-xs'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                Ep {epNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
