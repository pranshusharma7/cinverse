import type { Metadata } from 'next';
import './globals.css';
import { GlassContainer } from '@/components/GlassContainer';

export const metadata: Metadata = {
  title: 'CINÉVERSE — Curated Cinema Salon & Archive',
  description: 'An artisanal editorial film archive. Curated masterworks, festival cinema, episodic series, and universal screening salon.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF7F2] text-[#231215] antialiased selection:bg-[#7A242B] selection:text-[#FAF5F0]">
        <GlassContainer>{children}</GlassContainer>
      </body>
    </html>
  );
}
