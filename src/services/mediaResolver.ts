import { searchMulti } from './tmdb';

// Known verified mapping table for instant zero-latency accuracy
export const KNOWN_ANIME_TMDB_MAP: Record<string, { tmdbId: number; type: 'movie' | 'tv' }> = {
  // TV Shows
  'demon slayer': { tmdbId: 85937, type: 'tv' },
  'kimetsu no yaiba': { tmdbId: 85937, type: 'tv' },
  'attack on titan': { tmdbId: 1429, type: 'tv' },
  'shingeki no kyojin': { tmdbId: 1429, type: 'tv' },
  'naruto': { tmdbId: 46260, type: 'tv' },
  'naruto shippuden': { tmdbId: 31910, type: 'tv' },
  'one piece': { tmdbId: 37854, type: 'tv' },
  'jujutsu kaisen': { tmdbId: 95479, type: 'tv' },
  'chainsaw man': { tmdbId: 114410, type: 'tv' },
  'death note': { tmdbId: 1399, type: 'tv' },
  'bleach': { tmdbId: 30984, type: 'tv' },
  'hunter x hunter': { tmdbId: 46298, type: 'tv' },
  'my hero academia': { tmdbId: 65930, type: 'tv' },
  'boku no hero academia': { tmdbId: 65930, type: 'tv' },
  'fullmetal alchemist: brotherhood': { tmdbId: 31911, type: 'tv' },
  'spy x family': { tmdbId: 120089, type: 'tv' },
  'cyberpunk: edgerunners': { tmdbId: 105248, type: 'tv' },
  'solo leveling': { tmdbId: 209867, type: 'tv' },

  // Movies
  'spirited away': { tmdbId: 129, type: 'movie' },
  'your name': { tmdbId: 372058, type: 'movie' },
  'kimi no na wa': { tmdbId: 372058, type: 'movie' },
  'demon slayer: mugen train': { tmdbId: 635302, type: 'movie' },
  'howls moving castle': { tmdbId: 4935, type: 'movie' },
  'a silent voice': { tmdbId: 378064, type: 'movie' },
  'princess mononoke': { tmdbId: 128, type: 'movie' },
};

/**
 * Normalizes title for string comparison
 */
function cleanTitle(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves an AniList or raw Media item to a verified TMDb ID
 */
export async function resolveMediaIdentifier(media: {
  title?: string;
  originalTitle?: string;
  romajiTitle?: string;
  releaseYear?: number;
  format?: string;
}): Promise<{ tmdbId: number | null; type: 'movie' | 'tv'; verified: boolean }> {
  const titles = [media.title, media.romajiTitle, media.originalTitle].filter(Boolean) as string[];

  // 1. Check known verified dictionary
  for (const t of titles) {
    const lower = t.toLowerCase().trim();
    if (KNOWN_ANIME_TMDB_MAP[lower]) {
      return {
        tmdbId: KNOWN_ANIME_TMDB_MAP[lower].tmdbId,
        type: KNOWN_ANIME_TMDB_MAP[lower].type,
        verified: true,
      };
    }
  }

  // 2. Query TMDb multi search
  const mainTitle = titles[0];
  if (!mainTitle) {
    return { tmdbId: null, type: 'movie', verified: false };
  }

  try {
    const searchRes = await searchMulti(mainTitle, 1);
    if (searchRes.data && searchRes.data.length > 0) {
      const cleanedTarget = cleanTitle(mainTitle);

      for (const candidate of searchRes.data) {
        const cleanedCandidate = cleanTitle(candidate.title || '');
        const cleanedOriginal = cleanTitle(candidate.originalTitle || '');

        // Match if titles contain each other or release year matches
        const titleMatches =
          cleanedCandidate === cleanedTarget ||
          cleanedOriginal === cleanedTarget ||
          cleanedCandidate.includes(cleanedTarget) ||
          cleanedTarget.includes(cleanedCandidate);

        const yearMatches = media.releaseYear ? Math.abs((candidate.releaseYear || 0) - media.releaseYear) <= 1 : true;

        if (titleMatches && yearMatches && candidate.tmdbId) {
          return {
            tmdbId: Number(candidate.tmdbId),
            type: candidate.type || 'tv',
            verified: true,
          };
        }
      }
    }
  } catch (err) {
    console.warn('Error resolving media identifier via TMDb:', err);
  }

  // No reliable TMDb match found
  return { tmdbId: null, type: 'movie', verified: false };
}

