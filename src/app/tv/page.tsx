'use client';

import React, { useState, useEffect } from 'react';
import { Tv, ChevronLeft, ChevronRight, Sparkles, Flame, Award } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { MovieDetailsModal } from '@/components/MovieDetailsModal';
import { getTVShows } from '@/lib/api';
import { Movie } from '@/lib/types';
import { INITIAL_MOVIES } from '@/lib/mockData';
import { playGlassClick, playGlassHover } from '@/lib/sound';

export default function TVSeriesPage() {
  const [series, setSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'popular' | 'trending' | 'top_rated'>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const categories = [
    { id: 'popular', label: 'Popular Shows', icon: Sparkles },
    { id: 'trending', label: 'Trending This Week', icon: Flame },
    { id: 'top_rated', label: 'Top Rated Shows', icon: Award },
  ];

  useEffect(() => {
    async function loadSeries() {
      try {
        setLoading(true);
        const res = await getTVShows({ category: activeCategory, page: currentPage });
        if (res.data && res.data.length > 0) {
          setSeries(res.data);
          setTotalPages((res as any).totalPages || 1);
        } else {
          setSeries(INITIAL_MOVIES.filter((m) => m.type === 'tv'));
          setTotalPages(1);
        }
      } catch {
        setSeries(INITIAL_MOVIES.filter((m) => m.type === 'tv'));
      } finally {
        setLoading(false);
      }
    }

    loadSeries();
  }, [activeCategory, currentPage]);

  const handlePageChange = (newPage: number) => {
    playGlassClick();
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-6 pb-12 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] liquid-glass-panel border-2 border-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-white/90 backdrop-blur-3xl text-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              TV Series &amp; Shows
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Binge-worthy drama, action series, and season releases with multi-server playback.
          </p>
        </div>

        {/* Category Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playGlassClick();
                  setActiveCategory(cat.id as any);
                  setCurrentPage(1);
                }}
                onMouseEnter={playGlassHover}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap shadow-xs ${
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
      </div>

      {/* Series Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-[2rem] bg-slate-100 border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {series.map((item) => (
            <MovieCard
              key={item.id}
              movie={item}
              onOpenDetails={(m) => setSelectedMovie(m)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && series.length > 0 && (
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

      {/* Interactive Movie / TV Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
