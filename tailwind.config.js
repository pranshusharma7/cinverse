/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        glass: {
          50: "rgba(255, 255, 255, 0.05)",
          100: "rgba(255, 255, 255, 0.08)",
          200: "rgba(255, 255, 255, 0.12)",
          300: "rgba(255, 255, 255, 0.16)",
          400: "rgba(255, 255, 255, 0.22)",
          card: "rgba(25, 28, 42, 0.65)",
          panel: "rgba(20, 24, 38, 0.72)",
          surface: "rgba(15, 18, 30, 0.8)",
          border: "rgba(255, 255, 255, 0.14)",
          highlight: "rgba(255, 255, 255, 0.25)",
        },
        brand: {
          blue: "#38bdf8",
          purple: "#a855f7",
          lavender: "#c084fc",
          indigo: "#6366f1",
          cyan: "#06b6d4",
          accent: "#ec4899",
        },
      },
      backdropBlur: {
        xs: "2px",
        '2xl': "24px",
        '3xl': "32px",
        '4xl': "40px",
      },
      boxShadow: {
        'glass-sm': "0 4px 16px 0 rgba(0, 0, 0, 0.25)",
        'glass-md': "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        'glass-lg': "0 12px 48px 0 rgba(0, 0, 0, 0.45)",
        'glass-glow': "0 0 25px rgba(168, 85, 247, 0.25), 0 0 50px rgba(56, 189, 248, 0.15)",
        'glass-glow-blue': "0 0 30px rgba(56, 189, 248, 0.35)",
        'glass-inner': "inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)",
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { opacity: '0.6', filter: 'blur(20px)' },
          '100%': { opacity: '0.9', filter: 'blur(30px)' },
        },
      },
    },
  },
  plugins: [],
};

