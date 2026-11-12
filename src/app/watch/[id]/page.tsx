'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, BookmarkPlus, Check, Sparkles } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { getMovieDetails, getStreamUrl } from '@/lib/api';
import { Movie } from '@/lib/types';
import { addToPlaylist, removeFromPlaylist, isInPlaylist } from '@/lib/storage';
import { MovieCard } from '@/components/MovieCard';
import { INITIAL_MOVIES, getNxshaEmbedUrl } from '@/lib/mockData';
import { playGlassClick, playGlassHover } from '@/lib/sound';

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const initialType = (searchParams.get('type') as 'movie' | 'tv') || 'movie';
  const initialSeason = parseInt(searchParams.get('season') || '1', 10);
  const initialEpisode = parseInt(searchParams.get('episode') || '1', 10);

  const [movie, setMovie] = useState<(Movie & { similar?: Movie[] }) | null>(null);
  const [streamData, setStreamData] = useState<{
    available: boolean;
    embedUrl?: string;
    streamUrl?: string;
    format?: 'hls' | 'mp4' | 'dash' | 'embed';
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);

  useEffect(() => {
    async function init() {
      if (!id) return;
      try {
        setLoading(true);
        const [detailsRes, streamRes] = await Promise.all([
          getMovieDetails(id, initialType),
          getStreamUrl(id, initialType, season, episode),
        ]);

        const m = detailsRes.data || INITIAL_MOVIES.find((item) => item.id === id || String(item.tmdbId) === id) || INITIAL_MOVIES[0];
        setMovie(m);
        setStreamData(streamRes);
        setInList(isInPlaylist(m.id));
      } catch (err) {
        console.error('Error initializing watch player:', err);
        const fallback = INITIAL_MOVIES.find((item) => item.id === id || String(item.tmdbId) === id) || INITIAL_MOVIES[0];
        setMovie(fallback);
        setStreamData({
          available: true,
          embedUrl: fallback.tmdbId
            ? getNxshaEmbedUrl(fallback.tmdbId, fallback.type, season, episode)
            : 'https://nxsha.space/embed/movie/550?color=green',
          format: 'embed',
        });
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id, initialType, season, episode]);

  const handleEpisodeChange = (s: number, e: number) => {
    setSeason(s);
    setEpisode(e);
  };

  const togglePlaylist = () => {
    if (!movie) return;
    playGlassClick();
    if (inList) {
      removeFromPlaylist(movie.id);
      setInList(false);
    } else {
      addToPlaylist(movie);
      setInList(true);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Connecting to nxsha.space dynamic stream...</span>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="w-full space-y-6">
      {/* Top back pill */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { playGlassClick(); router.back(); }}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-pill text-xs font-bold text-slate-700 hover:text-slate-950 transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Player</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Active provider pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>nxsha.space Connected</span>
          </div>

          <button
            onClick={togglePlaylist}
            onMouseEnter={playGlassHover}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full liquid-glass-pill text-xs font-bold text-slate-700 hover:text-slate-950 transition shadow-sm"
          >
            {inList ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            <span>{inList ? 'Saved in Playlist' : 'Save to Playlist'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Player Component with Liquid Glass Frame */}
      <div className="w-full rounded-[36px] p-2 liquid-glass-panel border-2 border-white shadow-2xl backdrop-blur-3xl">
        <VideoPlayer
          movie={movie}
          embedUrl={streamData?.embedUrl}
          streamUrl={streamData?.streamUrl}
          streamFormat="embed"
          isAvailable={streamData?.available}
          unavailableMessage={streamData?.message}
          season={season}
          episode={episode}
          onEpisodeChange={handleEpisodeChange}
        />
      </div>

      {/* Movie Meta Information Bar */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-white/90 backdrop-blur-2xl border-2 border-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-900">{movie.title}</h1>
            {movie.rating ? (
              <span className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                {movie.rating.toFixed(1)}
              </span>
            ) : null}
            {movie.type === 'tv' && (
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Season {season} Episode {episode}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 font-normal line-clamp-2 max-w-2xl">{movie.overview}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/movie/${movie.id}?type=${movie.type}`}
            onClick={playGlassClick}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition shadow-md shadow-indigo-600/25"
          >
            Movie Info &amp; Cast
          </Link>
        </div>
      </div>

      {/* Similar Movies Carousel */}
      {movie.similar && movie.similar.length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-wide">More Like This</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {movie.similar.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function WatchMoviePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 text-xs font-semibold">Connecting to player...</div>}>
      <WatchContent />
    </Suspense>
  );
}
