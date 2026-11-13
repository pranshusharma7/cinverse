'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookmarkCheck,
  Trash2,
  Play,
  Search,
  SlidersHorizontal,
  Clock,
  Sparkles,
  ArrowRight,
  Film,
  Tv,
} from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { MovieDetailsModal } from '@/components/MovieDetailsModal';
import { getPlaylist, removeFromPlaylist, getContinueWatching } from '@/lib/storage';
import { PlaylistItem, ContinueWatchingItem, Movie } from '@/lib/types';
import { INITIAL_MOVIES } from '@/lib/mockData';
import { playGlassClick, playGlassHover } from '@/lib/sound';

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'movies' | 'tv' | 'history'>('watchlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'rating' | 'title'>('newest');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const loadData = () => {
      const list = getPlaylist();
      if (list.length === 0) {
        setPlaylist([
          { movieId: INITIAL_MOVIES[0].id, movie: INITIAL_MOVIES[0], addedAt: Date.now(), category: 'favorite' },
          { movieId: INITIAL_MOVIES[4].id, movie: INITIAL_MOVIES[4], addedAt: Date.now() - 3600, category: 'watchlist' },
        ]);
      } else {
        setPlaylist(list);
      }
      setContinueWatching(getContinueWatching());
    };

    loadData();
    window.addEventListener('playlist_changed', loadData);
    window.addEventListener('progress_updated', loadData);
    return () => {
      window.removeEventListener('playlist_changed', loadData);
      window.removeEventListener('progress_updated', loadData);
    };
  }, []);

  const handleRemove = (movieId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playGlassClick();
    removeFromPlaylist(movieId);
    setPlaylist((prev) => prev.filter((item) => item.movieId !== movieId));
  };

  const filteredPlaylist = useMemo(() => {
    let list = [...playlist];
    if (activeTab === 'movies') {
      list = list.filter((item) => item.movie.type !== 'tv');
    } else if (activeTab === 'tv') {
      list = list.filter((item) => item.movie.type === 'tv');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.movie.title.toLowerCase().includes(q) ||
          item.movie.genres?.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (selectedSort === 'newest') {
      list.sort((a, b) => b.addedAt - a.addedAt);
    } else if (selectedSort === 'rating') {
      list.sort((a, b) => (b.movie.rating || 0) - (a.movie.rating || 0));
    } else if (selectedSort === 'title') {
      list.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
    }

    return list;
  }, [playlist, activeTab, searchQuery, selectedSort]);

  return (
    <div className="w-full space-y-6 pb-12 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-9 rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-[#231215]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A242B] flex items-center justify-center text-white shadow-xs">
              <BookmarkCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#231215] tracking-tight">
              My Curated Watchlist &amp; Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal">
            Your private bookmarked screenings, auteur collections, and saved chronicles.
          </p>
        </div>

        {/* Live Filter Search */}
        <div className="w-full sm:w-80 relative flex items-center">
          <Search className="w-4 h-4 text-[#7A242B] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved titles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#FAF6F0] focus:bg-[#FFFDFB] border border-[#E5DDD2] focus:border-[#7A242B] text-[#231215] placeholder:text-[#9E8B8E] text-xs sm:text-sm focus:outline-none transition shadow-xs"
          />
        </div>
      </div>

      {/* Tabs Switcher & Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#FFFDFB] border border-[#E5DDD2]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'watchlist', label: `All Saved (${playlist.length})` },
            { id: 'movies', label: 'Feature Films' },
            { id: 'tv', label: 'TV Chronicles' },
            { id: 'history', label: `Screening History (${continueWatching.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playGlassClick();
                  setActiveTab(tab.id as any);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#7A242B] border-[#7A242B] text-white'
                    : 'bg-[#FAF7F2] hover:bg-[#FAF6F0] border-[#E5DDD2] text-[#54383B]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab !== 'history' && (
          <div className="flex items-center gap-1.5 ml-auto text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7A242B]" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-[#FAF7F2] border border-[#E5DDD2] text-[#231215] font-medium rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer"
            >
              <option value="newest">Recently Bookmarked</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {/* Watchlist Grid */}
      {activeTab !== 'history' ? (
        filteredPlaylist.length === 0 ? (
          <div className="py-24 text-center text-[#786164] font-serif text-sm space-y-3">
            <p>Your curated screening list is empty.</p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full btn-terracotta text-xs font-medium"
            >
              <span>Explore Films</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {filteredPlaylist.map((item) => (
              <div key={item.movieId} className="relative group">
                <MovieCard
                  movie={item.movie}
                  onOpenDetails={(m) => setSelectedMovie(m)}
                />
                {/* Quick Delete From List Button */}
                <button
                  onClick={(e) => handleRemove(item.movieId, e)}
                  aria-label="Remove from list"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-[#7A242B] text-white opacity-0 group-hover:opacity-100 transition shadow-md z-20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History Grid */
        continueWatching.length === 0 ? (
          <div className="py-24 text-center text-[#786164] font-serif text-sm">
            No recent screening history found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueWatching.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${item.id}`}
                className="p-3.5 rounded-2xl bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] shadow-xs hover:shadow-md transition flex items-center gap-3.5 group"
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-20 h-14 object-cover rounded-xl shrink-0 border border-[#E5DDD2]"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-serif text-sm font-bold text-[#231215] truncate group-hover:text-[#7A242B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#7A6165] tabular-nums">
                    {item.remainingTimeText || 'Resume screening'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] group-hover:bg-[#7A242B] text-[#54383B] group-hover:text-white flex items-center justify-center transition shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )
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
