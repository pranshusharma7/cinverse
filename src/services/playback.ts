import { Movie } from '@/lib/types';
import { resolveMediaIdentifier } from './mediaResolver';

export interface PlaybackConfig {
  enabled: boolean;
  baseUrl: string;
  themeColor: string;
}

export function checkPlaybackConfiguration(): PlaybackConfig {
  const enabledEnv = process.env.NXSHA_PLAYBACK_ENABLED ?? process.env.NEXT_PUBLIC_NXSHA_PLAYBACK_ENABLED;
  // Default to enabled if set to 'true' or not explicitly disabled
  const enabled = enabledEnv !== 'false';
  const baseUrl = process.env.NXSHA_BASE_URL || 'https://nxsha.space/embed';
  const themeColor = process.env.NXSHA_THEME_COLOR || 'green';

  return {
    enabled,
    baseUrl,
    themeColor,
  };
}

/**
 * Generates dynamic authorized Movie playback URL
 */
export async function getMoviePlaybackUrl(movie: Movie): Promise<{
  url: string | null;
  available: boolean;
  message?: string;
}> {
  const config = checkPlaybackConfiguration();
  if (!config.enabled) {
    return {
      url: null,
      available: false,
      message: 'Playback provider is currently disabled by configuration.',
    };
  }

  // 1. Direct verified TMDb ID
  let tmdbId = movie.tmdbId;

  // 2. If it's an anime or missing direct TMDb ID, resolve via mediaResolver
  if (!tmdbId) {
    const resolved = await resolveMediaIdentifier({
      title: movie.title,
      originalTitle: movie.originalTitle,
      releaseYear: movie.releaseYear,
      format: 'movie',
    });
    if (resolved.verified && resolved.tmdbId) {
      tmdbId = resolved.tmdbId;
    }
  }

  if (!tmdbId) {
    return {
      url: null,
      available: false,
      message: 'No verified TMDb identifier could be matched for this title.',
    };
  }

  const url = `${config.baseUrl}/movie/${tmdbId}?color=${config.themeColor}`;
  return {
    url,
    available: true,
  };
}

/**
 * Generates dynamic authorized TV Series episode playback URL
 */
export async function getTVPlaybackUrl(
  show: Movie,
  season = 1,
  episode = 1
): Promise<{
  url: string | null;
  available: boolean;
  message?: string;
}> {
  const config = checkPlaybackConfiguration();
  if (!config.enabled) {
    return {
      url: null,
      available: false,
      message: 'Playback provider is currently disabled by configuration.',
    };
  }

  let tmdbId = show.tmdbId;

  if (!tmdbId) {
    const resolved = await resolveMediaIdentifier({
      title: show.title,
      originalTitle: show.originalTitle,
      releaseYear: show.releaseYear,
      format: 'tv',
    });
    if (resolved.verified && resolved.tmdbId) {
      tmdbId = resolved.tmdbId;
    }
  }

  if (!tmdbId) {
    return {
      url: null,
      available: false,
      message: 'No verified TMDb identifier could be matched for this TV series.',
    };
  }

  const url = `${config.baseUrl}/tv/${tmdbId}/${season}/${episode}?color=${config.themeColor}`;
  return {
    url,
    available: true,
  };
}

