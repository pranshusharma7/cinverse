'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Tv,
  Sparkles,
  Award,
  Compass,
  ArrowRight,
  Zap,
  Film,
  Heart,
  Skull,
  Shield,
} from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { UpcomingSection } from '@/components/UpcomingSection';
import { UniversalPlayerBanner } from '@/components/UniversalPlayerBanner';
import { MovieShelf } from '@/components/MovieShelf';
import { RecommendedCarousel } from '@/components/RecommendedCarousel';
import { ContinueWatchingSection } from '@/components/ContinueWatchingSection';
import { MovieDetailsModal } from '@/components/MovieDetailsModal';
import { getMovies, getTVShows, getAnime } from '@/lib/api';
import { Movie } from '@/lib/types';
import { INITIAL_MOVIES } from '@/lib/mockData';
import { playGlassClick, playGlassHover } from '@/lib/sound';

const QUICK_GENRES = [
  { name: 'Action', icon: Zap, color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-400/30' },
  { name: 'Sci-Fi', icon: Sparkles, color: 'from-sky-500/20 to-cyan-500/10', border: 'border-sky-400/30' },
  { name: 'Adventure', icon: Compass, color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-400/30' },
  { name: 'Animation', icon: Film, color: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-400/30' },
  { name: 'Thriller', icon: Flame, color: 'from-indigo-500/20 to-purple-500/10', border: 'border-indigo-400/30' },
  { name: 'Horror', icon: Skull, color: 'from-rose-500/20 to-red-500/10', border: 'border-rose-400/30' },
  { name: 'Crime', icon: Shield, color: 'from-slate-500/20 to-zinc-500/10', border: 'border-slate-400/30' },
  { name: 'Romance', icon: Heart, color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-400/30' },
];

export default function HomePage() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>(() =>
    INITIAL_MOVIES.filter((m) => m.isTrending)
  );
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>(() =>
    INITIAL_MOVIES.filter((m) => m.isUpcoming)
  );
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>(() =>
    INITIAL_MOVIES.filter((m) => m.isTrending)
  );
  const [tvShows, setTvShows] = useState<Movie[]>(() =>
    INITIAL_MOVIES.filter((m) => m.type === 'tv')
  );
  const [animeList, setAnimeList] = useState<Movie[]>(() =>
    INITIAL_MOVIES.filter((m) => m.genres?.includes('Animation') || m.type === 'tv')
  );
  const [topRated, setTopRated] = useState<Movie[]>(() =>
    INITIAL_MOVIES.filter((m) => (m.rating || 0) >= 8.0)
  );
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>(() =>
    INITIAL_MOVIES.filter((m) => !m.isUpcoming)
  );
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [trendingRes, upcomingRes, allRes, tvRes, animeRes] = await Promise.all([
          getMovies({ category: 'trending' }),
          getMovies({ category: 'upcoming' }),
          getMovies(),
          getTVShows({ category: 'popular' }),
          getAnime({ perPage: 10 }),
        ]);

        const trending =
          trendingRes.data?.length > 0
            ? trendingRes.data
            : INITIAL_MOVIES.filter((m) => m.isTrending);

        const upcoming =
          upcomingRes.data?.length > 0
            ? upcomingRes.data
            : INITIAL_MOVIES.filter((m) => m.isUpcoming);

        const all = allRes.data?.length > 0 ? allRes.data : INITIAL_MOVIES;

        const tv =
          tvRes.data?.length > 0
            ? tvRes.data
            : INITIAL_MOVIES.filter((m) => m.type === 'tv');

        const anime =
          animeRes.data?.length > 0
            ? animeRes.data
            : INITIAL_MOVIES.filter((m) => m.genres?.includes('Animation') || m.type === 'tv');

        setFeaturedMovies(trending);
        setTrendingMovies(trending);
        setUpcomingMovies(upcoming);
        setTvShows(tv);
        setAnimeList(anime);
        setTopRated(all.filter((m) => (m.rating || 0) >= 8.0));
        setRecommendedMovies(all.filter((m) => !m.isUpcoming));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        setFeaturedMovies(INITIAL_MOVIES.filter((m) => m.isTrending));
        setTrendingMovies(INITIAL_MOVIES.filter((m) => m.isTrending));
        setUpcomingMovies(INITIAL_MOVIES.filter((m) => m.isUpcoming));
        setTvShows(INITIAL_MOVIES.filter((m) => m.type === 'tv'));
        setAnimeList(INITIAL_MOVIES.filter((m) => m.genres?.includes('Animation')));
        setTopRated(INITIAL_MOVIES.filter((m) => (m.rating || 0) >= 8.0));
        setRecommendedMovies(INITIAL_MOVIES.filter((m) => !m.isUpcoming));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="w-full space-y-9 pb-12 select-none">
      {/* ========================================================
          1. Top Bento Grid: Hero Stage (8 cols) + Upcoming Trailers (4 cols)
      ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <HeroSection
            movies={featuredMovies.length > 0 ? featuredMovies : INITIAL_MOVIES}
            onOpenDetails={(movie) => setSelectedMovie(movie)}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <UpcomingSection
            movies={
              upcomingMovies.length > 0
                ? upcomingMovies
                : INITIAL_MOVIES.filter((m) => m.isUpcoming)
            }
            onOpenDetails={(movie) => setSelectedMovie(movie)}
          />
        </div>
      </section>

      {/* ========================================================
          2. Universal YouTube & Local Video Player Strip
      ======================================================== */}
      <section className="w-full">
        <UniversalPlayerBanner />
      </section>

      {/* ========================================================
          3. Continue Watching Rail (Prominent)
      ======================================================== */}
      <section className="w-full">
        <ContinueWatchingSection />
      </section>

      {/* ========================================================
          4. Top 10 Trending Movies Shelf (With Rank Numbers)
      ======================================================== */}
      <section className="w-full">
        <MovieShelf
          title="Top 10 Trending Cinema"
          icon={Flame}
          seeAllHref="/movies?category=trending"
          movies={trendingMovies.length > 0 ? trendingMovies : INITIAL_MOVIES}
          onOpenDetails={(m) => setSelectedMovie(m)}
          showRankNumber={true}
          aspectRatio="backdrop"
        />
      </section>

      {/* ========================================================
          5. Popular TV Series & Episodic Shows
      ======================================================== */}
      <section className="w-full">
        <MovieShelf
          title="Popular TV Shows &amp; Series"
          icon={Tv}
          seeAllHref="/tv"
          movies={tvShows.length > 0 ? tvShows : INITIAL_MOVIES.filter((m) => m.type === 'tv')}
          onOpenDetails={(m) => setSelectedMovie(m)}
          aspectRatio="backdrop"
        />
      </section>

      {/* ========================================================
          6. Trending Anime Showcase
      ======================================================== */}
      <section className="w-full">
        <MovieShelf
          title="Trending Anime Universe"
          icon={Sparkles}
          seeAllHref="/anime"
          movies={animeList.length > 0 ? animeList : INITIAL_MOVIES}
          onOpenDetails={(m) => setSelectedMovie(m)}
          aspectRatio="poster"
        />
      </section>

      {/* ========================================================
          7. Top Rated Masterpieces & IMDb Top Picks
      ======================================================== */}
      <section className="w-full">
        <MovieShelf
          title="Top Rated Masterpieces"
          icon={Award}
          seeAllHref="/movies?category=top_rated"
          movies={topRated.length > 0 ? topRated : INITIAL_MOVIES}
          onOpenDetails={(m) => setSelectedMovie(m)}
          aspectRatio="backdrop"
        />
      </section>

      {/* ========================================================
          8. Explore by Cinematic Genre
      ======================================================== */}
      <section className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-wide">
              Explore by Cinematic Genre
            </h2>
          </div>
          <Link
            href="/genres"
            className="text-xs px-3.5 py-1.5 rounded-full liquid-glass-pill font-bold text-slate-700 hover:text-slate-950 transition border border-white/80 bg-white/70 shadow-xs"
          >
            All Genres
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {QUICK_GENRES.map((genre) => {
            const Icon = genre.icon;
            return (
              <Link
                key={genre.name}
                href={`/explore?genre=${encodeURIComponent(genre.name)}`}
                className={`p-3.5 rounded-2xl border ${genre.border} bg-white/85 hover:bg-white flex flex-col items-center text-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xs hover:shadow-md backdrop-blur-xl group`}
              >
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {genre.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          9. Recommended For You Carousel
      ======================================================== */}
      <section className="w-full pt-1">
        <RecommendedCarousel
          title="Recommended For You"
          seeAllHref="/movies"
          movies={recommendedMovies.length > 0 ? recommendedMovies : INITIAL_MOVIES}
          onOpenDetails={(movie) => setSelectedMovie(movie)}
        />
      </section>

      {/* Interactive visionOS Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
