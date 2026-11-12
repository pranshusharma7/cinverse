import { NextRequest, NextResponse } from 'next/server';
import { getMoviePlaybackUrl, getTVPlaybackUrl, checkPlaybackConfiguration } from '@/services/playback';
import { getMovieDetails, getTVDetails, searchMulti } from '@/services/tmdb';
import { INITIAL_MOVIES } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'movie';
  const season = parseInt(searchParams.get('season') || '1', 10);
  const episode = parseInt(searchParams.get('episode') || '1', 10);

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing media ID' }, { status: 400 });
  }

  const config = checkPlaybackConfiguration();
  if (!config.enabled) {
    return NextResponse.json({
      success: false,
      available: false,
      message: 'Playback provider is currently disabled by configuration.',
    });
  }

  try {
    // 1. Direct numeric TMDB ID passed
    if (/^\d+$/.test(id)) {
      const embedUrl = type === 'tv'
        ? `${config.baseUrl}/tv/${id}/${season}/${episode}?color=${config.themeColor}`
        : `${config.baseUrl}/movie/${id}?color=${config.themeColor}`;

      return NextResponse.json({
        success: true,
        available: true,
        source: 'nxsha-playback-provider',
        embedUrl,
        format: 'embed',
      });
    }

    // 2. Fetch media details to retrieve verified tmdbId
    let mediaObj: any = null;
    if (type === 'tv') {
      mediaObj = await getTVDetails(id);
    } else {
      mediaObj = await getMovieDetails(id);
      if (!mediaObj) {
        mediaObj = await getTVDetails(id);
      }
    }

    // If ID was a name slug or not found, search TMDb to resolve
    if (!mediaObj && !/^\d+$/.test(id)) {
      const searchRes = await searchMulti(id.replace(/[-_]/g, ' '), 1);
      if (searchRes.data && searchRes.data.length > 0) {
        mediaObj = searchRes.data[0];
      }
    }

    if (mediaObj) {
      if (mediaObj.type === 'tv' || type === 'tv') {
        const tvPlayback = await getTVPlaybackUrl(mediaObj, season, episode);
        return NextResponse.json({
          success: tvPlayback.available,
          available: tvPlayback.available,
          source: 'nxsha-playback-provider',
          embedUrl: tvPlayback.url,
          format: 'embed',
          message: tvPlayback.message,
        });
      } else {
        const moviePlayback = await getMoviePlaybackUrl(mediaObj);
        return NextResponse.json({
          success: moviePlayback.available,
          available: moviePlayback.available,
          source: 'nxsha-playback-provider',
          embedUrl: moviePlayback.url,
          format: 'embed',
          message: moviePlayback.message,
        });
      }
    }

    // 3. Fallback to local catalog or default embed
    const local = INITIAL_MOVIES.find((m) => m.id === id || String(m.tmdbId) === id) || INITIAL_MOVIES[0];
    const tmdbId = local.tmdbId || (type === 'tv' ? 204095 : 550);
    const embedUrl = type === 'tv'
      ? `${config.baseUrl}/tv/${tmdbId}/${season}/${episode}?color=${config.themeColor}`
      : `${config.baseUrl}/movie/${tmdbId}?color=${config.themeColor}`;

    return NextResponse.json({
      success: true,
      available: true,
      source: 'nxsha-playback-provider',
      embedUrl,
      streamUrl: local.streamUrl,
      format: 'embed',
    });
  } catch (err) {
    console.error('Stream resolution error:', err);
  }

  const fallback = INITIAL_MOVIES[0];
  return NextResponse.json({
    success: true,
    available: true,
    source: 'nxsha-fallback',
    embedUrl: `${config.baseUrl}/movie/550?color=${config.themeColor}`,
    streamUrl: fallback.streamUrl,
    format: 'embed',
  });
}
