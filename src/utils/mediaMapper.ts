import { Movie, CastMember } from '@/lib/types';
import { getPosterUrl, getBackdropUrl } from './imageUrl';

export const TMDB_GENRES_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  // TV specific
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export function mapGenreIdsToNames(genreIds?: number[]): string[] {
  if (!genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
    return ['Cinema'];
  }
  return genreIds.map((id) => TMDB_GENRES_MAP[id] || 'Cinema').filter(Boolean);
}

/**
 * Normalizes TMDb Movie Object
 */
export function normalizeTmdbMovie(item: any): Movie {
  const genres = Array.isArray(item.genres)
    ? item.genres.map((g: any) => (typeof g === 'string' ? g : g.name || 'Action'))
    : mapGenreIdsToNames(item.genre_ids);

  const releaseDate = item.release_date || item.first_air_date || '';
  const releaseYear = releaseDate ? parseInt(releaseDate.split('-')[0], 10) : 2024;
  const rating = Number(item.vote_average ? item.vote_average.toFixed(1) : 7.8);

  const runtimeMinutes = item.runtime || (item.episode_run_time ? item.episode_run_time[0] : null);
  let runtimeStr = '2h 10m';
  if (runtimeMinutes) {
    const h = Math.floor(runtimeMinutes / 60);
    const m = runtimeMinutes % 60;
    runtimeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const cast: CastMember[] = Array.isArray(item.credits?.cast)
    ? item.credits.cast.slice(0, 8).map((c: any) => ({
        name: c.name || c.original_name,
        role: c.character || 'Actor',
        avatarUrl: c.profile_path ? getPosterUrl(c.profile_path, 'w342') : undefined,
      }))
    : [];

  const director = item.credits?.crew?.find((c: any) => c.job === 'Director')?.name || item.director;

  const ytTrailer = Array.isArray(item.videos?.results)
    ? item.videos.results.find((v: any) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube' && v.key)
    : undefined;

  return {
    id: String(item.id),
    tmdbId: item.id,
    title: item.title || item.name || 'Untitled Title',
    originalTitle: item.original_title || item.original_name || item.title,
    overview: item.overview || 'No synopsis available for this title.',
    backdropUrl: getBackdropUrl(item.backdrop_path || item.poster_path),
    posterUrl: getPosterUrl(item.poster_path || item.backdrop_path),
    genres: genres.length > 0 ? genres : ['Action', 'Drama'],
    releaseYear: releaseYear || 2024,
    releaseDate: releaseDate || String(releaseYear || 2024),
    rating,
    runtime: runtimeStr,
    durationSeconds: (runtimeMinutes || 120) * 60,
    type: 'movie',
    cast,
    director,
    trailerUrl: ytTrailer?.key ? `https://www.youtube.com/watch?v=${ytTrailer.key}` : undefined,
    streamFormat: 'embed',
    embedUrl: `https://nxsha.space/embed/movie/${item.id}?color=green`,
    isTrending: Boolean(item.isTrending || item.popularity > 80),
    isUpcoming: Boolean(item.isUpcoming),
    isTopRated: rating >= 8.2,
    voteCount: item.vote_count,
  };
}

/**
 * Normalizes TMDb TV Series Object
 */
export function normalizeTmdbTV(item: any): Movie {
  const genres = Array.isArray(item.genres)
    ? item.genres.map((g: any) => (typeof g === 'string' ? g : g.name || 'Drama'))
    : mapGenreIdsToNames(item.genre_ids);

  const releaseDate = item.first_air_date || item.release_date || '';
  const releaseYear = releaseDate ? parseInt(releaseDate.split('-')[0], 10) : 2024;
  const rating = Number(item.vote_average ? item.vote_average.toFixed(1) : 8.1);
  const seasonsCount = item.number_of_seasons || (item.seasons ? item.seasons.length : 1);
  const episodesCount = item.number_of_episodes || 10;

  const cast: CastMember[] = Array.isArray(item.credits?.cast)
    ? item.credits.cast.slice(0, 8).map((c: any) => ({
        name: c.name || c.original_name,
        role: c.character || 'Actor',
        avatarUrl: c.profile_path ? getPosterUrl(c.profile_path, 'w342') : undefined,
      }))
    : [];

  return {
    id: String(item.id),
    tmdbId: item.id,
    title: item.name || item.title || 'Untitled Series',
    originalTitle: item.original_name || item.original_title || item.name,
    overview: item.overview || 'No description available for this series.',
    backdropUrl: getBackdropUrl(item.backdrop_path || item.poster_path),
    posterUrl: getPosterUrl(item.poster_path || item.backdrop_path),
    genres: genres.length > 0 ? genres : ['Drama', 'Action'],
    releaseYear: releaseYear || 2024,
    releaseDate: releaseDate || String(releaseYear || 2024),
    rating,
    runtime: `${seasonsCount} Season${seasonsCount > 1 ? 's' : ''}`,
    durationSeconds: 3600,
    type: 'tv',
    seasons: seasonsCount,
    episodes: episodesCount,
    cast,
    trailerUrl: Array.isArray(item.videos?.results)
      ? item.videos.results.find((v: any) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube' && v.key)?.key
        ? `https://www.youtube.com/watch?v=${item.videos.results.find((v: any) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube' && v.key).key}`
        : undefined
      : undefined,
    streamFormat: 'embed',
    embedUrl: `https://nxsha.space/embed/tv/${item.id}/1/1?color=green`,
    isTrending: Boolean(item.isTrending || item.popularity > 80),
    isTopRated: rating >= 8.2,
    voteCount: item.vote_count,
  };
}

/**
 * Normalizes AniList Media Object
 */
export function normalizeAniListMedia(item: any, resolvedTmdbId?: number | string): Movie {
  const title = item.title?.english || item.title?.romaji || item.title?.native || 'Untitled Anime';
  const originalTitle = item.title?.native || item.title?.romaji || title;
  const releaseYear = item.startDate?.year || (item.seasonYear ? item.seasonYear : 2024);
  const rating = item.averageScore ? Number((item.averageScore / 10).toFixed(1)) : 8.0;

  const isMovie = item.format === 'MOVIE';
  const episodes = item.episodes || (isMovie ? 1 : 12);
  const durationMins = item.duration || 24;

  // Clean HTML from AniList description
  const cleanOverview = item.description
    ? item.description.replace(/<[^>]*>?/gm, '').trim()
    : 'No description available for this anime.';

  return {
    id: `anime-${item.id}`,
    tmdbId: resolvedTmdbId,
    aniListId: item.id,
    title,
    originalTitle,
    overview: cleanOverview,
    backdropUrl: item.bannerImage || item.coverImage?.extraLarge || item.coverImage?.large,
    posterUrl: item.coverImage?.extraLarge || item.coverImage?.large || item.bannerImage,
    genres: item.genres || ['Animation', 'Action'],
    releaseYear,
    releaseDate: `${item.startDate?.year || 2024}-${String(item.startDate?.month || 1).padStart(2, '0')}-${String(item.startDate?.day || 1).padStart(2, '0')}`,
    rating,
    runtime: isMovie ? `${durationMins}m` : `${episodes} Episodes`,
    durationSeconds: durationMins * 60,
    type: isMovie ? 'movie' : 'tv',
    seasons: 1,
    episodes,
    director: item.studios?.nodes?.[0]?.name,
    streamFormat: 'embed',
    embedUrl: resolvedTmdbId
      ? (isMovie ? `https://nxsha.space/embed/movie/${resolvedTmdbId}?color=green` : `https://nxsha.space/embed/tv/${resolvedTmdbId}/1/1?color=green`)
      : undefined,
    isTrending: true,
  };
}

