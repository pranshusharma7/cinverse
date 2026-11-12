import type { Metadata } from 'next';
import './globals.css';
import { GlassContainer } from '@/components/GlassContainer';

export const metadata: Metadata = {
  title: 'CINÉVERSE — Spatial Liquid Glass Cinema Experience',
  description: 'Experience cinema in a pure liquid glass spatial computing interface. Premium movies, TV series, and high-definition streaming.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <GlassContainer>{children}</GlassContainer>
      </body>
    </html>
  );
}
