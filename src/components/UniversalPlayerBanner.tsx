'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, Play, Upload, Youtube, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { playGlassClick, playGlassHover } from '@/lib/sound';

export const UniversalPlayerBanner: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handlePlayUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!videoUrl.trim()) {
      router.push('/player');
      return;
    }
    playGlassClick();
    router.push(`/player?url=${encodeURIComponent(videoUrl.trim())}`);
  };

  const handleFileSelect = (file: File) => {
    playGlassClick();
    setSelectedFileName(file.name);
    // Create an object URL and navigate to /player
    const blobUrl = URL.createObjectURL(file);
    try {
      sessionStorage.setItem('cinverse_local_video_name', file.name);
      sessionStorage.setItem('cinverse_local_video_url', blobUrl);
    } catch {
      // Fallback
    }
    router.push('/player?mode=local');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full rounded-[2.5rem] p-[1.5px] overflow-hidden select-none neon-border-glow shadow-xl">
      {/* Inner Crystalline Liquid Glass Card */}
      <div className="relative w-full rounded-[2.45rem] bg-white/90 backdrop-blur-3xl p-5 sm:p-7 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 border border-white">
        {/* Left Branding & Capabilities */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-cyan-500 p-[1.5px] shadow-md shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-indigo-600">
              <Tv className="w-6 h-6" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Universal Cinema Player
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-rose-500" />
                Live Instant Play
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md font-medium mt-0.5">
              Paste any YouTube link to auto-play instantly, or drop your local video files with crystalline visionOS controls.
            </p>
          </div>
        </div>

        {/* Center: Interactive URL Input & Drop Zone */}
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          {/* Quick-Paste Input */}
          <form
            onSubmit={handlePlayUrl}
            className="w-full sm:flex-1 relative flex items-center"
          >
            <div className="absolute left-3.5 flex items-center pointer-events-none text-rose-600">
              <Youtube className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or video link..."
              className="w-full pl-10 pr-24 py-3 rounded-2xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-indigo-500 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none transition shadow-inner"
            />

            <button
              type="submit"
              onClick={playGlassClick}
              onMouseEnter={playGlassHover}
              className="absolute right-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Play</span>
            </button>
          </form>

          {/* Local Video Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              playGlassClick();
              fileInputRef.current?.click();
            }}
            onMouseEnter={playGlassHover}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-dashed transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
              isDragging
                ? 'bg-indigo-50 border-indigo-400 text-indigo-700 scale-102'
                : 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-300 text-slate-700'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept="video/mp4,video/webm,video/mkv,video/*"
              className="hidden"
            />
            {selectedFileName ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {selectedFileName}
                </span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold whitespace-nowrap text-slate-700">
                  Drop Local File
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Open Cinema Player Button */}
        <div className="shrink-0 flex items-center justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => {
              playGlassClick();
              router.push('/player');
            }}
            onMouseEnter={playGlassHover}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 group"
          >
            <span>Open Cinema Player</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
