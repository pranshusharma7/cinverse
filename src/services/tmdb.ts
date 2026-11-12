import { Movie } from '@/lib/types';
import { normalizeTmdbMovie, normalizeTmdbTV } from '@/utils/mediaMapper';
import { INITIAL_MOVIES } from '@/lib/mockData';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// In-memory response cache with 15 minute TTL for blazing-fast responses
const apiCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key: string) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function setCached(key: string, data: any) {
  apiCache.set(key, { timestamp: Date.now(), data });
}

export function getTmdbAuth(): { key?: string; token?: string; isConfigured: boolean } {
  const token = process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_READ_ACCESS_TOKEN;
  const key =
    process.env.TMDB_API_KEY ||
    process.env.NEXT_PUBLIC_TMDB_API_KEY ||
    '4e44d9029b1270a757cddc766a1bcb63';
  return {
    key,
    token,
    isConfigured: Boolean(token || key),
  };
}

let tmdbCooldownUntil = 0;

async function tmdbFetch(endpoint: string, params: Record<string, string | number> = {}) {
  const { key, token, isConfigured } = getTmdbAuth();
  if (!isConfigured) {
    return null;
  }

  // If TMDb recently failed or timed out, avoid hanging future requests
  if (Date.now() < tmdbCooldownUntil) {
    return null;
  }

  const query = new URLSearchParams();
  if (key) {
    query.set('api_key', key);
  }
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.set(k, String(v));
    }
  });

  const fullUrl = `${TMDB_BASE_URL}${endpoint}?${query.toString()}`;
  const cacheKey = fullUrl;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout to prevent lag

    const res = await fetch(fullUrl, {
      headers,
      signal: controller.signal,
      next: { revalidate: 300 }, // Next.js 14 caching
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`TMDb API Error: ${res.status} ${res.statusText} for ${endpoint}`);
      if (res.status === 401 || res.status === 403) {
        // Bad API key, cool down for 5 minutes
        tmdbCooldownUntil = Date.now() + 5 * 60 * 1000;
      }
      return null;
    }

    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  } catch (err: any) {
    console.warn(`TMDb fetch exception for ${endpoint}:`, err?.message || err);
    return null;
  }
}

/**
 * Universal Trending (Movies + TV)
 */
export async function getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day', page = 1) {
  const data = await tmdbFetch(`/trending/${mediaType}/${timeWindow}`, { page });
  if (data?.results) {
    const movies = data.results.map((item: any) =>
      item.media_type === 'tv' ? normalizeTmdbTV(item) : normalizeTmdbMovie(item)
    );
    return { data: movies, totalPages: data.total_pages, totalResults: data.total_results };
  }
  return { data: INITIAL_MOVIES.filter((m) => m.isTrending), totalPages: 1, totalResults: INITIAL_MOVIES.length };
}

/**
 * Popular Movies
 */
export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch('/movie/popular', { page });
  if (data?.results) {
    const movies = data.results.map(normalizeTmdbMovie);
    return { data: movies, totalPages: data.total_pages, totalResults: data.total_results };
  }
  return { data: INITIAL_MOVIES.filter((m) => m.type === 'movie'), totalPages: 1, totalResults: INITIAL_MOVIES.length };
}

/**
 * Top Rated Movies
 */
export async function getTopRatedMovies(page = 1) {
  const data = await tmdbFetch('/movie/top_rated', { page });
  if (data?.results) {
    const movies = data.results.map(normalizeTmdbMovie);
    return { data: movies, totalPages: data.total_pages, totalResults: data.total_results };
  }
  return { data: INITIAL_MOVIES.filter((m) => m.isTopRated), totalPages: 1, totalResults: INITIAL_MOVIES.length };
}

/**
 * Upcoming Movies
 */
export async function getUpcomingMovies(page = 1) {
  const data = await tmdbFetch('/movie/upcoming', { page });
  if (data?.results) {
    const movies = data.results.map((item: any) => ({ ...normalizeTmdbMovie(item), isUpcoming: true }));
    return { data: movies, totalPages: data.total_pages, totalResults: data.total_results };
  }
  return { data: INITIAL_MOVIES.filter((m) => m.isUpcoming), totalPages: 1, totalResults: INITIAL_MOVIES.length };
}

/**
 * Now Playing in Theaters
 */
export async function getNowPlayingMovies(page = 1) {
  const data = await tmdbFetch('/movie/now_playing', { page });
  if (data?.results) {
    const movies = data.results.map(normalizeTmdbMovie);
    return { data: movies, totalPages: data.total_pages, totalResults: data.total_results };
  }
  return { data: INITIAL_MOVIES.slice(0, 10), totalPages: 1, totalResults: INITIAL_MOVIES.length };
}

/**
 * Movie Details with Credits, Videos, Recommendations
 */
export async function getMovieDetails(id: string | number) {
  const data = await tmdbFetch(`/movie/${id}`, {
    append_to_response: 'credits,videos,recommendations,similar',
  });
  if (data) {
    const movie = normalizeTmdbMovie(data);
    const similar = Array.isArray(data.recommendations?.results) && data.recommendations.results.length > 0
      ? data.recommendations.results.slice(0, 6).map(normalizeTmdbMovie)
      : Array.isArray(data.similar?.results)
      ? data.similar.results.slice(0, 6).map(normalizeTmdbMovie)
      : [];
    return { ...movie, similar };
  }

  // Fallback to initial mock movies
  const found = INITIAL_MOVIES.find((m) => m.id === String(id) || String(m.tmdbId) === String(id));
  if (found) {
    const similar = INITIAL_MOVIES.filter((m) => m.id !== found.id).slice(0, 5);
    return { ...found, similar };
  }
  return null;
}

/**
 * Popular TV Series
 */
export async function getPopularTV(page = 1) {
  const data = await tmdbFetch('/tv/popular', { page });
  if (data?.results) {
    const shows = data.results.map(normalizeTmdbTV);
    return { data: shows, totalPages: data.total_pages, totalResults: data.total_results };
  }
  return { data: INITIAL_MOVIES.filter((m) => m.type === 'tv'), totalPages: 1, totalResults: INITIAL_MOVIES.length };
}

/**
 * Top Rated TV Series
 */
export async function getTopRatedTV(page = 1) {
  const data = await tmdbFetch('/tv/top_rated', { page });
  if (data?.results) {
    const shows = data.results.map(normalizeTmdbTV);
    return { data: shows, totalPages: data.total_pages, totalResults: data.total_results };
  }
  return { data: INITIAL_MOVIES.filter((m) => m.type === 'tv'), totalPages: 1, totalResults: INITIAL_MOVIES.length };
}

/**
 * TV Details with Seasons, Credits, Videos, Recommendations
 */
export async function getTVDetails(id: string | number) {
  const data = await tmdbFetch(`/tv/${id}`, {
    append_to_response: 'credits,videos,recommendations,similar',
  });
  if (data) {
    const show = normalizeTmdbTV(data);
    const seasonsList = Array.isArray(data.seasons)
      ? data.seasons
          .filter((s: any) => s.season_number > 0)
          .map((s: any) => ({
            seasonNumber: s.season_number,
            name: s.name,
            episodeCount: s.episode_count,
            posterPath: s.poster_path,
          }))
      : [];

    const similar = Array.isArray(data.recommendations?.results) && data.recommendations.results.length > 0
      ? data.recommendations.results.slice(0, 6).map(normalizeTmdbTV)
      : Array.isArray(data.similar?.results)
      ? data.similar.results.slice(0, 6).map(normalizeTmdbTV)
      : [];

    return { ...show, seasonsList, similar };
  }

  const found = INITIAL_MOVIES.find((m) => m.id === String(id) || String(m.tmdbId) === String(id));
  if (found) {
    const similar = INITIAL_MOVIES.filter((m) => m.id !== found.id).slice(0, 5);
    return { ...found, similar };
  }
  return null;
}

/**
 * TV Season Episodes Information
 */
export async function getTVSeasonEpisodes(id: string | number, seasonNumber = 1) {
  const data = await tmdbFetch(`/tv/${id}/season/${seasonNumber}`);
  if (data?.episodes) {
    return data.episodes.map((ep: any) => ({
      episodeNumber: ep.episode_number,
      seasonNumber: ep.season_number,
      name: ep.name,
      overview: ep.overview,
      stillPath: ep.still_path,
      airDate: ep.air_date,
      rating: ep.vote_average,
    }));
  }
  return [];
}

/**
 * Universal Multi-Search (Movies, TV Shows, IMDb ID, Numeric TMDB ID)
 */
export async function searchMulti(query: string, page = 1) {
  if (!query || !query.trim()) return { data: [], totalPages: 0, totalResults: 0 };
  const trimmed = query.trim();

  // 1. If query is an IMDb ID like tt1234567
  if (/^tt\d+$/i.test(trimmed)) {
    const findData = await tmdbFetch(`/find/${trimmed}`, { external_source: 'imdb_id' });
    if (findData) {
      const results = [
        ...(findData.movie_results || []).map(normalizeTmdbMovie),
        ...(findData.tv_results || []).map(normalizeTmdbTV),
      ];
      if (results.length > 0) {
        return { data: results, totalPages: 1, totalResults: results.length };
      }
    }
  }

  // 2. If query is a numeric TMDb ID directly
  if (/^\d+$/.test(trimmed)) {
    const movieData = await tmdbFetch(`/movie/${trimmed}`);
    if (movieData && movieData.id) {
      return { data: [normalizeTmdbMovie(movieData)], totalPages: 1, totalResults: 1 };
    }
    const tvData = await tmdbFetch(`/tv/${trimmed}`);
    if (tvData && tvData.id) {
      return { data: [normalizeTmdbTV(tvData)], totalPages: 1, totalResults: 1 };
    }
  }

  // 3. Parallel multi + movie + tv search to capture EVERY title across the entire database
  const [multiData, movieData, tvData] = await Promise.all([
    tmdbFetch('/search/multi', { query: trimmed, page, include_adult: 'false' }),
    tmdbFetch('/search/movie', { query: trimmed, page, include_adult: 'false' }),
    tmdbFetch('/search/tv', { query: trimmed, page, include_adult: 'false' }),
  ]);

  const map = new Map<string, Movie>();

  // Process movie search
  if (movieData?.results && Array.isArray(movieData.results)) {
    for (const item of movieData.results) {
      map.set(`movie-${item.id}`, normalizeTmdbMovie(item));
    }
  }

  // Process TV search
  if (tvData?.results && Array.isArray(tvData.results)) {
    for (const item of tvData.results) {
      map.set(`tv-${item.id}`, normalizeTmdbTV(item));
    }
  }

  // Process multi search
  if (multiData?.results && Array.isArray(multiData.results)) {
    for (const item of multiData.results) {
      if (item.media_type === 'movie') {
        map.set(`movie-${item.id}`, normalizeTmdbMovie(item));
      } else if (item.media_type === 'tv') {
        map.set(`tv-${item.id}`, normalizeTmdbTV(item));
      }
    }
  }

  const combined = Array.from(map.values());
  if (combined.length > 0) {
    return {
      data: combined,
      totalPages: Math.max(multiData?.total_pages || 1, movieData?.total_pages || 1, tvData?.total_pages || 1),
      totalResults: combined.length,
    };
  }

  // Fallback search over local catalog
  const qLower = trimmed.toLowerCase();
  const localMatches = INITIAL_MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(qLower) ||
      m.overview.toLowerCase().includes(qLower) ||
      m.genres.some((g) => g.toLowerCase().includes(qLower)) ||
      m.cast?.some((c) => c.name.toLowerCase().includes(qLower))
  );
  return { data: localMatches, totalPages: 1, totalResults: localMatches.length };
}

/**
 * Discover Movies with Filters (Genre, Year, Sort)
 */
export async function discoverMovies(filters: {
  genre?: string;
  year?: string;
  minRating?: number;
  sort?: string;
  page?: number;
}) {
  const params: Record<string, string | number> = {
    page: filters.page || 1,
  };

  if (filters.year && filters.year !== 'All') {
    params.primary_release_year = filters.year;
  }
  if (filters.minRating && filters.minRating > 0) {
    params['vote_average.gte'] = filters.minRating;
  }
  if (filters.sort) {
    if (filters.sort === 'rating') params.sort_by = 'vote_average.desc';
    else if (filters.sort === 'year') params.sort_by = 'primary_release_date.desc';
    else if (filters.sort === 'title') params.sort_by = 'original_title.asc';
    else params.sort_by = 'popularity.desc';
  }

  const data = await tmdbFetch('/discover/movie', params);
  if (data?.results) {
    const movies = data.results.map(normalizeTmdbMovie);
    return { data: movies, totalPages: data.total_pages, totalResults: data.total_results };
  }

  // Local filtered fallback
  let list = INITIAL_MOVIES.filter((m) => m.type === 'movie');
  if (filters.genre && filters.genre !== 'All') {
    list = list.filter((m) => m.genres.some((g) => g.toLowerCase() === filters.genre!.toLowerCase()));
  }
  if (filters.year && filters.year !== 'All') {
    list = list.filter((m) => String(m.releaseYear) === filters.year);
  }
  if (filters.minRating && filters.minRating > 0) {
    list = list.filter((m) => m.rating >= filters.minRating!);
  }
  return { data: list, totalPages: 1, totalResults: list.length };
}

