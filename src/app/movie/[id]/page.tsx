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

        // If it's a TV show, load first season episodes
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
        // Fallback episodes
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
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Loading universal cinema details...</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Movie not found</h2>
        <Link href="/" className="px-5 py-2 rounded-full liquid-glass-pill text-xs font-semibold">
          Return to Universe
        </Link>
      </div>
    );
  }

  const isTv = movie.type === 'tv';
  const watchUrl = isTv
    ? `/watch/${movie.id}?type=tv&season=${selectedSeason}&episode=1`
    : `/watch/${movie.id}`;

  return (
    <div className="w-full space-y-8">
      {/* Top navigation row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { playGlassClick(); router.back(); }}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-pill text-xs font-bold text-slate-700 hover:text-slate-950 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* Hero Showcase Container with Large Cinematic Backdrop */}
      <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl bg-[#0c0e18]/90 liquid-gloss">
        {/* Backdrop Image */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-95 scale-102"
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070B] via-[#06070B]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-[#06070B]/40 to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Movie Poster */}
          <div className="w-48 sm:w-60 aspect-[2/3] rounded-3xl overflow-hidden border border-white/25 shadow-2xl shrink-0 group">
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
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase shadow-sm ${
                isTv ? 'bg-sky-500 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isTv ? 'TV Series' : 'Feature Film'}
              </span>

              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs text-white backdrop-blur-md font-bold shadow-sm"
                >
                  {g}
                </span>
              ))}
              <span className="flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-400/30 text-amber-300 border border-amber-400/40 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {movie.rating.toFixed(1)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {movie.title}
            </h1>

            {/* Meta Row */}
            <div className="flex items-center gap-4 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                {movie.releaseDate || movie.releaseYear}
              </span>
              {movie.runtime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-300" />
                  {movie.runtime}
                </span>
              )}
              {isTv && movie.seasons && (
                <span className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-sky-300" />
                  {movie.seasons} Season{movie.seasons > 1 ? 's' : ''}
                </span>
              )}
              {movie.director && (
                <span>Director: <strong className="text-white font-bold">{movie.director}</strong></span>
              )}
            </div>

            {/* Overview */}
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-2xl pt-1 drop-shadow">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 flex-wrap">
              <Link
                href={watchUrl}
                onClick={playGlassClick}
                onMouseEnter={playGlassHover}
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-white text-slate-950 font-black text-sm shadow-xl hover:bg-white/95 hover:scale-105 active:scale-95 transition-all group/play"
              >
                <Play className="w-4 h-4 fill-slate-950 group-hover/play:translate-x-0.5 transition-transform" />
                <span>{isTv ? 'Watch Episodes' : 'Watch Now'}</span>
              </Link>

              <button
                onClick={() => { playGlassClick(); setTrailerModalOpen(true); }}
                onMouseEnter={playGlassHover}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold text-xs sm:text-sm backdrop-blur-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Film className="w-4 h-4 text-white" />
                <span>Trailer</span>
              </button>

              <button
                onClick={togglePlaylist}
                onMouseEnter={playGlassHover}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 text-xs sm:text-sm font-bold backdrop-blur-xl transition-all shadow-lg hover:scale-105 active:scale-95 ${
                  inList
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-white/20 hover:bg-white/30 border-white/40 text-white'
                }`}
              >
                {inList ? <Check className="w-4 h-4 text-indigo-200" /> : <Plus className="w-4 h-4" />}
                <span>{inList ? 'In Playlist' : 'Add to Playlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal Popup */}
      {trailerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fade-in">
          <div className="absolute inset-0" onClick={() => setTrailerModalOpen(false)} />
          <div className="relative w-full max-w-3xl rounded-[2.5rem] bg-white/95 border-2 border-white shadow-2xl overflow-hidden z-10 p-5 backdrop-blur-3xl text-slate-900">
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-200/80">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-600" />
                Official Trailer &bull; {movie.title}
              </h3>
              <button
                onClick={() => setTrailerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
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

      {/* TV Series Seasons & Episodes Explorer (When TV Series) */}
      {isTv && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Tv className="w-5 h-5 text-indigo-600" />
                Seasons &amp; Episodes
              </h2>
              <p className="text-xs text-slate-500 font-medium">Select a season and episode to stream via nxsha.space.</p>
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
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition shadow-sm ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'liquid-glass-pill text-slate-700 hover:text-slate-950 hover:bg-white'
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
                <div key={i} className="h-24 rounded-2xl liquid-glass-card animate-pulse" />
              ))
            ) : (
              episodesList.map((ep) => (
                <Link
                  key={ep.episodeNumber}
                  href={`/watch/${movie.id}?type=tv&season=${selectedSeason}&episode=${ep.episodeNumber}`}
                  onClick={playGlassClick}
                  onMouseEnter={playGlassHover}
                  className="p-3.5 rounded-2xl liquid-glass-card hover:bg-white transition group flex items-start justify-between gap-3 shadow-sm hover:shadow-md"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wide">
                      Ep {ep.episodeNumber}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {ep.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {ep.overview || `Season ${selectedSeason} Episode ${ep.episodeNumber}.`}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white group-hover:bg-indigo-600 text-slate-900 group-hover:text-white flex items-center justify-center transition shadow-sm shrink-0 mt-1">
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
          <h2 className="text-base font-extrabold text-slate-900 tracking-wide">Top Billed Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {movie.cast.map((actor, idx) => (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-white/80 hover:bg-white border border-white/90 flex flex-col items-center text-center space-y-2 group shadow-xs hover:shadow-md transition"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] overflow-hidden shadow-sm">
                  {actor.avatarUrl ? (
                    <img src={actor.avatarUrl} alt={actor.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-indigo-600">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{actor.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{actor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Movies Carousel / Grid */}
      {movie.similar && movie.similar.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 tracking-wide">Similar Recommendations</h2>
          </div>
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
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Loading movie details...</span>
        </div>
      }
    >
      <MovieDetailsContent />
    </Suspense>
  );
}
