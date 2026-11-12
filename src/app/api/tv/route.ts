import { NextRequest, NextResponse } from 'next/server';
import { getPopularTV, getTopRatedTV, getTrending } from '@/services/tmdb';
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
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    if (category === 'trending') {
      const result = await getTrending('tv', 'day', page);
      return cachedJson({
        success: true,
        source: 'tmdb-tv-trending',
        data: result?.data || INITIAL_MOVIES.filter((m) => m.type === 'tv'),
        totalPages: result?.totalPages || 1,
        total: result?.totalResults || INITIAL_MOVIES.length,
        page,
      }, 300);
    }

    if (category === 'top_rated') {
      const result = await getTopRatedTV(page);
      return cachedJson({
        success: true,
        source: 'tmdb-tv-top-rated',
        data: result?.data || INITIAL_MOVIES.filter((m) => m.type === 'tv'),
        totalPages: result?.totalPages || 1,
        total: result?.totalResults || INITIAL_MOVIES.length,
        page,
      }, 600);
    }

    const result = await getPopularTV(page);
    return cachedJson({
      success: true,
      source: 'tmdb-tv-popular',
      data: result?.data || INITIAL_MOVIES.filter((m) => m.type === 'tv'),
      totalPages: result?.totalPages || 1,
      total: result?.totalResults || INITIAL_MOVIES.length,
      page,
    }, 300);
  } catch (err) {
    console.error('TV API route error:', err);
    return cachedJson({
      success: true,
      source: 'local-fallback',
      data: INITIAL_MOVIES.filter((m) => m.type === 'tv'),
      total: INITIAL_MOVIES.length,
      page: 1,
    }, 120);
  }
}
