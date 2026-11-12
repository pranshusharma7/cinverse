'use client';

import React, { useEffect, useState } from 'react';

export const BackgroundMesh: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [heroAccent, setHeroAccent] = useState<{ primary: string; secondary: string }>({
    primary: 'rgba(99, 102, 241, 0.15)', // indigo
    secondary: 'rgba(244, 63, 94, 0.12)', // rose
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
      const x = (e.clientX / window.innerWidth - 0.5) * 25;
      const y = (e.clientY / window.innerHeight - 0.5) * 25;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('hero_color_changed', handleHeroColor);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-[#eef3f9] transition-colors duration-700">
      {/* Soft Apple visionOS Living Room Reference Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out opacity-45 scale-105"
        style={{
          backgroundImage: `url('/reference/vision_os_reference.jpg')`,
          transform: `translate(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px) scale(1.05)`,
          filter: 'blur(8px) brightness(1.08) saturate(1.1)',
        }}
      />

      {/* Pearlescent White Frosted Overlay for Razor-Sharp Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/60 to-white/80 backdrop-blur-[18px]" />

      {/* Ambient Orb 1: Dynamic Top-Left Lilac / Indigo Aura */}
      <div
        className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[110px] animate-breathing-glow transition-all duration-1000"
        style={{
          backgroundColor: heroAccent.primary,
          transform: `translate(${mousePos.x * 1.1}px, ${mousePos.y * 1.1}px)`,
        }}
      />

      {/* Ambient Orb 2: Dynamic Top-Right Warm Peach / Rose Aurora */}
      <div
        className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full blur-[130px] transition-all duration-1000"
        style={{
          backgroundColor: heroAccent.secondary,
          transform: `translate(${mousePos.x * -0.9}px, ${mousePos.y * -0.9}px)`,
          animation: 'breathingGlow 10s ease-in-out infinite alternate',
        }}
      />

      {/* Ambient Orb 3: Crystal Azure / Sky Bottom Flare */}
      <div
        className="absolute -bottom-36 left-1/4 w-[750px] h-[550px] rounded-full bg-sky-300/25 blur-[120px] transition-transform duration-1000"
        style={{
          transform: `translate(${mousePos.x * 0.7}px, ${mousePos.y * 0.7}px)`,
        }}
      />

      {/* Soft Specular Radial Sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 25%, rgba(255, 255, 255, 0.4) 0%, rgba(240, 244, 250, 0.25) 100%)',
        }}
      />
    </div>
  );
};
