'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, RotateCw, Share2, Plus, Layers, Lock } from 'lucide-react';
import { playGlassClick } from '@/lib/sound';

export const VisionAddressBar: React.FC = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    playGlassClick();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReload = () => {
    playGlassClick();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="w-full flex items-center justify-center pt-2.5 pb-2 px-4 select-none z-40">
      <div className="flex items-center gap-3 liquid-glass-pill px-3.5 py-1.5 rounded-full shadow-lg text-slate-800 transition-all hover:bg-white/80">
        
        {/* Left window pill controls */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-5 rounded-full border border-slate-300 bg-white/50 flex items-center justify-center text-[10px] text-slate-500 hover:bg-white hover:text-slate-800 cursor-pointer transition shadow-sm">
            <span className="w-3 h-1.5 rounded-sm border border-slate-400" />
          </div>
          <button 
            onClick={() => { playGlassClick(); router.back(); }} 
            aria-label="Go back"
            className="p-1 hover:bg-white/70 rounded-full transition text-slate-600 hover:text-slate-950"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { playGlassClick(); router.forward(); }} 
            aria-label="Go forward"
            className="p-1 hover:bg-white/70 rounded-full transition text-slate-600 hover:text-slate-950"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center Pill: URL Address Bar */}
        <div className="flex items-center gap-2.5 bg-white/85 px-4 py-1 rounded-full border border-white text-xs text-slate-900 min-w-[280px] sm:min-w-[340px] justify-between shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer">aA</span>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span className="font-semibold tracking-wide text-slate-900">cineverse.stream</span>
          </div>
          <button 
            onClick={handleReload}
            aria-label="Reload page"
            className="p-0.5 hover:text-slate-950 text-slate-500 transition"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1 text-slate-600">
          <button 
            onClick={() => { playGlassClick(); window.open('/', '_blank'); }}
            title="New Vision Tab" 
            className="p-1 hover:bg-white/70 rounded-full transition hover:text-slate-950"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={handleShare} 
            title={copied ? "Copied Link!" : "Share URL"}
            className="p-1 hover:bg-white/70 rounded-full transition hover:text-slate-950 relative"
          >
            <Share2 className="w-4 h-4" />
            {copied && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 text-white font-medium px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-fade-in">
                Link Copied!
              </span>
            )}
          </button>
          <button 
            title="Spaces & Tabs"
            className="p-1 hover:bg-white/70 rounded-full transition hover:text-slate-950"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
