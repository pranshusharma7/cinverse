import { Movie } from '@/lib/types';
import { normalizeAniListMedia } from '@/utils/mediaMapper';

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

const ANILIST_QUERY = `
query ($search: String, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(search: $search, sort: $sort, type: ANIME, isAdult: false) {
      id
      title {
        romaji
        english
        native
      }
      description
      format
      status
      episodes
      duration
      seasonYear
      startDate {
        year
        month
        day
      }
      genres
      averageScore
      coverImage {
        extraLarge
        large
        color
      }
      bannerImage
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
`;

// In-memory cache for fast AniList results
const anilistCache = new Map<string, { timestamp: number; data: any }>();
const ANILIST_CACHE_TTL = 15 * 60 * 1000;

let anilistCooldownUntil = 0;

export async function fetchAniList(variables: Record<string, any>) {
  if (Date.now() < anilistCooldownUntil) {
    return null;
  }

  const cacheKey = JSON.stringify(variables);
  const cached = anilistCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ANILIST_CACHE_TTL) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s fast timeout

    const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables,
      }),
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`AniList GraphQL Error: ${res.status}`);
      return null;
    }

    const json = await res.json();
    const pageData = json.data?.Page;
    if (pageData) {
      anilistCache.set(cacheKey, { timestamp: Date.now(), data: pageData });
    }
    return pageData;
  } catch (err: any) {
    console.warn('AniList fetch error (using fallback):', err?.message || err);
    anilistCooldownUntil = Date.now() + 60 * 1000;
    return null;
  }
}

/**
 * Trending Anime
 */
export async function getTrendingAnime(page = 1, perPage = 10): Promise<{ data: Movie[]; hasNextPage: boolean }> {
  const result = await fetchAniList({
    page,
    perPage,
    sort: ['TRENDING_DESC'],
  });

  if (result?.media) {
    return {
      data: result.media.map((item: any) => normalizeAniListMedia(item)),
      hasNextPage: result.pageInfo?.hasNextPage || false,
    };
  }
  return { data: [], hasNextPage: false };
}

/**
 * Search Anime by Query
 */
export async function searchAnime(query: string, page = 1, perPage = 10): Promise<{ data: Movie[]; hasNextPage: boolean }> {
  if (!query || !query.trim()) return { data: [], hasNextPage: false };

  const result = await fetchAniList({
    search: query.trim(),
    page,
    perPage,
    sort: ['SEARCH_MATCH', 'POPULARITY_DESC'],
  });

  if (result?.media) {
    return {
      data: result.media.map((item: any) => normalizeAniListMedia(item)),
      hasNextPage: result.pageInfo?.hasNextPage || false,
    };
  }
  return { data: [], hasNextPage: false };
}

