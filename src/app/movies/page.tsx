'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  Star,
  Calendar,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  Film,
  X,
} from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { MovieDetailsModal } from '@/components/MovieDetailsModal';
import { getMovies, searchMovies } from '@/lib/api';
import { Movie } from '@/lib/types';
import { GENRES_LIST, INITIAL_MOVIES } from '@/lib/mockData';
import { playGlassClick, playGlassHover } from '@/lib/sound';

function MoviesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedSort, setSelectedSort] = useState('popularity');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const categories = [
    { id: 'all', label: 'All Masterworks' },
    { id: 'popular', label: 'Most Celebrated' },
    { id: 'trending', label: 'Festival Trending' },
    { id: 'top_rated', label: 'Criterion & Top Rated' },
    { id: 'upcoming', label: 'Upcoming Premieres' },
    { id: 'now_playing', label: 'Now in Theatres' },
  ];

  useEffect(() => {
    async function fetchList() {
      try {
        setLoading(true);
        const categoryParam = activeCategory !== 'all' ? (activeCategory as any) : undefined;
        const res = await getMovies({
          type: 'movie',
          category: categoryParam,
          genre: selectedGenre !== 'All' ? selectedGenre : undefined,
          year: selectedYear !== 'All' ? selectedYear : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          sort: selectedSort,
          page: currentPage,
        });

        if (res.data && res.data.length > 0) {
          setMovies(res.data);
          setTotalPages((res as any).totalPages || 1);
        } else {
          setMovies(INITIAL_MOVIES.filter((m) => m.type === 'movie'));
          setTotalPages(1);
        }
      } catch {
        setMovies(INITIAL_MOVIES.filter((m) => m.type === 'movie'));
      } finally {
        setLoading(false);
      }
    }

    fetchList();
  }, [activeCategory, selectedGenre, selectedYear, minRating, selectedSort, currentPage]);

  useEffect(() => {
    if (!searchFilter.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchMovies(searchFilter);
        if (res.data && res.data.length > 0) {
          setMovies(res.data);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Movies page search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchFilter]);

  const handlePageChange = (newPage: number) => {
    playGlassClick();
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-6 pb-12 select-none">
      {/* Header & Title */}
      <div className="p-6 sm:p-9 rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-[#231215]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A242B] flex items-center justify-center text-white shadow-xs">
              <Film className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#231215] tracking-tight">
              Curated Feature Films
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal">
            Browse the comprehensive universal cinema archive powered by direct cinema streaming.
          </p>
        </div>

        {/* Live Filter Search Input */}
        <div className="w-full sm:w-80 relative flex items-center">
          <Search className="w-4 h-4 text-[#7A242B] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search movie title or director..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#FAF6F0] focus:bg-[#FFFDFB] border border-[#E5DDD2] focus:border-[#7A242B] text-[#231215] placeholder:text-[#9E8B8E] text-xs sm:text-sm focus:outline-none transition shadow-xs"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-3 p-1 rounded-full text-[#7A242B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                playGlassClick();
                setActiveCategory(cat.id);
                setCurrentPage(1);
              }}
              onMouseEnter={playGlassHover}
              className={`px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap border ${
                isActive
                  ? 'bg-[#7A242B] border-[#7A242B] text-white shadow-xs'
                  : 'bg-[#FFFDFB] hover:bg-[#FAF6F0] border-[#E5DDD2] text-[#54383B]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#E5DDD2] flex flex-wrap items-center justify-between gap-4 text-xs text-[#231215] shadow-xs">
        {/* Genre Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#6E5558] flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-[#7A242B]" />
            Genre:
          </span>
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#FAF7F2] border border-[#E5DDD2] text-[#231215] font-medium rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer"
          >
            {GENRES_LIST.map((g) => (
              <option key={g} value={g} className="bg-white text-[#231215]">
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#6E5558] flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#7A242B]" />
            Year:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#FAF7F2] border border-[#E5DDD2] text-[#231215] font-medium rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer"
          >
            <option value="All">All Eras</option>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014].map((y) => (
              <option key={y} value={y.toString()} className="bg-white text-[#231215]">
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-[#C27803] fill-[#C27803]" />
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(parseFloat(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#FAF7F2] border border-[#E5DDD2] text-[#231215] font-medium rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer"
          >
            <option value="0">Any Rating</option>
            <option value="8">8.0+ Stars</option>
            <option value="7">7.0+ Stars</option>
            <option value="6">6.0+ Stars</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-1.5 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#7A242B]" />
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#FAF7F2] border border-[#E5DDD2] text-[#231215] font-medium rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer"
          >
            <option value="popularity">Most Celebrated</option>
            <option value="rating">Highest Rated</option>
            <option value="year">Newest Premieres</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-[#FAF7F2] border border-[#E5DDD2] animate-pulse"
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="py-24 text-center text-[#786164] font-serif text-sm">
          No feature films match the selected curatorial filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onOpenDetails={(m) => setSelectedMovie(m)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && movies.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition shadow-xs border ${
              currentPage <= 1
                ? 'opacity-40 cursor-not-allowed bg-[#FAF7F2] border-[#E5DDD2] text-[#9E8B8E]'
                : 'bg-[#FFFDFB] hover:bg-[#FAF6F0] border-[#E5DDD2] text-[#231215]'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-4 py-2 rounded-full bg-[#FFFDFB] border border-[#E5DDD2] text-xs font-semibold text-[#231215] tabular-nums shadow-xs">
            Archive Folio {currentPage} {totalPages > 1 ? `of ${totalPages}` : ''}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition shadow-xs border ${
              currentPage >= totalPages
                ? 'opacity-40 cursor-not-allowed bg-[#FAF7F2] border-[#E5DDD2] text-[#9E8B8E]'
                : 'bg-[#FFFDFB] hover:bg-[#FAF6F0] border-[#E5DDD2] text-[#231215]'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-[#786164] font-serif text-sm">
          Loading curated film archive...
        </div>
      }
    >
      <MoviesContent />
    </Suspense>
  );
}
