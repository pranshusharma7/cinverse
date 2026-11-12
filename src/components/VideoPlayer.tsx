'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Maximize,
  Minimize,
  Tv,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Film,
  Youtube,
  FileVideo,
  Server,
  RefreshCw,
} from 'lucide-react';
import { Movie } from '@/lib/types';
import { updateWatchProgress } from '@/lib/storage';
import { playGlassClick, playGlassHover } from '@/lib/sound';
import { UnifiedPlayer } from './UnifiedPlayer';

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

export type StreamServerType = 'nxsha' | 'vidsrc' | 'autoembed';

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
  const [playerMode, setPlayerMode] = useState<'stream' | 'youtube' | 'local'>('stream');
  const [streamServer, setStreamServer] = useState<StreamServerType>('nxsha');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Compute verified TMDB ID
  const effectiveId = movie.tmdbId || (/^\d+$/.test(movie.id) ? movie.id : 550);

  // Dynamic server embed generator
  const getServerEmbedUrl = (server: StreamServerType): string => {
    if (server === 'vidsrc') {
      return movie.type === 'tv'
        ? `https://vidsrc.to/embed/tv/${effectiveId}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${effectiveId}`;
    }
    if (server === 'autoembed') {
      return movie.type === 'tv'
        ? `https://player.autoembed.cc/embed/tv/${effectiveId}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${effectiveId}`;
    }
    // Default server 1: nxsha.space
    return (
      embedUrl ||
      (movie.type === 'tv'
        ? `https://nxsha.space/embed/tv/${effectiveId}/${season}/${episode}?color=green`
        : `https://nxsha.space/embed/movie/${effectiveId}?color=green`)
    );
  };

  const activeStreamUrl = getServerEmbedUrl(streamServer);

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

  // Reset iframe loading state when server or episode changes
  useEffect(() => {
    setIframeLoaded(false);
  }, [streamServer, season, episode, movie.id]);

  const toggleFullscreen = () => {
    playGlassClick();
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
    playGlassClick();
    setIsTheatreMode((prev) => !prev);
  };

  // If user selected YouTube or Local player mode, render UnifiedPlayer
  if (playerMode === 'youtube' || playerMode === 'local') {
    return (
      <div className="w-full flex flex-col gap-4">
        {/* Return back to movie stream pill */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => {
              playGlassClick();
              setPlayerMode('stream');
            }}
            onMouseEnter={playGlassHover}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 text-xs font-bold transition border border-white"
          >
            <Film className="w-3.5 h-3.5 text-indigo-600" />
            <span>← Back to {movie.title} Cinema Stream</span>
          </button>
        </div>

        <UnifiedPlayer
          initialMode={playerMode}
          initialYouTubeUrl={movie.trailerUrl}
          movie={movie}
          embedUrl={activeStreamUrl}
          onModeChange={(m) => {
            if (m === 'stream') setPlayerMode('stream');
            else setPlayerMode(m);
          }}
        />
      </div>
    );
  }

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

        {/* Right Source Switcher & Mode Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {/* Multi-Server Stream Selector */}
          <div className="flex items-center gap-1 bg-black/65 backdrop-blur-xl p-1 rounded-full border border-white/20 text-[11px] font-bold text-white shadow-lg">
            <span className="text-slate-400 pl-2 pr-1 text-[10px] hidden sm:inline">Server:</span>
            <button
              onClick={() => {
                playGlassClick();
                setStreamServer('nxsha');
              }}
              className={`px-2.5 py-1 rounded-full transition ${
                streamServer === 'nxsha'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Server 1: nxsha.space (Default)"
            >
              Nxsha
            </button>
            <button
              onClick={() => {
                playGlassClick();
                setStreamServer('vidsrc');
              }}
              className={`px-2.5 py-1 rounded-full transition ${
                streamServer === 'vidsrc'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Server 2: VidSrc"
            >
              VidSrc
            </button>
            <button
              onClick={() => {
                playGlassClick();
                setStreamServer('autoembed');
              }}
              className={`px-2.5 py-1 rounded-full transition ${
                streamServer === 'autoembed'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Server 3: AutoEmbed"
            >
              AutoEmbed
            </button>
          </div>

          {/* Quick Switch to YouTube Button */}
          <button
            onClick={() => {
              playGlassClick();
              setPlayerMode('youtube');
            }}
            onMouseEnter={playGlassHover}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-bold border border-white/30 backdrop-blur-xl transition shadow-lg"
            title="Switch to YouTube Player (Instant Paste)"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">YouTube</span>
          </button>

          {/* Quick Switch to Local Video Button */}
          <button
            onClick={() => {
              playGlassClick();
              setPlayerMode('local');
            }}
            onMouseEnter={playGlassHover}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-bold border border-white/30 backdrop-blur-xl transition shadow-lg"
            title="Play Local Video File"
          >
            <FileVideo className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Local Video</span>
          </button>

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

      {/* Main Streaming Display (Iframe Embed) */}
      <div className="relative w-full h-full flex-1 bg-black">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white z-10">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">
              Connecting to {streamServer === 'nxsha' ? 'nxsha.space' : streamServer === 'vidsrc' ? 'vidsrc.to' : 'autoembed.cc'} stream...
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
                  playGlassClick();
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
