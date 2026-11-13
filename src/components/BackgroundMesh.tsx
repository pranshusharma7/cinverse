'use client';

import React, { useEffect, useState } from 'react';

export const BackgroundMesh: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [heroAccent, setHeroAccent] = useState<{ primary: string; secondary: string }>({
    primary: 'rgba(122, 36, 43, 0.08)', // terracotta
    secondary: 'rgba(194, 120, 48, 0.06)', // warm bronze
  });

  useEffect(() => {
    const handleHeroColor = (e: any) => {
      if (e.detail?.primary && e.detail?.secondary) {
        setHeroAccent({
          primary: e.detail.primary,
          secondary: e.detail.secondary,
        });
      }
    };

    window.addEventListener('hero_color_changed', handleHeroColor);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('hero_color_changed', handleHeroColor);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-[#FAF6F0] transition-colors duration-1000 select-none">
      {/* Subtle organic linen grain/paper gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(#E8DFD5_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Warm Ambient Orb 1: Terracotta Sunlit Halo */}
      <div
        className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full blur-[120px] animate-breathing-glow transition-all duration-1000"
        style={{
          backgroundColor: heroAccent.primary,
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
        }}
      />

      {/* Warm Ambient Orb 2: Champagne & Linen Glow (Top Right) */}
      <div
        className="absolute top-1/6 -right-24 w-[680px] h-[680px] rounded-full blur-[140px] transition-all duration-1000"
        style={{
          backgroundColor: heroAccent.secondary,
          transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px)`,
          animation: 'warmBreathingGlow 14s ease-in-out infinite alternate',
        }}
      />

      {/* Warm Ambient Orb 3: Soft Alabaster Bottom Bloom */}
      <div
        className="absolute -bottom-32 left-1/3 w-[720px] h-[500px] rounded-full bg-amber-100/30 blur-[130px] transition-transform duration-1000"
        style={{
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
        }}
      />
    </div>
  );
};
