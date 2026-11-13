'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Play,
  Plus,
  Check,
  Star,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  X,
  Film,
  Tv,
} from 'lucide-react';
import { getMovieDetails, getTVSeasonEpisodes } from '@/lib/api';
import { Movie } from '@/lib/types';
import { addToPlaylist, removeFromPlaylist, isInPlaylist } from '@/lib/storage';
import { MovieCard } from '@/components/MovieCard';
import { INITIAL_MOVIES } from '@/lib/mockData';
import { playGlassClick, playGlassHover } from '@/lib/sound';

function MovieDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const initialType = (searchParams.get('type') as 'movie' | 'tv') || 'movie';

  const [movie, setMovie] = useState<(Movie & { seasonsList?: any[]; similar?: Movie[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getMovieDetails(id, initialType);
        const data = res.data || INITIAL_MOVIES.find((m) => m.id === id || String(m.tmdbId) === id) || INITIAL_MOVIES[0];
        setMovie(data);
        setInList(isInPlaylist(data.id));

        if (data.type === 'tv') {
          loadSeasonEpisodes(data.tmdbId || data.id, 1);
        }
      } catch {
        const fallback = INITIAL_MOVIES.find((m) => m.id === id || String(m.tmdbId) === id) || INITIAL_MOVIES[0];
        setMovie({ ...fallback, similar: INITIAL_MOVIES.filter((m) => m.id !== id).slice(0, 5) });
        setInList(isInPlaylist(fallback.id));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, initialType]);

  async function loadSeasonEpisodes(mediaId: string | number, seasonNum: number) {
    try {
      setLoadingEpisodes(true);
      const res = await getTVSeasonEpisodes(String(mediaId), seasonNum);
      if (res.data && res.data.length > 0) {
        setEpisodesList(res.data);
      } else {
        setEpisodesList(
          Array.from({ length: 8 }).map((_, i) => ({
            episodeNumber: i + 1,
            seasonNumber: seasonNum,
            name: `Episode ${i + 1}`,
            overview: `Episode ${i + 1} of season ${seasonNum}.`,
          }))
        );
      }
    } catch {
      // Ignored
    } finally {
      setLoadingEpisodes(false);
    }
  }

  const handleSeasonChange = (seasonNum: number) => {
    playGlassClick();
    setSelectedSeason(seasonNum);
    if (movie) {
      loadSeasonEpisodes(movie.tmdbId || movie.id, seasonNum);
    }
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
        <span className="text-xs text-[#7A6165] font-serif">Retrieving curated cinema folios...</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#231215]">Cinematic work not found</h2>
        <Link href="/" className="px-6 py-2.5 rounded-full btn-terracotta text-xs font-medium">
          Return to Film Salon
        </Link>
      </div>
    );
  }

  const isTv = movie.type === 'tv';
  const watchUrl = isTv
    ? `/watch/${movie.id}?type=tv&season=${selectedSeason}&episode=1`
    : `/watch/${movie.id}`;

  return (
    <div className="w-full space-y-8 select-none">
      {/* Top navigation row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { playGlassClick(); router.back(); }}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] text-xs font-semibold text-[#54383B] transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7A242B]" />
          <span>Back</span>
        </button>
      </div>

      {/* Hero Showcase Container with Large Cinematic Backdrop */}
      <div className="relative w-full rounded-3xl sm:rounded-[2.4rem] overflow-hidden border border-[#E5DDD2] shadow-sm bg-[#FFFDFB]">
        {/* Backdrop Image */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-95"
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#231215] via-[#231215]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#231215] via-[#231215]/40 to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Movie Poster */}
          <div className="w-48 sm:w-60 aspect-[2/3] rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl shrink-0 group">
            <img
              src={movie.posterUrl || movie.backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-4">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${
                isTv ? 'bg-[#7A242B] text-white' : 'bg-[#541B21] text-white'
              }`}>
                {isTv ? 'Episodic Series' : 'Feature Film'}
              </span>

              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs text-white backdrop-blur-md font-medium shadow-xs"
                >
                  {g}
                </span>
              ))}
              <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#FAF5EE]/95 text-[#231215] border border-[#E8DFD4] shadow-xs tabular-nums">
                <Star className="w-3.5 h-3.5 fill-[#C27803] text-[#C27803]" />
                {movie.rating.toFixed(1)}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
              {movie.title}
            </h1>

            {/* Meta Row */}
            <div className="flex items-center gap-4 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-200" />
                {movie.releaseDate || movie.releaseYear}
              </span>
              {movie.runtime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-200" />
                  {movie.runtime}
                </span>
              )}
              {isTv && movie.seasons && (
                <span className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-amber-200" />
                  {movie.seasons} Season{movie.seasons > 1 ? 's' : ''}
                </span>
              )}
              {movie.director && (
                <span>Auteur / Director: <strong className="text-white font-bold">{movie.director}</strong></span>
              )}
            </div>

            {/* Overview */}
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl pt-1 font-normal">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 flex-wrap">
              <Link
                href={watchUrl}
                onClick={playGlassClick}
                onMouseEnter={playGlassHover}
                className="flex items-center gap-2 px-8 py-3 rounded-full btn-terracotta text-white font-semibold text-xs sm:text-sm tracking-wide shadow-md"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isTv ? 'Screen Episodes' : 'Screen Feature Film'}</span>
              </Link>

              <button
                onClick={() => { playGlassClick(); setTrailerModalOpen(true); }}
                onMouseEnter={playGlassHover}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium text-xs sm:text-sm backdrop-blur-xl shadow-xs transition"
              >
                <Film className="w-4 h-4 text-white" />
                <span>Trailer Preview</span>
              </button>

              <button
                onClick={togglePlaylist}
                onMouseEnter={playGlassHover}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border text-xs sm:text-sm font-medium backdrop-blur-xl transition shadow-xs ${
                  inList
                    ? 'bg-[#7A242B] border-[#7A242B] text-white'
                    : 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
                }`}
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{inList ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal Popup */}
      {trailerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231215]/50 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setTrailerModalOpen(false)} />
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-2xl overflow-hidden z-10 p-5 text-[#231215]">
            <div className="flex items-center justify-between pb-3 px-2 border-b border-[#F0E8DD]">
              <h3 className="font-serif text-sm font-bold text-[#231215] flex items-center gap-2">
                <Film className="w-4 h-4 text-[#7A242B]" />
                Official Trailer &bull; {movie.title}
              </h3>
              <button
                onClick={() => setTrailerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F6EFE6] text-[#7A242B] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full aspect-video rounded-2xl overflow-hidden mt-3 bg-black">
              {movie.trailerUrl?.includes('youtube.com') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${movie.trailerUrl.split('v=')[1]}?autoplay=1`}
                  title={`${movie.title} Trailer`}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={movie.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* TV Series Seasons & Episodes Explorer */}
      {isTv && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5DDD2]">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#231215] tracking-tight flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#7A242B]" />
                Seasons &amp; Episodic Chronicles
              </h2>
              <p className="text-xs text-[#6E5558] font-normal">Select a season and episode to stream directly via nxsha.space.</p>
            </div>

            {/* Season Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {Array.from({ length: movie.seasons || 1 }).map((_, idx) => {
                const sNum = idx + 1;
                const isActive = selectedSeason === sNum;
                return (
                  <button
                    key={sNum}
                    onClick={() => handleSeasonChange(sNum)}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition shadow-xs ${
                      isActive
                        ? 'bg-[#7A242B] text-white shadow-xs'
                        : 'bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] text-[#54383B]'
                    }`}
                  >
                    Season {sNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Episode Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {loadingEpisodes ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD2] animate-pulse" />
              ))
            ) : (
              episodesList.map((ep) => (
                <Link
                  key={ep.episodeNumber}
                  href={`/watch/${movie.id}?type=tv&season=${selectedSeason}&episode=${ep.episodeNumber}`}
                  onClick={playGlassClick}
                  onMouseEnter={playGlassHover}
                  className="p-4 rounded-2xl bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] transition group flex items-start justify-between gap-3 shadow-xs hover:shadow-md"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#7A242B] uppercase tracking-wide">
                      Ep {ep.episodeNumber}
                    </span>
                    <h4 className="font-serif text-xs font-bold text-[#231215] group-hover:text-[#7A242B] transition-colors line-clamp-1">
                      {ep.name}
                    </h4>
                    <p className="text-[11px] text-[#7A6165] line-clamp-2 leading-relaxed">
                      {ep.overview || `Season ${selectedSeason} Episode ${ep.episodeNumber}.`}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F2] group-hover:bg-[#7A242B] text-[#54383B] group-hover:text-white flex items-center justify-center transition shadow-xs shrink-0 mt-1">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {/* Cast & Crew Section */}
      {movie.cast && movie.cast.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-base font-bold text-[#231215] tracking-tight">Top Billed Cast &amp; Auteurs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {movie.cast.map((actor, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] flex flex-col items-center text-center space-y-2 group shadow-xs hover:shadow-md transition"
              >
                <div className="w-14 h-14 rounded-full bg-[#7A242B] p-0.5 overflow-hidden shadow-xs">
                  {actor.avatarUrl ? (
                    <img src={actor.avatarUrl} alt={actor.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-[#F4ECE1] rounded-full flex items-center justify-center text-[#7A242B]">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <h4 className="font-serif text-xs font-bold text-[#231215] truncate">{actor.name}</h4>
                  <p className="text-[10px] text-[#7A6165] font-normal truncate">{actor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Movies Carousel / Grid */}
      {movie.similar && movie.similar.length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="font-serif text-base font-bold text-[#231215] tracking-tight">Curatorial Similar Recommendations</h2>
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

export default function MovieDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#7A242B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#7A6165] font-serif">Loading cinematic archive details...</span>
        </div>
      }
    >
      <MovieDetailsContent />
    </Suspense>
  );
}
