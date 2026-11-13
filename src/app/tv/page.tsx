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
    { id: 'popular', label: 'Celebrated Chronicles', icon: Sparkles },
    { id: 'trending', label: 'Trending This Season', icon: Flame },
    { id: 'top_rated', label: 'Masterpiece Series', icon: Award },
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
      <div className="p-6 sm:p-9 rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-[#231215]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A242B] flex items-center justify-center text-white shadow-xs">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#231215] tracking-tight">
              Episodic Television &amp; Series
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal">
            Compelling dramas, prestige miniseries, and seasonal narratives with direct nxsha.space episode streaming.
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all border whitespace-nowrap shadow-xs ${
                  isActive
                    ? 'bg-[#7A242B] border-[#7A242B] text-white shadow-xs'
                    : 'bg-[#FFFDFB] hover:bg-[#FAF6F0] border-[#E5DDD2] text-[#54383B]'
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
              className="aspect-[2/3] rounded-2xl bg-[#FAF7F2] border border-[#E5DDD2] animate-pulse"
            />
          ))}
        </div>
      ) : series.length === 0 ? (
        <div className="py-24 text-center text-[#786164] font-serif text-sm">
          No television chronicles available in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {series.map((show) => (
            <MovieCard
              key={show.id}
              movie={show}
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
            Volume {currentPage} {totalPages > 1 ? `of ${totalPages}` : ''}
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

      {/* Interactive Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
