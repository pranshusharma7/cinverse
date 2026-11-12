/**
 * Universal Image URL Helper for TMDb, AniList and CDNs
 */

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getPosterUrl = (path?: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${TMDB_IMAGE_BASE}/${size}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getBackdropUrl = (path?: string | null, size: 'w780' | 'w1280' | 'original' = 'original'): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${TMDB_IMAGE_BASE}/${size}${path.startsWith('/') ? path : `/${path}`}`;
};

