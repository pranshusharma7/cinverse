# CINÉVERSE 🌌
### Futuristic Glassmorphism Online Movie Streaming Platform

CINÉVERSE is a next-generation online movie discovery and streaming web application inspired by spatial computing and VisionOS glassmorphism aesthetics.

---

## 🌟 Visual Concept & Architecture

- **Spatial Glassmorphism**: Translucent floating glass panels with multi-layer `backdrop-filter: blur(28px)`, frosted specular borders (`rgba(255, 255, 255, 0.15)`), ambient inner highlights, and glowing drop shadows.
- **Modern Luxury Living Room Background**: Realistic luxury penthouse interior with high-rise city views, blue-purple ambient gradients, and mouse-driven 3D parallax depth.
- **Floating Navigation Elements**:
  - Top floating VisionOS / Safari address bar pill with interactive navigation history, domain verification, and link sharing.
  - Floating vertical glass dock on the left with active indicators, spring animations, and instant tooltips.
  - Large centered translucent glass dashboard with segmented pills, voice search trigger, notification popover, and guest profile menu.
- **Cinematic Hero**: Dynamic featured banner with slow Ken Burns background zoom, genre tags, "🔥 Now Trending" badge, glowing action buttons, and slide controls.
- **Upcoming Movies**: Landscape cards with release countdowns and glass play buttons.
- **Recommended for You**: Smooth horizontal carousel with drag-to-scroll, hover zoom, and instant details navigation.
- **Continue Watching**: Real-time progress tracking stored in browser `localStorage`, resume buttons, and remaining time calculation.
- **Cinematic Video Player**: Custom HLS.js + HTML5 video player with auto-fading controls, playback speed, quality selector, keyboard shortcuts (`Space`, `F`, `M`, `T`, `←`, `→`), theatre mode, and `localStorage` resume position.
- **Zero Authentication**: No login or signup required. Complete watchlist, watch history, and guest preferences persist locally in browser storage.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your external movie API credentials:
```env
# Your external streaming service URL
EXTERNAL_MOVIE_API_URL=https://api.yourmovieservice.com/v1

# Secret API key (strictly kept on the server via Next.js API route proxy)
EXTERNAL_MOVIE_API_KEY=your_secret_api_key_here

# Enable built-in high-fidelity streaming provider fallback
ENABLE_STREAM_FALLBACK=true
```

### 3. Install Dependencies & Run
```bash
npm install
npm run dev
# Or build and start production server
npm run build
npm run start -p 3005
```

Open [http://localhost:3005](http://localhost:3005) in your browser.

---

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Frosted Glassmorphism Tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Streaming**: HLS.js + HTML5 Adaptive Bitrate Video
- **State & Storage**: Client-side LocalStorage Reactive Event Bus

