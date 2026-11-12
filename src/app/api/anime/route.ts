import { NextRequest, NextResponse } from 'next/server';
import { getTrendingAnime, searchAnime } from '@/services/anilist';
import { INITIAL_MOVIES } from '@/lib/mockData';

function cachedJson(data: any, maxAge = 600) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '15', 10);

  try {
    if (q && q.trim()) {
      const result = await searchAnime(q.trim(), page, perPage);
      if (result.data && result.data.length > 0) {
        return cachedJson({
          success: true,
          source: 'anilist-search',
          data: result.data,
          hasNextPage: result.hasNextPage,
          page,
        }, 300);
      }
    }

    const trending = await getTrendingAnime(page, perPage);
    if (trending.data && trending.data.length > 0) {
      return cachedJson({
        success: true,
        source: 'anilist-trending',
        data: trending.data,
        hasNextPage: trending.hasNextPage,
        page,
      }, 900);
    }

    // Fallback if network or AniList API is unreachable
    const fallbackAnime = INITIAL_MOVIES.filter(
      (m) =>
        m.genres?.includes('Animation') ||
        m.id.includes('cyberpunk') ||
        m.type === 'tv'
    );

    return cachedJson({
      success: true,
      source: 'fallback-cache',
      data: fallbackAnime,
      hasNextPage: false,
      page: 1,
    }, 300);
  } catch (err: any) {
    console.warn('Anime API error:', err?.message || err);
    return cachedJson({
      success: true,
      source: 'fallback-cache',
      data: INITIAL_MOVIES.filter((m) => m.genres?.includes('Animation')),
      hasNextPage: false,
      page: 1,
    }, 120);
  }
}
