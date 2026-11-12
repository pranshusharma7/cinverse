'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Mic, Star, Loader2, Sparkles, Film, Tv, Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMovies } from '@/lib/api';
import { Movie } from '@/lib/types';
import { playGlassClick, playGlassHover } from '@/lib/sound';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie?: (movie: Movie) => void;
}

const SEARCH_SUGGESTIONS = [
  'Interstellar',
  'Avengers',
  'John Wick',
  'Breaking Bad',
  'Stranger Things',
  'Demon Slayer',
  'Attack on Titan',
  'Naruto',
  'One Piece',
  'Fight Club',
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectMovie }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Exactly 350ms debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await searchMovies(query);
        setResults(res.data || []);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  // Keyboard Navigation: ArrowDown, ArrowUp, Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
  };

  // Speech Recognition / Voice Search
  const handleVoiceSearch = () => {
    playGlassClick();
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSelect = (movie: Movie, action: 'watch' | 'details' = 'watch') => {
    playGlassClick();
    onClose();
    if (action === 'details' && onSelectMovie) {
      onSelectMovie(movie);
      return;
    }
    const mediaId = movie.tmdbId || movie.id;
    if (action === 'details') {
      const targetUrl =
        movie.type === 'tv' ? `/movie/${mediaId}?type=tv` : `/movie/${mediaId}`;
      router.push(targetUrl);
    } else {
      const targetUrl =
        movie.type === 'tv' ? `/watch/${mediaId}?type=tv` : `/watch/${mediaId}`;
      router.push(targetUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 select-none">
        {/* Spatial Frosted Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playGlassClick();
            onClose();
          }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl rounded-[2.5rem] bg-white/95 border-2 border-white shadow-2xl backdrop-blur-3xl p-6 sm:p-7 z-10 text-slate-900"
        >
          {/* Search Header Bar */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80">
            <Search className="w-5 h-5 text-indigo-600 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search movies, TV shows, anime (Interstellar, Naruto, Stranger Things...)"
              className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-bold"
            />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Voice Search Button */}
            <button
              onClick={handleVoiceSearch}
              className={`p-2 rounded-full transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                playGlassClick();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results / Suggestions Container */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs font-bold">
                  Searching universal cinema &amp; anime database...
                </span>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-10 text-center text-slate-600 text-xs font-medium space-y-2">
                <p>
                  No matching titles found for &ldquo;
                  <span className="text-slate-900 font-extrabold">{query}</span>&rdquo;.
                </p>
                <p className="text-[11px] text-slate-400">
                  Try searching an actor, alternative title, or anime name.
                </p>
              </div>
            )}

            {!loading && !query && (
              <div className="py-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Popular Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SEARCH_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      onMouseEnter={playGlassHover}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-700 transition shadow-xs"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading &&
              results.map((movie, idx) => {
                const isSelected = selectedIndex === idx;
                const isTv = movie.type === 'tv';
                const isAnime = Boolean(movie.aniListId || movie.id.startsWith('anime-'));

                return (
                  <div
                    key={`${movie.id}-${idx}`}
                    onClick={() => handleSelect(movie)}
                    onMouseEnter={() => {
                      setSelectedIndex(idx);
                      playGlassHover();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl transition cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-50/90 border-2 border-indigo-400/80 shadow-md'
                        : 'bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={movie.posterUrl || movie.backdropUrl}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded-xl border border-white shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {movie.title}
                          </h4>
                          {/* Media Type Badge */}
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                              isAnime
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : isTv
                                ? 'bg-sky-100 text-sky-700 border border-sky-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isAnime ? 'Anime' : isTv ? 'TV' : 'Movie'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
                          {movie.overview}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                          <span className="text-indigo-600 font-bold">
                            {movie.genres?.slice(0, 2).join(', ') || 'Cinema'}
                          </span>
                          <span>•</span>
                          <span className="tabular-nums">{movie.releaseYear || '2024'}</span>
                          {movie.rating ? (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 font-extrabold flex items-center gap-0.5 tabular-nums">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                {movie.rating.toFixed(1)}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(movie, 'details');
                        }}
                        className="text-[11px] font-bold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 transition hidden sm:inline-block shadow-xs"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(movie, 'watch');
                        }}
                        className="text-xs font-bold text-white px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
