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

  // Filtered & Sorted items
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
      <div className="p-6 sm:p-8 rounded-[2.5rem] liquid-glass-panel border-2 border-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-white/90 backdrop-blur-3xl text-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <BookmarkCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Cinema Watchlist &amp; Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Your personal library of bookmarked movies, active series, and saved cinema history.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 backdrop-blur-md overflow-x-auto max-w-full">
          <button
            onClick={() => {
              playGlassClick();
              setActiveTab('watchlist');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'watchlist'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            All Saved ({playlist.length})
          </button>
          <button
            onClick={() => {
              playGlassClick();
              setActiveTab('movies');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'movies'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => {
              playGlassClick();
              setActiveTab('tv');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'tv'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Series
          </button>
          <button
            onClick={() => {
              playGlassClick();
              setActiveTab('history');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            History ({continueWatching.length})
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar (When not viewing history) */}
      {activeTab !== 'history' && (
        <div className="p-3.5 rounded-2xl liquid-glass-panel border-2 border-white flex flex-wrap items-center justify-between gap-3 text-xs bg-white/85 backdrop-blur-2xl text-slate-800 shadow-md">
          <div className="flex items-center gap-2 w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-indigo-600 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in watchlist..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-600 font-bold">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-900 font-semibold rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer shadow-2xs"
            >
              <option value="newest">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      {/* Watchlist Grid */}
      {activeTab !== 'history' && (
        <div>
          {filteredPlaylist.length === 0 ? (
            <div className="py-24 text-center space-y-4 bg-white/80 rounded-[2.5rem] border-2 border-white shadow-lg p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <BookmarkCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Your Watchlist is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore movies and click &quot;Add to Watchlist&quot; or the &quot;+&quot; icon to save titles for later streaming.
              </p>
              <Link
                href="/explore"
                onClick={playGlassClick}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow-md shadow-indigo-600/25"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
              {filteredPlaylist.map((item) => (
                <div key={item.movieId} className="relative group/card">
                  <MovieCard
                    movie={item.movie}
                    onOpenDetails={(m) => setSelectedMovie(m)}
                  />
                  {/* Remove Button on Hover */}
                  <button
                    onClick={(e) => handleRemove(item.movieId, e)}
                    className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white opacity-0 group-hover/card:opacity-100 transition shadow-lg backdrop-blur-md"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {continueWatching.length === 0 ? (
            <div className="py-24 text-center text-slate-500 text-xs font-semibold bg-white/80 rounded-[2.5rem] border-2 border-white shadow-lg p-8">
              No watch history yet. Start streaming any movie to track your playback progress.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueWatching.map((item) => {
                const percent =
                  item.durationSeconds > 0
                    ? Math.round((item.progressSeconds / item.durationSeconds) * 100)
                    : 50;

                return (
                  <Link
                    key={item.id}
                    href={`/watch/${item.id}`}
                    onClick={playGlassClick}
                    onMouseEnter={playGlassHover}
                    className="flex items-center gap-4 p-4 rounded-3xl bg-white/85 hover:bg-white border-2 border-white transition group shadow-md backdrop-blur-xl"
                  >
                    <div className="relative w-18 h-18 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium tabular-nums">
                        {item.episodeText || `Left off: ${item.remainingTimeText}`}
                      </p>
                      {/* Mini glowing progress bar */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 shadow-xs"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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
