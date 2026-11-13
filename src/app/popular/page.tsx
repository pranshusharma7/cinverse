'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Newspaper, TrendingUp } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { getMovies } from '@/lib/api';
import { Movie } from '@/lib/types';
import { INITIAL_MOVIES } from '@/lib/mockData';

export default function PopularPage() {
  const [popular, setPopular] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getMovies({ category: 'trending' });
        setPopular(res.data?.length > 0 ? res.data : INITIAL_MOVIES.filter(m => m.isTrending || (m.rating || 0) >= 8.0));
      } catch {
        setPopular(INITIAL_MOVIES.filter(m => m.isTrending || (m.rating || 0) >= 8.0));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="w-full space-y-6 pb-12 select-none">
      <div className="p-6 sm:p-9 rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm flex items-center justify-between text-[#231215]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#231215] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A242B] flex items-center justify-center text-white shadow-xs">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span>Gazette &amp; Celebrated Cinema</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal mt-1.5">
            Top trending festival releases, worldwide box-office sensations, and curatorial updates.
          </p>
        </div>
      </div>

      {/* Featured News Pill Banner */}
      <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[#231215]">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#F6ECE6] text-[#7A242B] shadow-xs">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#231215]">Artisanal Screening Salon &amp; Direct Streaming</h3>
            <p className="text-xs text-[#6E5558] font-normal">
              CINÉVERSE now features direct nxsha.space cinema streaming with zero extraneous buttons.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#7A242B] bg-[#FAF5EE] px-3.5 py-1.5 rounded-full border border-[#E8DFD4] shadow-xs">
          <TrendingUp className="w-4 h-4" />
          <span>Curated Daily</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {popular.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
