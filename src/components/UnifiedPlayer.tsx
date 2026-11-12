'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Youtube,
  FileVideo,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  PictureInPicture2,
  Tv,
  Upload,
  FolderUp,
  ClipboardPaste,
  Check,
  AlertCircle,
  Sparkles,
  Repeat,
  Sliders,
  Film,
  X,
  History,
  Subtitles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  PRESET_YOUTUBE_TRAILERS,
  formatBytes,
  formatSeconds,
  PresetTrailer,
} from '@/utils/youtube';
import { playGlassClick, playGlassHover } from '@/lib/sound';
import { Movie } from '@/lib/types';

export type PlayerMode = 'youtube' | 'local' | 'stream';

export interface UnifiedPlayerProps {
  initialMode?: PlayerMode;
  initialYouTubeUrl?: string;
  movie?: Movie;
  embedUrl?: string;
  onModeChange?: (mode: PlayerMode) => void;
  className?: string;
}

interface LocalFileMeta {
  name: string;
  size: number;
  type: string;
  resolution?: string;
}

interface RecentVideo {
  id: string;
  videoId: string;
  title: string;
  timestamp: number;
}

const STORAGE_RECENT_YT_KEY = 'cineverse_recent_yt';

export const UnifiedPlayer: React.FC<UnifiedPlayerProps> = ({
  initialMode = 'youtube',
  initialYouTubeUrl,
  movie,
  embedUrl,
  onModeChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Player Mode
  const [mode, setMode] = useState<PlayerMode>(
    movie && !initialYouTubeUrl ? 'stream' : initialMode
  );

  // YouTube State
  const defaultYt = initialYouTubeUrl ? extractYouTubeId(initialYouTubeUrl)?.videoId : null;
  const [ytInput, setYtInput] = useState<string>(initialYouTubeUrl || '');
  const [activeYtId, setActiveYtId] = useState<string>(
    defaultYt || PRESET_YOUTUBE_TRAILERS[0].videoId
  );
  const [ytStartTime, setYtStartTime] = useState<number | undefined>(undefined);
  const [ytStatusMessage, setYtStatusMessage] = useState<string | null>(null);
  const [recentYtVideos, setRecentYtVideos] = useState<RecentVideo[]>([]);
  const [showRecentMenu, setShowRecentMenu] = useState(false);

  // Local Video State
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [localMeta, setLocalMeta] = useState<LocalFileMeta | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [subtitleName, setSubtitleName] = useState<string | null>(null);

  // Player Controls State (for Local Video)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  // Shared Display State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Load recent YT history from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_RECENT_YT_KEY);
      if (stored) {
        setRecentYtVideos(JSON.parse(stored));
      }
      const pendingUrl = sessionStorage.getItem('cinverse_local_video_url');
      const pendingName = sessionStorage.getItem('cinverse_local_video_name');
      if (pendingUrl) {
        setLocalVideoUrl(pendingUrl);
        setLocalMeta({
          name: pendingName || 'Local Video File',
          size: 0,
          type: 'video/mp4',
        });
        setMode('local');
        sessionStorage.removeItem('cinverse_local_video_url');
        sessionStorage.removeItem('cinverse_local_video_name');
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  // Save to recent YT history
  const saveToRecentYt = useCallback((videoId: string, title?: string) => {
    if (typeof window === 'undefined') return;
    try {
      const item: RecentVideo = {
        id: `${videoId}-${Date.now()}`,
        videoId,
        title: title || `YouTube Video (${videoId})`,
        timestamp: Date.now(),
      };
      setRecentYtVideos((prev) => {
        const filtered = prev.filter((v) => v.videoId !== videoId);
        const updated = [item, ...filtered].slice(0, 8);
        localStorage.setItem(STORAGE_RECENT_YT_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore storage write error
    }
  }, []);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (localVideoUrl && localVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localVideoUrl);
      }
      if (subtitleUrl && subtitleUrl.startsWith('blob:')) {
        URL.revokeObjectURL(subtitleUrl);
      }
    };
  }, [localVideoUrl, subtitleUrl]);

  // Mode change handler
  const switchMode = (newMode: PlayerMode) => {
    playGlassClick();
    setMode(newMode);
    onModeChange?.(newMode);

    // If switching away from local video, pause it
    if (newMode !== 'local' && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // --------------------------------------------------------
  // INSTANT YOUTUBE PASTE & PLAY LOGIC
  // --------------------------------------------------------
  const playYouTubeVideo = useCallback(
    (videoId: string, startTime?: number, customTitle?: string) => {
      setActiveYtId(videoId);
      setYtStartTime(startTime);
      setMode('youtube');
      onModeChange?.('youtube');

      // Pause local video if playing
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }

      // Flash feedback message
      setYtStatusMessage('Playing YouTube video instantly');
      setTimeout(() => setYtStatusMessage(null), 3500);

      saveToRecentYt(videoId, customTitle);
      playGlassClick();
    },
    [onModeChange, saveToRecentYt]
  );

  const handleYouTubeUrl = useCallback(
    (rawUrl: string, autoPlay: boolean = true) => {
      const parsed = extractYouTubeId(rawUrl);
      if (parsed) {
        playYouTubeVideo(parsed.videoId, parsed.startTime);
        return true;
      }
      return false;
    },
    [playYouTubeVideo]
  );

  // Paste Event Handler (Fires immediately upon pasting into input)
  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      const success = handleYouTubeUrl(pastedText, true);
      if (success) {
        setYtInput(pastedText);
      }
    }
  };

  // Change Event Handler (Also catches autofills or programmatic pastes)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYtInput(val);
    if (val.trim()) {
      handleYouTubeUrl(val, true);
    }
  };

  // 1-Click "Paste from Clipboard" Button
  const handleClipboardPasteClick = async () => {
    try {
      playGlassClick();
      if (!navigator.clipboard?.readText) {
        alert('Please paste the YouTube URL directly into the input bar.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        setYtInput(text);
        const success = handleYouTubeUrl(text, true);
        if (success) {
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 2000);
        } else {
          setYtStatusMessage('No valid YouTube URL found in clipboard');
          setTimeout(() => setYtStatusMessage(null), 3000);
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
      setYtStatusMessage('Clipboard permission blocked. Paste manually.');
      setTimeout(() => setYtStatusMessage(null), 3000);
    }
  };

  // --------------------------------------------------------
  // LOCAL VIDEO FILE HANDLERS
  // --------------------------------------------------------
  const loadLocalFile = useCallback((file: File) => {
    if (!file) return;

    // Check if it's a video file or common video extension
    const isVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|webm|mkv|mov|avi|m4v|ogv)$/i.test(file.name);

    if (!isVideo) {
      alert('Please select a valid video file (MP4, WebM, MKV, MOV, etc.).');
      return;
    }

    // Revoke previous object URL if any
    if (localVideoUrl && localVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localVideoUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalVideoUrl(objectUrl);
    setLocalMeta({
      name: file.name,
      size: file.size,
      type: file.type || 'video/*',
    });
    setMode('local');
    onModeChange?.('local');
    playGlassClick();

    // Auto-play local video
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => {
          console.log('Autoplay prevented by browser, waiting for user gesture:', err);
        });
      }
    }, 150);
  }, [localVideoUrl, onModeChange]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadLocalFile(file);
    }
    // reset input value so re-selecting the same file works
    e.target.value = '';
  };

  const handleSubtitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (subtitleUrl && subtitleUrl.startsWith('blob:')) {
        URL.revokeObjectURL(subtitleUrl);
      }
      const sUrl = URL.createObjectURL(file);
      setSubtitleUrl(sUrl);
      setSubtitleName(file.name);
      playGlassClick();
    }
    e.target.value = '';
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      loadLocalFile(file);
    }
  };

  // --------------------------------------------------------
  // LOCAL VIDEO CONTROLS
  // --------------------------------------------------------
  const togglePlay = () => {
    playGlassClick();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds: number) => {
    playGlassClick();
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
    );
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    playGlassClick();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.8);
      videoRef.current.volume = 0.8;
    }
  };

  const handlePlaybackRate = (rate: number) => {
    playGlassClick();
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setSpeedMenuOpen(false);
  };

  const toggleLoop = () => {
    playGlassClick();
    const next = !isLooping;
    setIsLooping(next);
    if (videoRef.current) {
      videoRef.current.loop = next;
    }
  };

  const togglePiP = async () => {
    playGlassClick();
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported or failed:', err);
    }
  };

  // Progress Bar Seek
  const handleProgressSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressTrackRef.current || !videoRef.current || !duration) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressTrackRef.current || !duration) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setHoverSeekTime(ratio * duration);
    setHoverSeekPos(clickX);
  };

  // Video Element Events
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Buffer calculation
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(
        videoRef.current.buffered.length - 1
      );
      setBufferedTime(bufferedEnd);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    if (localMeta && videoRef.current.videoWidth) {
      setLocalMeta((prev) =>
        prev
          ? {
              ...prev,
              resolution: `${videoRef.current?.videoWidth} × ${videoRef.current?.videoHeight}`,
            }
          : prev
      );
    }
  };

  // Auto-hide controls during video playback on idle
  const handleMouseMoveOverPlayer = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying && mode === 'local') {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Fullscreen & Theatre
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

  // Global Keyboard Shortcuts (Space, F, T, M, Arrows) when local player is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing into an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (mode === 'local') {
          e.preventDefault();
          togglePlay();
        }
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheatre();
      } else if (e.key.toLowerCase() === 'm') {
        if (mode === 'local') {
          e.preventDefault();
          toggleMute();
        }
      } else if (e.key === 'ArrowLeft') {
        if (mode === 'local') {
          e.preventDefault();
          seekRelative(-5);
        }
      } else if (e.key === 'ArrowRight') {
        if (mode === 'local') {
          e.preventDefault();
          seekRelative(5);
        }
      } else if (e.key === 'ArrowUp') {
        if (mode === 'local') {
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
        }
      } else if (e.key === 'ArrowDown') {
        if (mode === 'local') {
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, volume, isMuted, isPlaying]);

  // Listen for fullscreenchange
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Compute YouTube Embed URL with autoplay
  const currentYtEmbedUrl = getYouTubeEmbedUrl(activeYtId, ytStartTime, true);

  return (
    <div className={`w-full flex flex-col gap-4 select-none ${className}`}>
      {/* ========================================================
          TOP UNIFIED CONTROL BAR: TABS & SMART INSTANT INPUT
      ======================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl liquid-glass-panel border-white shadow-lg">
        {/* Left: Mode Segmented Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/5 backdrop-blur-md border border-white/60 self-start sm:self-auto overflow-x-auto max-w-full">
          {/* YouTube Mode Tab */}
          <button
            onClick={() => switchMode('youtube')}
            onMouseEnter={playGlassHover}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'youtube'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
            }`}
          >
            <Youtube className="w-4 h-4" />
            <span>YouTube Player</span>
          </button>

          {/* Local Video Mode Tab */}
          <button
            onClick={() => switchMode('local')}
            onMouseEnter={playGlassHover}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'local'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
            }`}
          >
            <FileVideo className="w-4 h-4" />
            <span>Local Video</span>
            {localMeta && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Stream Movie Tab (If provided by watch page) */}
          {movie && (
            <button
              onClick={() => switchMode('stream')}
              onMouseEnter={playGlassHover}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'stream'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Cinéverse Stream</span>
            </button>
          )}
        </div>

        {/* Center / Right: Dynamic Input Bar (Instant YouTube Paste or Browse Local) */}
        <div className="flex-1 flex items-center gap-2.5 max-w-2xl">
          {mode === 'youtube' ? (
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={ytInput}
                onChange={handleInputChange}
                onPaste={handlePasteEvent}
                placeholder="Paste YouTube link here to play instantly (e.g. https://youtu.be/...)"
                className="w-full pl-10 pr-24 py-2 rounded-2xl bg-white/90 border border-white/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition outline-none"
              />
              <Youtube className="w-4 h-4 text-rose-500 absolute left-3.5 pointer-events-none" />

              {/* Paste from Clipboard Button inside input */}
              <div className="absolute right-1.5 flex items-center gap-1">
                {ytInput && (
                  <button
                    onClick={() => {
                      setYtInput('');
                      playGlassClick();
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleClipboardPasteClick}
                  onMouseEnter={playGlassHover}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-[11px] font-bold transition shadow-2xs"
                  title="Paste from clipboard and play"
                >
                  {copiedSuccess ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ClipboardPaste className="w-3 h-3" />
                  )}
                  <span>{copiedSuccess ? 'Pasted!' : 'Paste'}</span>
                </button>
              </div>
            </div>
          ) : mode === 'local' ? (
            <div className="flex-1 flex items-center gap-2">
              <button
                onClick={() => {
                  playGlassClick();
                  fileInputRef.current?.click();
                }}
                onMouseEnter={playGlassHover}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
              >
                <FolderUp className="w-4 h-4" />
                <span>Choose Local Video</span>
              </button>

              <button
                onClick={() => {
                  playGlassClick();
                  subtitleInputRef.current?.click();
                }}
                onMouseEnter={playGlassHover}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-white text-xs font-bold transition shadow-xs"
                title="Load Subtitle (.vtt / .srt)"
              >
                <Subtitles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">
                  {subtitleName ? 'Subtitles Loaded' : 'Add Subtitles'}
                </span>
              </button>

              {localMeta && (
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-white/70 px-3 py-1.5 rounded-2xl border border-white">
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">
                    {localMeta.name}
                  </span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md font-semibold">
                    {formatBytes(localMeta.size)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-3 py-2 rounded-2xl border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Playing official Cineverse stream for {movie?.title}</span>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mkv,.mp4,.webm,.mov,.avi,.m4v"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <input
            ref={subtitleInputRef}
            type="file"
            accept=".vtt,.srt"
            className="hidden"
            onChange={handleSubtitleInputChange}
          />

          {/* Window / Theatre Mode Toggle */}
          <button
            onClick={toggleTheatre}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 border border-white transition shadow-sm"
            title="Theatre Mode (T)"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 border border-white transition shadow-sm"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Instant Feedback Toast */}
      <AnimatePresence>
        {ytStatusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 self-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{ytStatusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          MAIN SCREEN CONTAINER (YouTube, Local Video, or Stream)
      ======================================================== */}
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseMove={handleMouseMoveOverPlayer}
        className={`relative rounded-3xl overflow-hidden bg-black border-2 border-white shadow-2xl transition-all duration-500 group select-none flex flex-col ${
          isTheatreMode ? 'w-full aspect-[21/9] max-h-[88vh]' : 'w-full aspect-video'
        }`}
      >
        {/* DRAG AND DROP OVERLAY (when dragging video files) */}
        {isDraggingFile && (
          <div className="absolute inset-0 z-50 bg-indigo-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-white border-4 border-dashed border-indigo-400 p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/30 flex items-center justify-center border border-indigo-300">
              <Upload className="w-8 h-8 text-indigo-300 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-black">Drop Video File to Play</h3>
              <p className="text-xs text-indigo-200 font-medium mt-1">
                Supports MP4, WebM, MKV, MOV, and common browser-supported video formats
              </p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODE 1: YOUTUBE PLAYER SCREEN
        ---------------------------------------------------- */}
        {mode === 'youtube' && (
          <div className="relative w-full h-full flex-1 bg-black">
            <iframe
              key={activeYtId + (ytStartTime || 0)}
              src={currentYtEmbedUrl}
              title="YouTube Player"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        {/* ----------------------------------------------------
            MODE 2: LOCAL VIDEO PLAYER SCREEN (HTML5 + Custom Controls)
        ---------------------------------------------------- */}
        {mode === 'local' && (
          <div className="relative w-full h-full flex-1 bg-black flex items-center justify-center overflow-hidden">
            {localVideoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={localVideoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                  playsInline
                >
                  {subtitleUrl && (
                    <track
                      kind="subtitles"
                      src={subtitleUrl}
                      srcLang="en"
                      label={subtitleName || 'Subtitles'}
                      default
                    />
                  )}
                </video>

                {/* Big Center Play / Pause Indicator on Click */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition pointer-events-auto"
                    >
                      <Play className="w-10 h-10 ml-1 fill-white" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Top Badge: File Meta */}
                <div
                  className={`absolute top-4 left-4 z-30 transition-opacity duration-300 ${
                    showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 text-white text-xs shadow-lg">
                    <FileVideo className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold truncate max-w-[200px] sm:max-w-md">
                      {localMeta?.name || 'Local Video'}
                    </span>
                    {localMeta?.resolution && (
                      <span className="text-[10px] bg-indigo-500/80 px-2 py-0.5 rounded-md font-bold">
                        {localMeta.resolution}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Custom Fluid Liquid Glass Controls Bar */}
                <div
                  className={`absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
                    showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Timeline Scrubber */}
                  <div
                    ref={progressTrackRef}
                    onClick={handleProgressSeek}
                    onMouseMove={handleProgressMouseMove}
                    onMouseLeave={() => setHoverSeekTime(null)}
                    className="relative w-full h-2 hover:h-3 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition-all flex items-center"
                  >
                    {/* Buffered bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full"
                      style={{
                        width: `${duration ? (bufferedTime / duration) * 100 : 0}%`,
                      }}
                    />
                    {/* Played bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full relative"
                      style={{
                        width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                    </div>

                    {/* Hover Timestamp Tooltip */}
                    {hoverSeekTime !== null && (
                      <div
                        className="absolute -top-7 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none shadow-md border border-white/20 whitespace-nowrap"
                        style={{ left: `${hoverSeekPos}px` }}
                      >
                        {formatSeconds(hoverSeekTime)}
                      </div>
                    )}
                  </div>

                  {/* Buttons Row */}
                  <div className="flex items-center justify-between text-white text-xs pt-1">
                    {/* Left: Play/Pause, Seek, Volume, Time */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="p-1.5 rounded-xl hover:bg-white/20 transition text-white"
                        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white" />
                        )}
                      </button>

                      <button
                        onClick={() => seekRelative(-10)}
                        className="p-1 rounded-xl hover:bg-white/20 transition text-white/80 hover:text-white"
                        title="Seek backward 10s (←)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1.5 group/vol">
                        <button
                          onClick={toggleMute}
                          className="p-1 rounded-xl hover:bg-white/20 transition text-white/80 hover:text-white"
                          title="Mute/Unmute (M)"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                        />
                      </div>

                      {/* Time Display */}
                      <span className="text-[11px] font-mono font-medium text-slate-300">
                        {formatSeconds(currentTime)} / {formatSeconds(duration)}
                      </span>
                    </div>

                    {/* Right: Speed, Loop, PiP, Fullscreen */}
                    <div className="flex items-center gap-2">
                      {/* Playback Speed Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setSpeedMenuOpen((prev) => !prev)}
                          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition"
                          title="Playback Speed"
                        >
                          {playbackRate}x
                        </button>

                        {speedMenuOpen && (
                          <div className="absolute bottom-full right-0 mb-2 p-1.5 rounded-xl bg-slate-900/95 border border-white/20 backdrop-blur-xl shadow-xl flex flex-col gap-1 z-40 min-w-[70px]">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                              <button
                                key={r}
                                onClick={() => handlePlaybackRate(r)}
                                className={`px-2 py-1 rounded text-[11px] font-bold text-left transition ${
                                  playbackRate === r
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {r}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Loop Toggle */}
                      <button
                        onClick={toggleLoop}
                        className={`p-1.5 rounded-xl transition ${
                          isLooping
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-white/20 text-white/70 hover:text-white'
                        }`}
                        title="Repeat Video"
                      >
                        <Repeat className="w-4 h-4" />
                      </button>

                      {/* PiP */}
                      <button
                        onClick={togglePiP}
                        className="p-1.5 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition"
                        title="Picture in Picture"
                      >
                        <PictureInPicture2 className="w-4 h-4" />
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition"
                        title="Fullscreen (F)"
                      >
                        {isFullscreen ? (
                          <Minimize className="w-4 h-4" />
                        ) : (
                          <Maximize className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* EMPTY DROPZONE STATE FOR LOCAL VIDEO */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-white/[0.02] transition"
              >
                <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border-2 border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-xl mb-4 group-hover:scale-105 transition-transform">
                  <FolderUp className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Choose a Local Video File or Drag & Drop Here
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Play any high-definition video directly from your device with spatial audio & liquid-glass controls. 100% private in browser.
                </p>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            MODE 3: OFFICIAL MOVIE STREAM (nxsha / TMDB Embed)
        ---------------------------------------------------- */}
        {mode === 'stream' && movie && (
          <div className="relative w-full h-full flex-1 bg-black">
            <iframe
              src={
                embedUrl ||
                (movie.tmdbId
                  ? `https://nxsha.space/embed/movie/${movie.tmdbId}?color=green`
                  : 'https://nxsha.space/embed/movie/550?color=green')
              }
              title={`${movie.title} - nxsha stream`}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* ========================================================
          BOTTOM QUICK PICKS & RECENT HISTORY BAR
      ======================================================== */}
      <div className="p-4 rounded-3xl liquid-glass-panel border-white shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-800">
              Instant 4K YouTube Quick Picks:
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (Click any trailer to test instant playback)
            </span>
          </div>

          {recentYtVideos.length > 0 && (
            <button
              onClick={() => setShowRecentMenu((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              <History className="w-3.5 h-3.5" />
              <span>Recent Videos ({recentYtVideos.length})</span>
            </button>
          )}
        </div>

        {/* Trailer Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PRESET_YOUTUBE_TRAILERS.map((trailer) => {
            const isActive = mode === 'youtube' && activeYtId === trailer.videoId;
            return (
              <button
                key={trailer.id}
                onClick={() => playYouTubeVideo(trailer.videoId, undefined, trailer.title)}
                onMouseEnter={playGlassHover}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                    : 'bg-white/60 hover:bg-white text-slate-700 border-white/80 hover:border-white shadow-2xs'
                }`}
              >
                <Youtube className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>{trailer.title}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                  {trailer.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recent Pasted Videos Drawer */}
        {showRecentMenu && recentYtVideos.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Your Recently Pasted YouTube Links:</span>
              <button
                onClick={() => {
                  setRecentYtVideos([]);
                  localStorage.removeItem(STORAGE_RECENT_YT_KEY);
                }}
                className="text-[11px] text-rose-600 hover:underline"
              >
                Clear History
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {recentYtVideos.map((item) => (
                <button
                  key={item.id}
                  onClick={() => playYouTubeVideo(item.videoId, undefined, item.title)}
                  className="px-3 py-1 rounded-xl bg-white/80 hover:bg-white border border-white text-xs font-medium text-slate-800 transition truncate max-w-[220px]"
                >
                  ▶ {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

