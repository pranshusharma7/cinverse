'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getContinueWatching } from '@/lib/storage';
import { ContinueWatchingItem } from '@/lib/types';
import { playGlassClick, playGlassHover } from '@/lib/sound';

export const ContinueWatchingSection: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    const loadItems = () => {
      setItems(getContinueWatching());
    };

    loadItems();
    window.addEventListener('progress_updated', loadItems);
    return () => window.removeEventListener('progress_updated', loadItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="w-full select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#7A242B]" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#231215] tracking-tight">
            Continue Your Screenings
          </h2>
        </div>
      </div>

      {/* Rail of Compact Horizontal Editorial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.slice(0, 4).map((item) => {
          const progressPercent =
            item.durationSeconds > 0
              ? Math.min(100, Math.max(5, Math.round((item.progressSeconds / item.durationSeconds) * 100)))
              : 48;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => {
                playGlassClick();
                router.push(`/watch/${item.id}`);
              }}
              onMouseEnter={playGlassHover}
              className="group flex items-center justify-between p-2.5 rounded-2xl bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E5DDD2] shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              {/* Thumbnail with Terracotta Progress Bar */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-14 h-12 rounded-xl overflow-hidden shrink-0 border border-[#E5DDD2] shadow-xs">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                  {/* Terracotta Bottom Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                    <div
                      className="h-full bg-[#7A242B]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Title & Tabular Remaining Time Typography */}
                <div className="min-w-0 flex-1 pr-2 space-y-0.5">
                  <h3 className="font-serif text-xs font-bold text-[#231215] truncate group-hover:text-[#7A242B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-[#786164] font-medium truncate tabular-nums flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7A242B]" />
                    <span>{item.remainingTimeText || `${Math.max(10, 100 - progressPercent)}m remaining`}</span>
                  </p>
                </div>
              </div>

              {/* Play Button */}
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] group-hover:bg-[#7A242B] text-[#54383B] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs shrink-0">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
