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
  'Oppenheimer',
  'Past Lives',
  'Spirited Away',
  'Succession',
  'The Godfather',
  'Demon Slayer',
  'Dune',
  'Blade Runner 2049',
  'Parasite',
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
        {/* Soft Ambient Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playGlassClick();
            onClose();
          }}
          className="fixed inset-0 bg-[#231215]/50 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-2xl p-6 sm:p-7 z-10 text-[#231215]"
        >
          {/* Search Header Bar */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#F0E8DD]">
            <Search className="w-5 h-5 text-[#7A242B] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search masterworks, directors, series (Interstellar, Dune, Miyazaki...)"
              className="flex-1 bg-transparent border-none outline-none text-[#231215] placeholder:text-[#9C8A8D] text-sm sm:text-base font-medium"
            />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 rounded-full hover:bg-[#F6EFE6] text-[#7A242B] transition"
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
                  ? 'bg-[#7A242B] text-white animate-pulse'
                  : 'hover:bg-[#F6EFE6] text-[#695155] hover:text-[#231215]'
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
              className="p-2 rounded-full hover:bg-[#F6EFE6] text-[#695155] hover:text-[#231215] transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results / Suggestions Container */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-2">
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#695155]">
                <Loader2 className="w-6 h-6 animate-spin text-[#7A242B]" />
                <span className="text-xs font-serif">
                  Searching universal film archive...
                </span>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-10 text-center text-[#695155] text-xs font-medium space-y-2">
                <p>
                  No matching titles found for &ldquo;
                  <span className="text-[#231215] font-serif font-bold">{query}</span>&rdquo;.
                </p>
                <p className="text-[11px] text-[#9C8A8D]">
                  Try searching an auteur, actor, or alternative title.
                </p>
              </div>
            )}

            {!loading && !query && (
              <div className="py-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#231215]">
                  <Sparkles className="w-3.5 h-3.5 text-[#7A242B]" />
                  <span>Curatorial Recommendations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SEARCH_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      onMouseEnter={playGlassHover}
                      className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4ECE1] border border-[#E5DDD2] text-xs font-medium text-[#483034] hover:text-[#7A242B] transition shadow-xs"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Movie Results List */}
            {!loading && results.map((movie, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={movie.id}
                  onClick={() => handleSelect(movie, 'watch')}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF5EE] border border-[#E5DDD2]'
                      : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={movie.posterUrl || movie.backdropUrl}
                      alt={movie.title}
                      className="w-11 h-14 object-cover rounded-xl shrink-0 border border-[#E5DDD2]"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-serif text-sm font-bold text-[#231215] truncate">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-[#7A6165] flex items-center gap-2 tabular-nums">
                        {movie.releaseYear && <span>{movie.releaseYear}</span>}
                        {movie.rating ? (
                          <span className="flex items-center gap-0.5 font-bold text-[#C27803]">
                            ★ {movie.rating.toFixed(1)}
                          </span>
                        ) : null}
                        {movie.genres?.[0] && (
                          <span className="text-[10px] uppercase font-sans tracking-wider text-[#7A242B]">
                            {movie.genres[0]}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(movie, 'details');
                      }}
                      className="p-2 rounded-full hover:bg-white text-[#695155] hover:text-[#7A242B] transition"
                      title="View Notes"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(movie, 'watch');
                      }}
                      className="p-2 rounded-full bg-[#7A242B] text-white hover:bg-[#641C22] transition shadow-xs"
                      title="Screen Movie"
                    >
                      <Play className="w-4 h-4 fill-white" />
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
