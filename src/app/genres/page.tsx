'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  Flame,
  Zap,
  Shield,
  Sparkles,
  Heart,
  Compass,
  Film,
  Skull,
  ArrowRight,
} from 'lucide-react';
import { playGlassClick, playGlassHover } from '@/lib/sound';

const GENRE_CARDS = [
  {
    name: 'Action',
    desc: 'High-stakes cinematography, visceral combat & thrilling masterstrokes',
    icon: Zap,
    count: '24+ Titles',
  },
  {
    name: 'Sci-Fi',
    desc: 'Speculative futures, quantum wonders & interstellar philosophical voyages',
    icon: Sparkles,
    count: '18+ Titles',
  },
  {
    name: 'Adventure',
    desc: 'Epic journeys, mythical lands & perilous character expeditions',
    icon: Compass,
    count: '15+ Titles',
  },
  {
    name: 'Animation',
    desc: 'Hand-drawn artistry, Studio Ghibli reverence & boundary-pushing anime',
    icon: Film,
    count: '16+ Titles',
  },
  {
    name: 'Crime',
    desc: 'Noir underworlds, moral ambiguity & gripping psychological investigations',
    icon: Shield,
    count: '14+ Titles',
  },
  {
    name: 'Horror',
    desc: 'Auteur horror, atmospheric dread & surreal psychological terror',
    icon: Skull,
    count: '12+ Titles',
  },
  {
    name: 'Thriller',
    desc: 'Hitchcockian suspense, labyrinthine twists & relentless dramatic tension',
    icon: Flame,
    count: '20+ Titles',
  },
  {
    name: 'Romance',
    desc: 'Poetic longing, intimate human connections & heartbreaking romance',
    icon: Heart,
    count: '11+ Titles',
  },
];

export default function GenresPage() {
  return (
    <div className="w-full space-y-6 pb-12 select-none">
      <div className="p-6 sm:p-9 rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-[#231215]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#231215] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A242B] flex items-center justify-center text-white shadow-xs">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span>Cinematic Classifications &amp; Genres</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal mt-1.5">
            Curated archive classified by genre, auteur tone, and atmospheric mood.
          </p>
        </div>

        <Link
          href="/explore"
          onClick={playGlassClick}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full btn-terracotta text-white font-medium text-xs shadow-sm transition shrink-0"
        >
          <span>Open Full Archive Grid</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {GENRE_CARDS.map((genre) => {
          const Icon = genre.icon;
          return (
            <Link
              key={genre.name}
              href={`/explore?genre=${encodeURIComponent(genre.name)}`}
              onClick={playGlassClick}
              onMouseEnter={playGlassHover}
              className="p-6 rounded-3xl bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] flex flex-col justify-between h-56 hover:scale-102 transition-all duration-300 group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-[#F6ECE6] text-[#7A242B] group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#FAF7F2] text-[#6E5558] border border-[#E5DDD2]">
                  {genre.count}
                </span>
              </div>

              <div className="space-y-1.5 pt-4">
                <h3 className="font-serif text-base font-bold text-[#231215] group-hover:text-[#7A242B] transition-colors">
                  {genre.name}
                </h3>
                <p className="text-xs text-[#7A6165] line-clamp-2 leading-relaxed font-normal">
                  {genre.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
