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
    <div className="w-full space-y-6">
      <div className="pb-3 border-b border-slate-200/80 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-amber-500 fill-amber-400" />
            News &amp; Popular
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Top trending blockbusters, worldwide box-office sensations and news.
          </p>
        </div>
      </div>

      {/* Featured News Pill Banner */}
      <div className="p-4 rounded-3xl liquid-glass-panel border-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">4K Spatial Audio Stream Enhancements</h3>
            <p className="text-xs text-slate-500 font-medium">
              CINÉVERSE now supports adaptive multi-bitrate HLS streams with liquid refraction visuals.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white px-3.5 py-1.5 rounded-full border border-white shadow-sm">
          <TrendingUp className="w-4 h-4" />
          <span>Updated Hourly</span>
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
