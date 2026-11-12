'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Star,
  Play,
  Film,
  Search,
  X,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Tv,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieCard } from '@/components/MovieCard';
import { MovieDetailsModal } from '@/components/MovieDetailsModal';
import { getAnime } from '@/lib/api';
import { Movie } from '@/lib/types';
import { INITIAL_MOVIES } from '@/lib/mockData';
import { playGlassClick, playGlassHover } from '@/lib/sound';

const ANIME_GENRES = [
  'All',
  'Action',
  'Fantasy',
  'Animation',
  'Sci-Fi',
  'Adventure',
  'Drama',
  'Comedy',
  'Supernatural',
];

function AnimeContent() {
  const [animeList, setAnimeList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'trending' | 'popular' | 'top_rated'>('trending');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function loadAnime() {
      try {
        setLoading(true);
        const res = await getAnime({ page: currentPage, perPage: 18 });
        if (res.data && res.data.length > 0) {
          setAnimeList(res.data);
        } else {
          setAnimeList(INITIAL_MOVIES.filter((m) => m.genres?.includes('Animation') || m.type === 'tv'));
        }
      } catch {
        setAnimeList(INITIAL_MOVIES.filter((m) => m.genres?.includes('Animation') || m.type === 'tv'));
      } finally {
        setLoading(false);
      }
    }

    loadAnime();
  }, [currentPage]);

  // Client-side quick filter
  const filteredAnime = useMemo(() => {
    let list = [...animeList];
    if (selectedGenre !== 'All') {
      list = list.filter((a) => a.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.genres?.some((g) => g.toLowerCase().includes(q)) ||
          a.overview?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [animeList, selectedGenre, searchQuery]);

  const spotlightAnime = animeList[0] || INITIAL_MOVIES[0];

  return (
    <div className="w-full space-y-7 pb-12 select-none">
      {/* Anime Hero Spotlight */}
      {spotlightAnime && (
        <div className="relative w-full h-[400px] sm:h-[450px] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl group liquid-gloss bg-[#0c0e18]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${spotlightAnime.backdropUrl || spotlightAnime.posterUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06070B] via-[#06070B]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070B] via-[#06070B]/40 to-transparent" />

          <div className="relative z-10 w-full h-full flex flex-col justify-between p-7 sm:p-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-200 text-xs font-bold backdrop-blur-xl shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Featured Anime Universe</span>
              </span>

              {spotlightAnime.rating && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 text-xs backdrop-blur-md tabular-nums flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" />
                  Score {spotlightAnime.rating.toFixed(1)}
                </span>
              )}
            </div>

            <div className="max-w-xl space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-display drop-shadow-md">
                {spotlightAnime.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed max-w-lg font-normal">
                {spotlightAnime.overview}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    playGlassClick();
                    setSelectedMovie(spotlightAnime);
                  }}
                  onMouseEnter={playGlassHover}
                  className="px-6 py-2.5 rounded-2xl bg-white hover:bg-white/95 text-slate-950 font-bold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Stream Episodes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Search Bar */}
      <div className="p-5 sm:p-6 rounded-3xl liquid-glass-panel border-2 border-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-2xl text-slate-900 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Anime Catalog &amp; Series
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Discover top-rated anime series, trending releases, and legendary franchises powered by AniList.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="w-full sm:w-72 relative flex items-center">
          <Search className="w-3.5 h-3.5 text-purple-600 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anime titles..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {ANIME_GENRES.map((g) => {
          const isSelected = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => {
                playGlassClick();
                setSelectedGenre(g);
              }}
              onMouseEnter={playGlassHover}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border shadow-xs ${
                isSelected
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/25'
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 border-white/90'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Anime Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-[2rem] bg-slate-100 border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : filteredAnime.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">No Anime Titles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Try adjusting your search query or selecting another genre filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {filteredAnime.map((anime) => (
            <MovieCard
              key={anime.id}
              movie={anime}
              onOpenDetails={(m) => setSelectedMovie(m)}
            />
          ))}
        </div>
      )}

      {/* Interactive Movie / Anime Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}

export default function AnimePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-white/60 text-xs font-semibold">
          Loading Anime Universe...
        </div>
      }
    >
      <AnimeContent />
    </Suspense>
  );
}

