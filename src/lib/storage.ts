'use client';

import { ContinueWatchingItem, GuestPreferences, Movie, PlaylistItem } from './types';
import { INITIAL_CONTINUE_WATCHING } from './mockData';

const STORAGE_KEYS = {
  PLAYLIST: 'cineverse_playlist',
  CONTINUE_WATCHING: 'cineverse_continue_watching',
  PREFERENCES: 'cineverse_preferences',
  RECENT_SEARCHES: 'cineverse_recent_searches',
};

const DEFAULT_PREFERENCES: GuestPreferences = {
  themeMode: 'daylight',
  themeBackground: 'frosted-glass',
  accentColor: 'blue',
  ambientGlow: true,
  autoPlayHero: true,
  soundEffects: false,
  reduceMotion: false,
};

// Custom browser event for cross-component reactive updates
export const emitStorageEvent = (
  eventType: 'playlist_changed' | 'progress_updated' | 'preferences_changed' | 'theme_changed' | 'hero_color_changed',
  detail?: any
) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventType, { detail }));
  }
};

export const getThemeMode = (): 'obsidian' | 'daylight' => {
  return 'daylight';
};

export const setThemeMode = (_mode: 'obsidian' | 'daylight') => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cineverse_theme_mode', 'daylight');
    savePreferences({ themeMode: 'daylight' });
    emitStorageEvent('theme_changed', 'daylight');
  } catch (err) {
    console.error('Failed to set theme mode:', err);
  }
};

export const toggleThemeMode = (): 'obsidian' | 'daylight' => {
  setThemeMode('daylight');
  return 'daylight';
};

export const getStoredPreferences = (): GuestPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return item ? { ...DEFAULT_PREFERENCES, ...JSON.parse(item) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const savePreferences = (prefs: Partial<GuestPreferences>) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    emitStorageEvent('preferences_changed');
  } catch (err) {
    console.error('Failed to save preferences:', err);
  }
};

export const getPlaylist = (): PlaylistItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(STORAGE_KEYS.PLAYLIST);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

export const isInPlaylist = (movieId: string): boolean => {
  const list = getPlaylist();
  return list.some((item) => item.movieId === movieId);
};

export const addToPlaylist = (movie: Movie, category: 'favorite' | 'watchlist' | 'watched' = 'watchlist') => {
  if (typeof window === 'undefined') return;
  try {
    const current = getPlaylist();
    const filtered = current.filter((item) => item.movieId !== movie.id);
    filtered.unshift({
      movieId: movie.id,
      movie,
      addedAt: Date.now(),
      category,
    });
    localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(filtered));
    emitStorageEvent('playlist_changed');
  } catch (err) {
    console.error('Failed to add to playlist:', err);
  }
};

export const removeFromPlaylist = (movieId: string) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getPlaylist();
    const filtered = current.filter((item) => item.movieId !== movieId);
    localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(filtered));
    emitStorageEvent('playlist_changed');
  } catch (err) {
    console.error('Failed to remove from playlist:', err);
  }
};

export const getContinueWatching = (): ContinueWatchingItem[] => {
  if (typeof window === 'undefined') return INITIAL_CONTINUE_WATCHING;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CONTINUE_WATCHING);
    if (!item) {
      localStorage.setItem(STORAGE_KEYS.CONTINUE_WATCHING, JSON.stringify(INITIAL_CONTINUE_WATCHING));
      return INITIAL_CONTINUE_WATCHING;
    }
    return JSON.parse(item);
  } catch {
    return INITIAL_CONTINUE_WATCHING;
  }
};

export const updateWatchProgress = (
  movie: { id: string; title: string; posterUrl?: string; backdropUrl?: string; streamUrl?: string },
  progressSeconds: number,
  durationSeconds: number
) => {
  if (typeof window === 'undefined' || !movie.id) return;
  try {
    const items = getContinueWatching();
    const remaining = Math.max(0, durationSeconds - progressSeconds);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    const remainingText = `${mins} Min ${secs} Sec`;

    const updatedItem: ContinueWatchingItem = {
      id: movie.id,
      title: movie.title,
      thumbnailUrl: movie.backdropUrl || movie.posterUrl || '',
      durationSeconds,
      progressSeconds,
      remainingTimeText: remainingText,
      lastWatched: Date.now(),
      streamUrl: movie.streamUrl,
    };

    const remainingItems = items.filter((item) => item.id !== movie.id);
    const finalItems = [updatedItem, ...remainingItems].slice(0, 8); // keep last 8
    localStorage.setItem(STORAGE_KEYS.CONTINUE_WATCHING, JSON.stringify(finalItems));
    emitStorageEvent('progress_updated');
  } catch (err) {
    console.error('Failed to update watch progress:', err);
  }
};

export const getSavedMovieProgress = (movieId: string): number => {
  const items = getContinueWatching();
  const match = items.find((i) => i.id === movieId);
  return match?.progressSeconds || 0;
};

