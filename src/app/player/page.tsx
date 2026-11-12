'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Youtube,
  FileVideo,
  Keyboard,
  ShieldCheck,
  Zap,
  Tv,
} from 'lucide-react';
import { UnifiedPlayer } from '@/components/UnifiedPlayer';
import { playGlassClick, playGlassHover } from '@/lib/sound';

function PlayerContent() {
  const searchParams = useSearchParams();
  const initialYt = searchParams.get('yt') || searchParams.get('url') || undefined;
  const initialMode = (searchParams.get('mode') as 'youtube' | 'local') || (initialYt ? 'youtube' : 'youtube');

  return (
    <div className="w-full space-y-6">
      {/* Top Navigation Pill & Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/"
          onClick={playGlassClick}
          onMouseEnter={playGlassHover}
          className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-pill text-xs font-bold text-slate-700 hover:text-slate-950 transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Feature Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs">
            <Youtube className="w-3.5 h-3.5 text-rose-600" />
            <span>YouTube Instant Play</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
            <FileVideo className="w-3.5 h-3.5 text-indigo-600" />
            <span>Local Video Engine</span>
          </div>
        </div>
      </div>

      {/* Main Page Title Header */}
      <div className="p-6 rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border-2 border-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-md">
              <Tv className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Universal Cinema Player
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-xl">
            Unified player for YouTube &amp; Local Video files. Paste any YouTube link to play immediately, or drop your local video files directly into the player.
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto-play on Paste</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Client Privacy</span>
          </div>
        </div>
      </div>

      {/* Main Unified Video Player Component with Liquid Glass Outer Glow */}
      <div className="w-full rounded-[36px] p-2 liquid-glass-panel border-2 border-white shadow-2xl backdrop-blur-3xl">
        <UnifiedPlayer
          initialMode={initialMode}
          initialYouTubeUrl={initialYt}
        />
      </div>

      {/* Shortcuts & Guide Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Instant YouTube Features */}
        <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-xl border-2 border-white shadow-md space-y-2.5 text-slate-900">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <Youtube className="w-4 h-4" />
            <span>YouTube Instant Mode</span>
          </div>
          <h3 className="text-sm font-black text-slate-900">Paste Link &amp; Watch Instantly</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Paste any link from YouTube, YouTube Shorts, or youtu.be. The player extracts the video ID and begins playback with zero waiting. Supports timestamps (e.g. ?t=90s).
          </p>
        </div>

        {/* Card 2: Local Video Player Features */}
        <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-xl border-2 border-white shadow-md space-y-2.5 text-slate-900">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <FileVideo className="w-4 h-4" />
            <span>Local Video Engine</span>
          </div>
          <h3 className="text-sm font-black text-slate-900">Drag &amp; Drop Any Video File</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Drag any MP4, WebM, MKV, or MOV video file directly onto the player. Custom liquid-glass controls include timeline scrubbing, speed control, loop, subtitles, and PiP.
          </p>
        </div>

        {/* Card 3: Keyboard Shortcuts */}
        <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-xl border-2 border-white shadow-md space-y-2.5 text-slate-900">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Keyboard className="w-4 h-4" />
            <span>Cinema Keyboard Shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span>Space</span>
              <span className="font-bold text-slate-900">Play / Pause</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span>F</span>
              <span className="font-bold text-slate-900">Fullscreen</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span>M</span>
              <span className="font-bold text-slate-900">Mute</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span>T</span>
              <span className="font-bold text-slate-900">Theater</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Loading Universal Player...</span>
        </div>
      }
    >
      <PlayerContent />
    </Suspense>
  );
}

