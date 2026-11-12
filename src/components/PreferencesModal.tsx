'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredPreferences, savePreferences } from '@/lib/storage';
import { GuestPreferences } from '@/lib/types';
import { playGlassClick } from '@/lib/sound';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const [prefs, setPrefs] = useState<GuestPreferences>(getStoredPreferences());

  useEffect(() => {
    if (isOpen) {
      setPrefs(getStoredPreferences());
    }
  }, [isOpen]);

  const handleUpdate = (updates: Partial<GuestPreferences>) => {
    playGlassClick();
    const updated = { ...prefs, ...updates };
    setPrefs(updated);
    savePreferences(updates);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-3xl liquid-glass-panel border-2 border-white shadow-2xl p-6 z-10 space-y-5 text-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1.5px] shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="Guest Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Guest Preferences</h3>
                <p className="text-[11px] text-slate-500 font-medium">Local profile &bull; No login required</p>
              </div>
            </div>
            <button
              onClick={() => { playGlassClick(); onClose(); }}
              className="p-1.5 rounded-full hover:bg-white text-slate-500 hover:text-slate-950 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Liquid Glass Theme Status */}
          <div className="p-3.5 rounded-2xl bg-white/80 border border-white shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Pure Liquid Glass Mode Active</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Ultra-glossy white frosted glass with caustic daylight reflections and fluid refraction.
            </p>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Ambient Daylighting Caustics</span>
                <span className="text-[10px] text-slate-500">Fluid water-like specular refractions</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.ambientGlow}
                onChange={(e) => handleUpdate({ ambientGlow: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Auto-cycle Featured Hero</span>
                <span className="text-[10px] text-slate-500">Seamless slide transitions every 9 seconds</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.autoPlayHero}
                onChange={(e) => handleUpdate({ autoPlayHero: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-white/60 border border-white text-[11px] text-slate-600 font-medium flex items-start gap-2 shadow-sm">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              All playlists, watch history and preferences remain 100% private in local browser storage.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
