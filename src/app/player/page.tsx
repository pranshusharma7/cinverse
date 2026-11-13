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
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] text-xs font-semibold text-[#54383B] transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7A242B]" />
          <span>Back to Film Salon</span>
        </Link>

        {/* Feature Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] text-[#7A242B] text-xs font-semibold shadow-xs">
            <Youtube className="w-3.5 h-3.5 text-[#7A242B]" />
            <span>YouTube Stream Link</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] text-[#7A242B] text-xs font-semibold shadow-xs">
            <FileVideo className="w-3.5 h-3.5 text-[#7A242B]" />
            <span>Local Media Player</span>
          </div>
        </div>
      </div>

      {/* Main Page Title Header */}
      <div className="p-6 sm:p-9 rounded-3xl sm:rounded-[2.4rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-[#231215]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#7A242B] text-white shadow-xs">
              <Tv className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231215] tracking-tight">
              Universal Screening Salon
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6E5558] font-normal max-w-xl">
            Stream YouTube links, cinema trailers, or drop private local video files directly into the cinema player with full keyboard shortcuts.
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] text-[#7A242B] text-xs font-medium shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#C27803]" />
            <span>Instant Stream Play</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DFD4] text-[#7A242B] text-xs font-medium shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>100% Client Privacy</span>
          </div>
        </div>
      </div>

      {/* Main Unified Video Player Component */}
      <div className="w-full rounded-3xl sm:rounded-[2.4rem] p-2 bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm">
        <UnifiedPlayer
          initialMode={initialMode}
          initialYouTubeUrl={initialYt}
        />
      </div>

      {/* Shortcuts & Guide Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-xs space-y-2 text-[#231215]">
          <div className="flex items-center gap-2 text-[#7A242B] font-serif font-bold text-xs uppercase tracking-wider">
            <Youtube className="w-4 h-4" />
            <span>YouTube Mode</span>
          </div>
          <h3 className="font-serif text-sm font-bold text-[#231215]">Paste Link &amp; Watch Instantly</h3>
          <p className="text-xs text-[#6E5558] leading-relaxed font-normal">
            Paste any link from YouTube or youtu.be. The salon player parses the stream and initiates instant playback with time-code preservation.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-xs space-y-2 text-[#231215]">
          <div className="flex items-center gap-2 text-[#7A242B] font-serif font-bold text-xs uppercase tracking-wider">
            <FileVideo className="w-4 h-4" />
            <span>Local Media Mode</span>
          </div>
          <h3 className="font-serif text-sm font-bold text-[#231215]">Direct Local File Screening</h3>
          <p className="text-xs text-[#6E5558] leading-relaxed font-normal">
            Drag and drop .mp4, .webm, or .mkv files from your device. Playback runs 100% locally in your browser memory without uploading to any server.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-xs space-y-2 text-[#231215]">
          <div className="flex items-center gap-2 text-[#7A242B] font-serif font-bold text-xs uppercase tracking-wider">
            <Keyboard className="w-4 h-4" />
            <span>Hotkeys &amp; Controls</span>
          </div>
          <h3 className="font-serif text-sm font-bold text-[#231215]">Keyboard Shortcuts</h3>
          <p className="text-xs text-[#6E5558] leading-relaxed font-normal">
            Space (Play/Pause), F (Fullscreen), M (Mute), J/L (Seek 10s Backward/Forward), and T (Cinema Theatre Aspect Ratio).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-[#786164] font-serif text-sm">
          Loading screening salon...
        </div>
      }
    >
      <PlayerContent />
    </Suspense>
  );
}
