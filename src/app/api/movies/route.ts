import { NextRequest, NextResponse } from 'next/server';
import {
  getPopularMovies,
  getTrending,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  discoverMovies,
} from '@/services/tmdb';
import { INITIAL_MOVIES } from '@/lib/mockData';

function cachedJson(data: any, maxAge = 300) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const genre = searchParams.get('genre');
  const year = searchParams.get('year');
  const minRating = parseFloat(searchParams.get('minRating') || '0');
  const sort = searchParams.get('sort') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    // If specific filters are applied, use discover
    if ((genre && genre !== 'All') || (year && year !== 'All') || minRating > 0 || sort !== 'popularity') {
      const result = await discoverMovies({
        genre: genre || undefined,
        year: year || undefined,
        minRating,
        sort: sort || undefined,
        page,
      });
      return cachedJson({
        success: true,
        source: 'tmdb-discover',
        data: result?.data || INITIAL_MOVIES.filter((m) => m.type === 'movie'),
        totalPages: result?.totalPages || 1,
        total: result?.totalResults || INITIAL_MOVIES.length,
        page,
      }, 600);
    }

    // Category routing
    if (category === 'trending') {
      const result = await getTrending('movie', 'day', page);
      return cachedJson({
        success: true,
        source: 'tmdb-trending',
        data: result?.data || INITIAL_MOVIES.filter((m) => m.isTrending),
        totalPages: result?.totalPages || 1,
        total: result?.totalResults || INITIAL_MOVIES.length,
        page,
      }, 300);
    }

    if (category === 'upcoming') {
      const result = await getUpcomingMovies(page);
      return cachedJson({
        success: true,
        source: 'tmdb-upcoming',
        data: result?.data || INITIAL_MOVIES.filter((m) => m.isUpcoming),
        totalPages: result?.totalPages || 1,
        total: result?.totalResults || INITIAL_MOVIES.length,
        page,
      }, 600);
    }

    if (category === 'top_rated') {
      const result = await getTopRatedMovies(page);
      return cachedJson({
        success: true,
        source: 'tmdb-top-rated',
        data: result?.data || INITIAL_MOVIES.filter((m) => m.isTopRated),
        totalPages: result?.totalPages || 1,
        total: result?.totalResults || INITIAL_MOVIES.length,
        page,
      }, 600);
    }

    if (category === 'now_playing') {
      const result = await getNowPlayingMovies(page);
      return cachedJson({
        success: true,
        source: 'tmdb-now-playing',
        data: result?.data || INITIAL_MOVIES.slice(0, 10),
        totalPages: result?.totalPages || 1,
        total: result?.totalResults || INITIAL_MOVIES.length,
        page,
      }, 300);
    }

    // Default: Popular movies
    const result = await getPopularMovies(page);
    return cachedJson({
      success: true,
      source: 'tmdb-popular',
      data: result?.data || INITIAL_MOVIES.filter((m) => m.type === 'movie'),
      totalPages: result?.totalPages || 1,
      total: result?.totalResults || INITIAL_MOVIES.length,
      page,
    }, 300);
  } catch (err) {
    console.error('Movies API route error:', err);
    return cachedJson({
      success: true,
      source: 'local-fallback',
      data: INITIAL_MOVIES.filter((m) => m.type === 'movie'),
      total: INITIAL_MOVIES.length,
      page: 1,
    }, 120);
  }
}
