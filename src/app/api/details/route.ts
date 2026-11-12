import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetails, getTVDetails, getTVSeasonEpisodes, searchMulti } from '@/services/tmdb';
import { INITIAL_MOVIES } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('season');

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing media ID' }, { status: 400 });
  }

  // If requesting specific TV season episode list
  if (type === 'tv' && season) {
    const episodes = await getTVSeasonEpisodes(id, parseInt(season, 10));
    return NextResponse.json({
      success: true,
      data: episodes,
    });
  }

  try {
    let details: any = null;

    if (type === 'tv') {
      details = await getTVDetails(id);
    } else {
      details = await getMovieDetails(id);
      // If movie lookup failed and ID is numeric, also check if it's a TV show
      if (!details && /^\d+$/.test(id)) {
        details = await getTVDetails(id);
      }
    }

    // If ID was a title slug or non-numeric name, search TMDb to resolve it
    if (!details && !/^\d+$/.test(id)) {
      const searchRes = await searchMulti(id.replace(/[-_]/g, ' '), 1);
      if (searchRes.data && searchRes.data.length > 0 && searchRes.data[0].tmdbId) {
        const foundId = searchRes.data[0].tmdbId;
        details = (searchRes.data[0].type === 'tv' || type === 'tv')
          ? await getTVDetails(foundId)
          : await getMovieDetails(foundId);
      }
    }

    if (details) {
      return NextResponse.json({
        success: true,
        source: 'tmdb',
        data: details,
      });
    }
  } catch (err) {
    console.warn('Details fetch error:', err);
  }

  // Fallback to local catalog
  const found = INITIAL_MOVIES.find((m) => m.id === id || String(m.tmdbId) === id) || INITIAL_MOVIES[0];
  const similar = INITIAL_MOVIES.filter((m) => m.id !== found.id).slice(0, 5);
  return NextResponse.json({
    success: true,
    source: 'local-fallback',
    data: { ...found, similar },
  });
}
