'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Compass,
  SlidersHorizontal,
  Star,
  Calendar,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Award,
  Clock,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieCard } from '@/components/MovieCard';
import { MovieDetailsModal } from '@/components/MovieDetailsModal';
import { getMovies } from '@/lib/api';
import { Movie } from '@/lib/types';
import { GENRES_LIST, INITIAL_MOVIES } from '@/lib/mockData';
import { playGlassClick, playGlassHover } from '@/lib/sound';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialGenre = searchParams.get('genre') || 'All';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedYear, setSelectedYear] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [selectedSort, setSelectedSort] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const categories = [
    { id: 'all', label: 'All Titles', icon: Layers },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'popular', label: 'Popular', icon: Sparkles },
    { id: 'top_rated', label: 'Top Rated', icon: Award },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
  ];

  const years = ['All', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  useEffect(() => {
    async function loadExploreData() {
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
          setMovies(INITIAL_MOVIES);
          setTotalPages(1);
        }
      } catch {
        setMovies(INITIAL_MOVIES);
      } finally {
        setLoading(false);
      }
    }

    loadExploreData();
  }, [activeCategory, selectedGenre, selectedYear, minRating, selectedSort, currentPage]);

  // Client-side quick filter for instantaneous typing responses
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;
    const q = searchQuery.toLowerCase().trim();
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres?.some((g) => g.toLowerCase().includes(q)) ||
        m.overview?.toLowerCase().includes(q)
    );
  }, [movies, searchQuery]);

  const handlePageChange = (newPage: number) => {
    playGlassClick();
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-6 pb-12 select-none">
      {/* Header Bar */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] liquid-glass-panel border-2 border-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-white/90 backdrop-blur-3xl text-slate-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Cinema &amp; Discover
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-normal">
            Immerse yourself in global cinema, trending blockbusters, award winners, and hidden gems with multi-vector filtering.
          </p>
        </div>

        {/* Live Filter Search Input */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search className="w-4 h-4 text-indigo-600 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search within explore..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
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
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs shrink-0 border ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white/80 hover:bg-white border-white/90 text-slate-700 hover:text-slate-950'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Controls Bar: Genres, Year, Rating, Sort */}
      <div className="p-4 rounded-3xl liquid-glass-panel border-2 border-white flex flex-wrap items-center justify-between gap-4 text-xs bg-white/85 backdrop-blur-2xl text-slate-800 shadow-md">
        {/* Genre Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full lg:max-w-[55%]">
          {GENRES_LIST.slice(0, 10).map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => {
                  playGlassClick();
                  setSelectedGenre(g);
                  setCurrentPage(1);
                }}
                onMouseEnter={playGlassHover}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 border-slate-200'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Dropdowns on Right: Year, Rating, Sort */}
        <div className="flex items-center gap-3 flex-wrap ml-auto">
          {/* Year */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-900 font-semibold rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer shadow-2xs"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-white text-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(parseFloat(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-900 font-semibold rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer shadow-2xs"
            >
              <option value="0">Any Rating</option>
              <option value="8">8.0+ Stars</option>
              <option value="7">7.0+ Stars</option>
              <option value="6">6.0+ Stars</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-900 font-semibold rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer shadow-2xs"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="year">Newest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Movie Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-[2rem] bg-white/70 border-2 border-white shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="py-24 text-center space-y-3 bg-white/80 rounded-[2.5rem] border-2 border-white shadow-lg p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Movies Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your genre filters, year, or search query to find more titles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
          {filteredMovies.map((movie) => (
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
                ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 tabular-nums shadow-xs">
            Page {currentPage} {totalPages > 1 ? `of ${totalPages}` : ''}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition shadow-xs border ${
              currentPage >= totalPages
                ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
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

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-white/60 text-xs font-semibold">
          Loading Explore Catalog...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

