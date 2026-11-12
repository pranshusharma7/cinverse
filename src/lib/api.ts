import { Movie, ApiResponse } from './types';
import { INITIAL_MOVIES } from './mockData';

// High-speed client memory cache with 5-minute TTL
const clientCache = new Map<string, { timestamp: number; data: any }>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000;

function getFromCache(key: string) {
  const cached = clientCache.get(key);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setToCache(key: string, data: any) {
  clientCache.set(key, { timestamp: Date.now(), data });
}

export async function getMovies(params?: {
  category?: 'trending' | 'upcoming' | 'featured' | 'top_rated' | 'now_playing';
  type?: 'movie' | 'tv';
  genre?: string;
  year?: string;
  minRating?: number;
  sort?: string;
  page?: number;
}): Promise<ApiResponse<Movie[]>> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.genre && params.genre !== 'All') query.set('genre', params.genre);
  if (params?.year && params.year !== 'All') query.set('year', params.year);
  if (params?.minRating) query.set('minRating', params.minRating.toString());
  if (params?.sort) query.set('sort', params.sort);
  if (params?.page) query.set('page', params.page.toString());

  const cacheKey = `movies_${query.toString()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`/api/movies?${query.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    setToCache(cacheKey, data);
    return data;
  } catch (err) {
    let list = [...INITIAL_MOVIES];
    if (params?.category === 'trending') list = list.filter((m) => m.isTrending);
    if (params?.category === 'upcoming') list = list.filter((m) => m.isUpcoming);
    if (params?.category === 'top_rated') list = list.filter((m) => (m.rating || 0) >= 8.0);
    const fallback = { success: true, data: list, source: 'fallback-provider' as const };
    setToCache(cacheKey, fallback);
    return fallback;
  }
}

export async function getTVShows(params?: {
  category?: 'trending' | 'top_rated' | 'popular';
  page?: number;
}): Promise<ApiResponse<Movie[]>> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.page) query.set('page', params.page.toString());

  const cacheKey = `tv_${query.toString()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`/api/tv?${query.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    setToCache(cacheKey, data);
    return data;
  } catch (err) {
    const fallback = {
      success: true,
      data: INITIAL_MOVIES.filter((m) => m.type === 'tv'),
      source: 'fallback-provider' as const,
    };
    setToCache(cacheKey, fallback);
    return fallback;
  }
}

export async function getMovieDetails(
  id: string,
  type: 'movie' | 'tv' = 'movie'
): Promise<ApiResponse<Movie & { seasonsList?: any[]; similar?: Movie[] }>> {
  const cacheKey = `details_${id}_${type}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`/api/details?id=${encodeURIComponent(id)}&type=${type}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    setToCache(cacheKey, data);
    return data;
  } catch (err) {
    const movie = INITIAL_MOVIES.find((m) => m.id === id || String(m.tmdbId) === id) || INITIAL_MOVIES[0];
    const similar = INITIAL_MOVIES.filter((m) => m.id !== movie.id).slice(0, 6);
    const fallback = {
      success: true,
      data: { ...movie, similar },
      source: 'fallback-provider' as const,
    };
    setToCache(cacheKey, fallback);
    return fallback;
  }
}

export async function getTVSeasonEpisodes(id: string, seasonNumber = 1): Promise<{ success: boolean; data: any[] }> {
  const cacheKey = `episodes_${id}_${seasonNumber}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/details?id=${encodeURIComponent(id)}&type=tv&season=${seasonNumber}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    setToCache(cacheKey, data);
    return data;
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function getStreamUrl(
  id: string,
  type: 'movie' | 'tv' = 'movie',
  season = 1,
  episode = 1
): Promise<{
  success: boolean;
  available: boolean;
  embedUrl?: string;
  streamUrl?: string;
  format?: 'hls' | 'mp4' | 'dash' | 'embed';
  message?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `/api/stream?id=${encodeURIComponent(id)}&type=${type}&season=${season}&episode=${episode}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    const movie = INITIAL_MOVIES.find((m) => m.id === id || String(m.tmdbId) === id);
    const tmdbId = movie?.tmdbId || 550;
    const embedUrl = type === 'tv'
      ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?color=green`
      : `https://nxsha.space/embed/movie/${tmdbId}?color=green`;

    return {
      success: true,
      available: true,
      embedUrl,
      format: 'embed',
    };
  }
}

export async function searchMovies(query: string): Promise<ApiResponse<Movie[]>> {
  if (!query.trim()) {
    return { success: true, data: INITIAL_MOVIES.slice(0, 10), source: 'fallback-provider' };
  }

  const cacheKey = `search_${query.toLowerCase().trim()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    setToCache(cacheKey, data);
    return data;
  } catch {
    const matches = INITIAL_MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genres.some((g) => g.toLowerCase().includes(query.toLowerCase()))
    );
    return { success: true, data: matches, source: 'fallback-provider' };
  }
}

export async function getAnime(params?: {
  q?: string;
  page?: number;
  perPage?: number;
}): Promise<ApiResponse<Movie[]> & { hasNextPage?: boolean }> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.perPage) query.set('perPage', params.perPage.toString());

  const cacheKey = `anime_${query.toString()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`/api/anime?${query.toString()}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    setToCache(cacheKey, data);
    return data;
  } catch {
    const fallback = {
      success: true,
      data: INITIAL_MOVIES.filter((m) => m.genres?.includes('Animation')),
      source: 'fallback-provider' as const,
    };
    setToCache(cacheKey, fallback);
    return fallback;
  }
}
