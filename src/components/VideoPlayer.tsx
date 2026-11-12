'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

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
      className={`relative rounded-3xl overflow-hidden bg-black border-2 border-white shadow-2xl transition-all duration-500 group select-none flex flex-col ${
        isTheatreMode ? 'w-full aspect-[21/9] max-h-[88vh]' : 'w-full aspect-video'
      }`}
    >
      {/* Top Floating Liquid Glass Player Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        {/* Left Title Badge */}
        <div className="flex items-center gap-2.5 pointer-events-auto bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 text-white shadow-lg">
          <Film className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold truncate max-w-[180px] sm:max-w-md">
            {movie.title}
          </span>
          {movie.type === 'tv' && (
            <span className="text-[10px] bg-indigo-500/80 px-2 py-0.5 rounded-full font-bold">
              S{season} E{episode}
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Active Server Badge (nxsha.space) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white text-[11px] font-bold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>nxsha.space</span>
          </div>

          {/* Theatre Mode */}
          <button
            onClick={toggleTheatre}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-xl transition shadow-lg"
            title="Theatre Mode (T)"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-xl transition shadow-lg"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Streaming Display (Direct nxsha.space Iframe Embed) */}
      <div className="relative w-full h-full flex-1 bg-black">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white z-10">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">
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
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* TV Series Episode Bar (If TV Series) */}
      {movie.type === 'tv' && (
        <div className="p-3 bg-slate-950/90 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar z-20">
          <span className="text-xs font-bold text-white px-2 shrink-0">Episodes:</span>
          {Array.from({ length: movie.episodes || 12 }).map((_, idx) => {
            const epNum = idx + 1;
            const isActive = episode === epNum;
            return (
              <button
                key={epNum}
                onClick={() => {
                  onEpisodeChange?.(season, epNum);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
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
