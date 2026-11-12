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
          <Clock className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-extrabold text-slate-900 tracking-wide">
            Continue Watching
          </h2>
        </div>
      </div>

      {/* Rail of Compact Horizontal Glass Rows */}
      <div className="flex flex-col gap-2.5">
        {items.slice(0, 4).map((item) => {
          const progressPercent =
            item.durationSeconds > 0
              ? Math.min(100, Math.max(5, Math.round((item.progressSeconds / item.durationSeconds) * 100)))
              : 48;

          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => {
                playGlassClick();
                router.push(`/watch/${item.id}`);
              }}
              onMouseEnter={playGlassHover}
              className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/85 hover:bg-white border border-white shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer backdrop-blur-xl"
            >
              {/* Thumbnail with Glowing Progress Bar */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative w-14 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-xs">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  {/* Glowing Bottom Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Title & Tabular Remaining Time Typography */}
                <div className="min-w-0 flex-1 pr-2 space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold truncate tabular-nums flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{item.remainingTimeText || `${Math.max(10, 100 - progressPercent)}m remaining`}</span>
                  </p>
                </div>
              </div>

              {/* Play / Resume Circular Button */}
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-900 text-slate-900 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
