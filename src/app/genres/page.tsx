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
    desc: 'Explosive combat, high-stakes chases & pulse-pounding thrills',
    icon: Zap,
    color: 'from-amber-500/20 via-orange-500/10 to-transparent',
    border: 'border-amber-400/30',
    iconBg: 'bg-amber-500/20 text-amber-300',
    count: '24+ Titles',
  },
  {
    name: 'Sci-Fi',
    desc: 'Futuristic worlds, quantum anomalies & interstellar exploration',
    icon: Sparkles,
    color: 'from-sky-500/20 via-cyan-500/10 to-transparent',
    border: 'border-sky-400/30',
    iconBg: 'bg-sky-500/20 text-sky-300',
    count: '18+ Titles',
  },
  {
    name: 'Adventure',
    desc: 'Epic expeditions, ancient ruins & perilous journeys',
    icon: Compass,
    color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    border: 'border-emerald-400/30',
    iconBg: 'bg-emerald-500/20 text-emerald-300',
    count: '15+ Titles',
  },
  {
    name: 'Animation',
    desc: 'Breathtaking visual animation, heartfelt stories & imaginative anime worlds',
    icon: Film,
    color: 'from-purple-500/20 via-pink-500/10 to-transparent',
    border: 'border-purple-400/30',
    iconBg: 'bg-purple-500/20 text-purple-300',
    count: '16+ Titles',
  },
  {
    name: 'Crime',
    desc: 'Underworld conspiracies, ruthless mobsters & gritty detective stories',
    icon: Shield,
    color: 'from-slate-500/20 via-zinc-500/10 to-transparent',
    border: 'border-slate-400/30',
    iconBg: 'bg-slate-500/20 text-slate-300',
    count: '14+ Titles',
  },
  {
    name: 'Horror',
    desc: 'Psychological terror, supernatural entities & spine-chilling suspense',
    icon: Skull,
    color: 'from-rose-500/20 via-red-500/10 to-transparent',
    border: 'border-rose-400/30',
    iconBg: 'bg-rose-500/20 text-rose-300',
    count: '12+ Titles',
  },
  {
    name: 'Thriller',
    desc: 'Twisted mind games, ticking clocks & breathtaking suspense',
    icon: Flame,
    color: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    border: 'border-indigo-400/30',
    iconBg: 'bg-indigo-500/20 text-indigo-300',
    count: '20+ Titles',
  },
  {
    name: 'Romance',
    desc: 'Passionate drama, emotional connections & unforgettable love stories',
    icon: Heart,
    color: 'from-pink-500/20 via-rose-500/10 to-transparent',
    border: 'border-pink-400/30',
    iconBg: 'bg-pink-500/20 text-pink-300',
    count: '11+ Titles',
  },
];

export default function GenresPage() {
  return (
    <div className="w-full space-y-6 pb-12 select-none">
      <div className="p-6 sm:p-8 rounded-[2.5rem] liquid-glass-panel border border-white/15 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-[#0c0e18]/80 backdrop-blur-3xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <LayoutGrid className="w-7 h-7 text-indigo-400" />
            Cinematic Categories &amp; Genres
          </h1>
          <p className="text-xs sm:text-sm text-white/70 font-normal mt-1">
            Explore movies and shows curated by genre, aesthetic, and mood in pure liquid glass.
          </p>
        </div>

        <Link
          href="/explore"
          onClick={playGlassClick}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-slate-950 font-bold text-xs shadow-lg hover:bg-white/95 transition"
        >
          <span>Open Full Explore Grid</span>
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
              className={`p-6 rounded-[2rem] liquid-glass-card border ${genre.border} bg-gradient-to-br ${genre.color} flex flex-col justify-between h-56 hover:scale-102 transition-all duration-300 group shadow-xl bg-[#090b14]/75 backdrop-blur-2xl`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-2xl ${genre.iconBg} shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/15 shadow-sm backdrop-blur-md">
                  {genre.count}
                </span>
              </div>

              <div className="space-y-1 pt-4">
                <h3 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                  {genre.name}
                </h3>
                <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed font-normal">
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
