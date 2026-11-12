export type MediaType = 'movie' | 'tv';

export interface CastMember {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface SubtitleTrack {
  label: string;
  language: string;
  src: string;
}

export interface AudioTrack {
  label: string;
  language: string;
}

export interface Movie {
  id: string;
  tmdbId?: number | string;
  aniListId?: number | string;
  title: string;
  originalTitle?: string;
  overview: string;
  backdropUrl: string;
  posterUrl: string;
  genres: string[];
  releaseYear: number;
  releaseDate: string;
  rating: number; // e.g. 8.4
  runtime: string; // e.g. "2h 29m"
  durationSeconds?: number;
  type: MediaType;
  seasons?: number;
  episodes?: number;
  cast?: CastMember[];
  director?: string;
  trailerUrl?: string;
  streamUrl?: string;
  embedUrl?: string;
  streamFormat?: 'hls' | 'mp4' | 'dash' | 'embed';
  availableQualities?: string[];
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  isTrending?: boolean;
  isUpcoming?: boolean;
  isFeatured?: boolean;
  isTopRated?: boolean;
  voteCount?: number;
}

export interface ContinueWatchingItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  progressSeconds: number;
  remainingTimeText: string;
  episodeText?: string;
  lastWatched: number;
  streamUrl?: string;
}

export interface PlaylistItem {
  movieId: string;
  movie: Movie;
  addedAt: number;
  category: 'favorite' | 'watchlist' | 'watched';
}

export interface GuestPreferences {
  themeMode?: 'obsidian' | 'daylight';
  themeBackground: 'luxury-interior' | 'cosmic-aurora' | 'cyber-neon' | 'midnight-minimal' | 'obsidian-cinema' | 'frosted-glass';
  accentColor: 'blue' | 'purple' | 'cyan' | 'pink' | 'rose';
  ambientGlow: boolean;
  autoPlayHero: boolean;
  soundEffects: boolean;
  reduceMotion: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  page?: number;
  message?: string;
  source?: 'external-api' | 'fallback-provider';
}

