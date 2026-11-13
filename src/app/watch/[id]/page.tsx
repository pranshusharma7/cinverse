'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, BookmarkPlus, Check, Sparkles, Clock, Calendar, Tv, Share2, Info } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    playGlassClick();
    try {
      if (typeof window !== 'undefined' && navigator.share) {
        await navigator.share({
          title: movie?.title,
          url: window.location.href,
        });
      } else if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled
    }
  };

  if (loading) {
    return (
      <div className="w-full h-80 sm:h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#7A242B] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#7A6165] font-serif">Connecting to cinema stream...</span>
      </div>
    );
  }

  if (!movie) return null;

  const totalEpisodes = movie.episodes || 12;

  return (
    <div className="w-full space-y-4 sm:space-y-6 select-none">
      {/* Top back & Controls Pill Bar (Mobile Optimized) */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => { playGlassClick(); router.back(); }}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] text-xs font-semibold text-[#54383B] transition shadow-xs shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7A242B]" />
          <span className="hidden sm:inline">Exit Salon Screening</span>
          <span className="sm:hidden">Exit</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active provider pill */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] text-[#7A242B] text-[11px] sm:text-xs font-medium shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden xs:inline">nxsha.space HD</span>
            <span className="xs:hidden">HD</span>
          </div>

          <button
            onClick={togglePlaylist}
            onMouseEnter={playGlassHover}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border text-xs font-medium transition shadow-xs ${
              inList
                ? 'bg-[#F4ECE1] border-[#7A242B] text-[#7A242B]'
                : 'bg-[#FFFDFB] hover:bg-[#FAF6F0] border-[#E5DDD2] text-[#54383B]'
            }`}
          >
            {inList ? <Check className="w-3.5 h-3.5 text-[#7A242B]" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{inList ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Player Container (Max width on mobile with smooth rounded edges) */}
      <div className="w-full rounded-2xl sm:rounded-3xl md:rounded-[2.4rem] overflow-hidden bg-black border border-stone-800 sm:border-[#E5DDD2] shadow-xl sm:shadow-2xl">
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

      {/* Mobile-Friendly Quick Episodes Bar (When TV Series) */}
      {movie.type === 'tv' && (
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-medium px-1">
            <div className="flex items-center gap-2">
              <Tv className="w-3.5 h-3.5 text-[#7A242B]" />
              <span className="font-serif font-bold text-[#231215]">
                Season {season} Episodes
              </span>
            </div>
            <span className="text-[11px] text-[#7A6165]">
              Currently Playing: Ep {episode}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {Array.from({ length: totalEpisodes }).map((_, idx) => {
              const epNum = idx + 1;
              const isActive = episode === epNum;
              return (
                <button
                  key={epNum}
                  onClick={() => handleEpisodeChange(season, epNum)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 border ${
                    isActive
                      ? 'bg-[#7A242B] border-[#7A242B] text-white shadow-xs'
                      : 'bg-[#FAF7F2] hover:bg-[#FAF6F0] border-[#E5DDD2] text-[#4F3639]'
                  }`}
                >
                  Ep {epNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Movie Meta Information Bar */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[#231215]">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-[#231215]">
              {movie.title}
            </h1>
            {movie.rating ? (
              <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#231215] bg-[#FAF5EE] px-2.5 py-0.5 rounded-full border border-[#E8DFD4] shadow-xs tabular-nums">
                <Star className="w-3 h-3 fill-[#C27803] text-[#C27803]" />
                {movie.rating.toFixed(1)}
              </span>
            ) : null}
            {movie.type === 'tv' && (
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#7A242B] border border-[#E8DFD4]">
                S{season} E{episode}
              </span>
            )}
            {movie.runtime && (
              <span className="text-[11px] text-[#7A6165] font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#7A242B]" />
                {movie.runtime}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal line-clamp-2 max-w-2xl">
            {movie.overview}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
          <button
            onClick={handleShare}
            className="p-2 sm:p-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4ECE1] border border-[#D4C8BB] text-[#54383B] transition shadow-xs"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {copied && <span className="text-xs text-[#7A242B] font-semibold">Link copied!</span>}

          <Link
            href={`/movie/${movie.id}?type=${movie.type}`}
            onClick={playGlassClick}
            className="flex-1 sm:flex-initial text-center px-5 sm:px-6 py-2 sm:py-2.5 rounded-full btn-terracotta text-xs font-semibold text-white transition shadow-sm"
          >
            Film Notes &amp; Cast
          </Link>
        </div>
      </div>

      {/* Similar Movies Carousel */}
      {movie.similar && movie.similar.length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="font-serif text-base font-bold text-[#231215] tracking-tight">Curatorial Similar Screenings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
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
