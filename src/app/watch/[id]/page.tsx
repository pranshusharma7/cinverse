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
        <div className="w-8 h-8 border-2 border-[#7A242B] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#7A6165] font-serif">Connecting to cinema stream...</span>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="w-full space-y-6 select-none">
      {/* Top back pill */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { playGlassClick(); router.back(); }}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] text-xs font-semibold text-[#54383B] transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7A242B]" />
          <span>Exit Salon Screening</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Active provider pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] text-[#7A242B] text-xs font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>nxsha.space Connected</span>
          </div>

          <button
            onClick={togglePlaylist}
            onMouseEnter={playGlassHover}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] text-xs font-medium text-[#54383B] transition shadow-xs"
          >
            {inList ? <Check className="w-3.5 h-3.5 text-[#7A242B]" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            <span>{inList ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Player Component with Warm Frame */}
      <div className="w-full rounded-3xl sm:rounded-[2.4rem] p-2 bg-black border border-[#E5DDD2] shadow-2xl">
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
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#231215]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-[#231215]">{movie.title}</h1>
            {movie.rating ? (
              <span className="flex items-center gap-1 text-xs font-bold text-[#231215] bg-[#FAF5EE] px-2.5 py-0.5 rounded-full border border-[#E8DFD4] shadow-xs">
                <Star className="w-3 h-3 fill-[#C27803] text-[#C27803]" />
                {movie.rating.toFixed(1)}
              </span>
            ) : null}
            {movie.type === 'tv' && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#7A242B] border border-[#E8DFD4]">
                Season {season} Episode {episode}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal line-clamp-2 max-w-2xl">{movie.overview}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/movie/${movie.id}?type=${movie.type}`}
            onClick={playGlassClick}
            className="px-6 py-2.5 rounded-full btn-terracotta text-xs font-semibold text-white transition shadow-sm"
          >
            Film Notes &amp; Cast
          </Link>
        </div>
      </div>

      {/* Similar Movies Carousel */}
      {movie.similar && movie.similar.length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="font-serif text-base font-bold text-[#231215] tracking-tight">Curatorial Similar Screenings</h2>
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
    <Suspense fallback={<div className="py-20 text-center text-[#786164] font-serif text-xs">Connecting to screening salon...</div>}>
      <WatchContent />
    </Suspense>
  );
}
