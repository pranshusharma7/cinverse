'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, Play, Upload, Youtube, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="relative w-full rounded-3xl sm:rounded-[2.2rem] bg-[#FFFDFB] border border-[#E5DDD2] shadow-sm p-6 sm:p-8 select-none">
      <div className="relative w-full flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
        {/* Left Branding & Capabilities */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#7A242B] p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <Tv className="w-6 h-6 text-[#FAF5F0]" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231215] tracking-tight">
                Universal Screening Salon
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#7A242B] border border-[#E8DFD4] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-[#7A242B]" />
                Any Media Format
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#63494D] max-w-md font-normal mt-0.5">
              Screen any web YouTube link or drop local .mp4/.mkv video files directly into the private theatre.
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
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#7A242B]">
              <Youtube className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or custom video link..."
              className="w-full pl-10 pr-24 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#FAF6F0] focus:bg-[#FFFDFB] border border-[#E5DDD2] focus:border-[#7A242B] text-[#231215] placeholder-[#9E8B8E] text-xs sm:text-sm font-medium focus:outline-none transition shadow-xs"
            />

            <button
              type="submit"
              onClick={playGlassClick}
              onMouseEnter={playGlassHover}
              className="absolute right-1.5 px-4 py-1.5 rounded-full btn-terracotta text-white font-medium text-xs flex items-center gap-1 shadow-sm transition"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Screen</span>
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
            className={`w-full sm:w-auto px-4 py-2.5 rounded-full border border-dashed transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
              isDragging
                ? 'bg-[#F4ECE1] border-[#7A242B] text-[#7A242B]'
                : 'bg-[#FAF7F2] hover:bg-[#F4ECE1] border-[#D4C8BB] text-[#54383B]'
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
            <Upload className="w-4 h-4 text-[#7A242B]" />
            <span className="text-xs font-medium truncate max-w-[150px]">
              {selectedFileName || 'Drop Video File'}
            </span>
          </div>

          {/* Open Full Player Page Button */}
          <button
            onClick={() => {
              playGlassClick();
              router.push('/player');
            }}
            onMouseEnter={playGlassHover}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4ECE1] border border-[#D4C8BB] text-[#3D2528] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs shrink-0"
          >
            <span>Cinema Lounge</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#7A242B]" />
          </button>
        </div>
      </div>
    </div>
  );
};
