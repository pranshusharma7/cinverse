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
    { id: 'all', label: 'All Movies' },
    { id: 'popular', label: 'Popular' },
    { id: 'trending', label: 'Trending' },
    { id: 'top_rated', label: 'Top Rated' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'now_playing', label: 'Now Playing' },
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

  // Live dynamic search when typing in filter box
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
      <div className="p-6 sm:p-8 rounded-[2.5rem] liquid-glass-panel border-2 border-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-white/90 backdrop-blur-3xl text-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Feature Films &amp; Movies
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Browse the comprehensive universal movie catalog powered by TMDb streaming architecture.
          </p>
        </div>

        {/* Live Filter Search Input */}
        <div className="w-full sm:w-72 relative flex items-center">
          <Search className="w-4 h-4 text-indigo-600 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search movie title..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition shadow-inner"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700"
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
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap shadow-xs border ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white/80 hover:bg-white border-white/90 text-slate-700 hover:text-slate-950'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl liquid-glass-panel border-2 border-white flex flex-wrap items-center justify-between gap-4 text-xs bg-white/85 backdrop-blur-2xl text-slate-800 shadow-md">
        {/* Genre Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 flex items-center gap-1 font-bold">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Genre:
          </span>
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer shadow-xs"
          >
            {GENRES_LIST.map((g) => (
              <option key={g} value={g} className="bg-white text-slate-900">
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 flex items-center gap-1 font-bold">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Year:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer shadow-xs"
          >
            <option value="All">All Years</option>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014].map((y) => (
              <option key={y} value={y.toString()} className="bg-white text-slate-900">
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(parseFloat(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer shadow-xs"
          >
            <option value="0">Any Rating</option>
            <option value="8">8.0+ Stars</option>
            <option value="7">7.0+ Stars</option>
            <option value="6">6.0+ Stars</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-1.5 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer shadow-xs"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="year">Newest First</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-[2rem] bg-slate-100 border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="py-24 text-center text-slate-500 text-xs font-bold">
          No movies match the selected filters.
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition shadow-xs border ${
              currentPage <= 1
                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'liquid-glass-pill text-slate-700 hover:text-slate-950 hover:bg-white'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-4 py-2 rounded-full bg-white/90 border border-white text-xs font-bold text-slate-800 tabular-nums shadow-xs">
            Page {currentPage} {totalPages > 1 ? `of ${totalPages}` : ''}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition shadow-xs border ${
              currentPage >= totalPages
                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'liquid-glass-pill text-slate-700 hover:text-slate-950 hover:bg-white'
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
        <div className="py-24 text-center text-white/50 text-xs font-semibold">
          Loading universal movie catalog...
        </div>
      }
    >
      <MoviesContent />
    </Suspense>
  );
}
