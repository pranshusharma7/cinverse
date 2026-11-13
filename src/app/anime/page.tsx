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

  return (
    <div className="w-full space-y-7 pb-12 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-9 rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-[#231215]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A242B] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#231215] tracking-tight">
              The Boutique Anime Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal">
            Japanese animation, high-definition OVA masterpieces, and trending seasonal chronicles.
          </p>
        </div>

        {/* Live Filter Search */}
        <div className="w-full sm:w-80 relative flex items-center">
          <Search className="w-4 h-4 text-[#7A242B] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anime title..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#FAF6F0] focus:bg-[#FFFDFB] border border-[#E5DDD2] focus:border-[#7A242B] text-[#231215] placeholder:text-[#9E8B8E] text-xs sm:text-sm focus:outline-none transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-full text-[#7A242B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {ANIME_GENRES.map((g) => {
          const isActive = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => {
                playGlassClick();
                setSelectedGenre(g);
              }}
              onMouseEnter={playGlassHover}
              className={`px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap border ${
                isActive
                  ? 'bg-[#7A242B] border-[#7A242B] text-white shadow-xs'
                  : 'bg-[#FFFDFB] hover:bg-[#FAF6F0] border-[#E5DDD2] text-[#54383B]'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Anime Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-[#FAF7F2] border border-[#E5DDD2] animate-pulse"
            />
          ))}
        </div>
      ) : filteredAnime.length === 0 ? (
        <div className="py-24 text-center text-[#786164] font-serif text-sm">
          No anime found matching your selection.
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

      {/* Interactive Details Modal */}
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
        <div className="py-24 text-center text-[#786164] font-serif text-sm">
          Loading boutique anime vault...
        </div>
      }
    >
      <AnimeContent />
    </Suspense>
  );
}
