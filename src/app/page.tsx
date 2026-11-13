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
  Quote,
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
  { name: 'Action', icon: Zap },
  { name: 'Sci-Fi', icon: Sparkles },
  { name: 'Adventure', icon: Compass },
  { name: 'Animation', icon: Film },
  { name: 'Thriller', icon: Flame },
  { name: 'Horror', icon: Skull },
  { name: 'Crime', icon: Shield },
  { name: 'Romance', icon: Heart },
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
    <div className="w-full space-y-10 pb-12 select-none">
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
          2. Words of Wisdom / Cinéaste Dialogue (Inspired by Reference)
      ======================================================== */}
      <section className="w-full rounded-3xl sm:rounded-[2.4rem] p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#FFFDFB] via-[#FAF5EE] to-[#F5ECE0] border border-[#E5DDD2] shadow-sm text-center relative overflow-hidden select-none">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-px bg-[#7A242B]/30" />
            <span className="font-serif italic text-xs tracking-[0.25em] uppercase text-[#7A242B] font-semibold">
              Words of Wisdom • Curatorial Creed
            </span>
            <div className="w-10 h-px bg-[#7A242B]/30" />
          </div>

          <blockquote className="font-serif text-xl sm:text-3xl lg:text-[2.2rem] text-[#231215] font-normal leading-relaxed italic">
            “Cinema is a matter of what’s in the frame and what’s out. It is the sacred mirror through which we discover the quietest depths of human emotion.”
          </blockquote>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-sans text-[#786164]">
            <span className="font-semibold text-[#541B21]">Martin Scorsese &amp; Federico Fellini</span>
            <span>•</span>
            <span>Cinéverse Curatorial Archives</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. Universal YouTube & Local Video Screening Salon
      ======================================================== */}
      <section className="w-full">
        <UniversalPlayerBanner />
      </section>

      {/* ========================================================
          4. Continue Your Screenings Rail
      ======================================================== */}
      <section className="w-full">
        <ContinueWatchingSection />
      </section>

      {/* ========================================================
          5. Top 10 Curated Masterpieces & Trending Feature Films
      ======================================================== */}
      <section className="w-full">
        <MovieShelf
          title="Curated Masterpieces &amp; Trending Features"
          icon={Flame}
          seeAllHref="/movies?category=trending"
          movies={trendingMovies.length > 0 ? trendingMovies : INITIAL_MOVIES}
          onOpenDetails={(m) => setSelectedMovie(m)}
          showRankNumber={true}
          aspectRatio="backdrop"
        />
      </section>

      {/* ========================================================
          6. Episodic Chronicles & TV Series
      ======================================================== */}
      <section className="w-full">
        <MovieShelf
          title="Episodic Chronicles &amp; Television Series"
          icon={Tv}
          seeAllHref="/tv"
          movies={tvShows.length > 0 ? tvShows : INITIAL_MOVIES.filter((m) => m.type === 'tv')}
          onOpenDetails={(m) => setSelectedMovie(m)}
          aspectRatio="backdrop"
        />
      </section>

      {/* ========================================================
          7. The Boutique Anime Vault
      ======================================================== */}
      <section className="w-full">
        <MovieShelf
          title="The Boutique Anime Vault"
          icon={Sparkles}
          seeAllHref="/anime"
          movies={animeList.length > 0 ? animeList : INITIAL_MOVIES}
          onOpenDetails={(m) => setSelectedMovie(m)}
          aspectRatio="poster"
        />
      </section>

      {/* ========================================================
          8. Criterion Selections & Award Winners
      ======================================================== */}
      <section className="w-full">
        <MovieShelf
          title="Criterion Selections &amp; Award Winners"
          icon={Award}
          seeAllHref="/movies?category=top_rated"
          movies={topRated.length > 0 ? topRated : INITIAL_MOVIES}
          onOpenDetails={(m) => setSelectedMovie(m)}
          aspectRatio="backdrop"
        />
      </section>

      {/* ========================================================
          9. Curated by Cinematic Genre
      ======================================================== */}
      <section className="w-full space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#7A242B]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231215] tracking-tight">
              Curated by Cinematic Genre
            </h2>
          </div>
          <Link
            href="/genres"
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] font-semibold text-[#54383B] hover:text-[#231215] transition border border-[#E5DDD2] shadow-xs"
          >
            All Classifications
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {QUICK_GENRES.map((genre) => {
            const Icon = genre.icon;
            return (
              <Link
                key={genre.name}
                href={`/explore?genre=${encodeURIComponent(genre.name)}`}
                className="p-4 rounded-2xl border border-[#E5DDD2] bg-[#FFFDFB] hover:bg-[#FAF6F0] flex flex-col items-center text-center gap-2.5 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xs hover:shadow-md group"
              >
                <div className="p-2 rounded-xl bg-[#F6ECE6] text-[#7A242B] group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4 text-[#7A242B]" />
                </div>
                <span className="font-serif text-xs font-bold text-[#231215] group-hover:text-[#7A242B] transition-colors">
                  {genre.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          10. Personalized Curatorial Recommendations
      ======================================================== */}
      <section className="w-full pt-1">
        <RecommendedCarousel
          title="Personalized Curatorial Recommendations"
          seeAllHref="/movies"
          movies={recommendedMovies.length > 0 ? recommendedMovies : INITIAL_MOVIES}
          onOpenDetails={(movie) => setSelectedMovie(movie)}
        />
      </section>

      {/* Interactive Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
