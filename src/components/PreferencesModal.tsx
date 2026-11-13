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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231215]/50 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-3xl bg-[#FFFDFB] border border-[#E5DDD2] shadow-2xl p-6 z-10 space-y-5 text-[#231215]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E8DD]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7A242B] p-0.5 shadow-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="Patron Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-[#231215]">Patron Salon Settings</h3>
                <p className="text-[11px] text-[#7A6165] font-medium">Local private profile &bull; Zero login required</p>
              </div>
            </div>
            <button
              onClick={() => { playGlassClick(); onClose(); }}
              className="p-1.5 rounded-full hover:bg-[#F6EFE6] text-[#7A6165] hover:text-[#231215] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Editorial Salon Status */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD2] space-y-1">
            <div className="flex items-center gap-2 text-[#7A242B] font-serif font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Editorial Cinema Architecture</span>
            </div>
            <p className="text-[11px] text-[#63494D] leading-relaxed font-normal">
              Warm alabaster and linen surfaces with artisanal typography inspired by classical editorial publications.
            </p>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif text-xs font-bold text-[#231215] block">Ambient Sunlit Caustics</span>
                <span className="text-[10px] text-[#7A6165]">Gentle architectural atmospheric lighting</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.ambientGlow}
                onChange={(e) => handleUpdate({ ambientGlow: e.target.checked })}
                className="w-4 h-4 rounded accent-[#7A242B] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif text-xs font-bold text-[#231215] block">Auto-cycle Featured Masterworks</span>
                <span className="text-[10px] text-[#7A6165]">Seamless slide transitions every 10 seconds</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.autoPlayHero}
                onChange={(e) => handleUpdate({ autoPlayHero: e.target.checked })}
                className="w-4 h-4 rounded accent-[#7A242B] cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD2] text-[11px] text-[#63494D] font-normal flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              All playlists, screening history, and preferences remain 100% private in local browser storage.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
