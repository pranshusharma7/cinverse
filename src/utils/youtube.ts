/**
 * YouTube Utility functions for extracting video IDs, timestamps,
 * and generating embed URLs with autoplay support.
 */

export interface ParsedYouTube {
  videoId: string;
  startTime?: number;
}

export interface PresetTrailer {
  id: string;
  title: string;
  year: number;
  badge: string;
  videoId: string;
}

export const PRESET_YOUTUBE_TRAILERS: PresetTrailer[] = [
  {
    id: 'avatar-2',
    title: 'Avatar: The Way of Water',
    year: 2022,
    badge: '4K Sci-Fi',
    videoId: 'd9MyW72ELq0',
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer (Official Trailer)',
    year: 2023,
    badge: 'IMAX Drama',
    videoId: 'uYPbbksJxIg',
  },
  {
    id: 'interstellar',
    title: 'Interstellar (10th Anniversary)',
    year: 2014,
    badge: 'Sci-Fi Classic',
    videoId: 'zSWdZVtXT7E',
  },
  {
    id: 'dune-2',
    title: 'Dune: Part Two',
    year: 2024,
    badge: 'Epic Blockbuster',
    videoId: 'Way9Dexny3w',
  },
  {
    id: 'spiderman-nwh',
    title: 'Spider-Man: No Way Home',
    year: 2021,
    badge: 'Action Adventure',
    videoId: 'JfVOs4VSpmA',
  },
];

/**
 * Extracts a YouTube Video ID and optional start timestamp from various URL formats
 * or raw 11-character video IDs.
 */
export function extractYouTubeId(urlOrId: string): ParsedYouTube | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;

  const trimmed = urlOrId.trim();

  // If already a raw 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { videoId: trimmed };
  }

  // Regex matching various YouTube URL shapes:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  // - https://www.youtube-nocookie.com/embed/VIDEO_ID
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    let startTime: number | undefined;
    const timeMatch = trimmed.match(/[?&](?:t|start)=([0-9hms]+)/i);
    if (timeMatch && timeMatch[1]) {
      const raw = timeMatch[1];
      if (/^\d+$/.test(raw)) {
        startTime = parseInt(raw, 10);
      } else {
        let total = 0;
        const h = raw.match(/(\d+)h/i);
        const m = raw.match(/(\d+)m/i);
        const s = raw.match(/(\d+)s/i);
        if (h) total += parseInt(h[1], 10) * 3600;
        if (m) total += parseInt(m[1], 10) * 60;
        if (s) total += parseInt(s[1], 10);
        if (total > 0) startTime = total;
      }
    }
    return { videoId: match[1], startTime };
  }

  return null;
}

/**
 * Generates an autoplay-ready embed URL for a given YouTube video ID.
 */
export function getYouTubeEmbedUrl(videoId: string, startTime?: number, autoPlay: boolean = true): string {
  const params = new URLSearchParams();
  if (autoPlay) {
    params.set('autoplay', '1');
  }
  params.set('rel', '0');
  params.set('modestbranding', '1');
  params.set('playsinline', '1');
  params.set('enablejsapi', '1');
  if (startTime && startTime > 0) {
    params.set('start', String(startTime));
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Returns true if the string is a valid YouTube URL or Video ID.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Helper to format bytes into readable KB/MB/GB
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Helper to format seconds into mm:ss or hh:mm:ss
 */
export function formatSeconds(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

