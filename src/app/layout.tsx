import type { Metadata } from 'next';
import './globals.css';

const FAVICON_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="%230F766E"/><path d="M24 9C20 9 12 12.5 12 21C12 29.5 24 38 24 38C24 38 36 29.5 36 21C36 12.5 28 9 24 9Z" stroke="%232DD4BF" stroke-width="2.5" fill="none"/><path d="M24 14V22M20 18H28" stroke="%23FFFFFF" stroke-width="3" stroke-linecap="round"/><path d="M15 28H19L21.5 24L24 32L26.5 26.5L28.5 29H33" stroke="%23FFFFFF" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';

export const metadata: Metadata = {
  title: 'ElderCare — Elderly Care & Medication Management Platform',
  description: 'A shared healthcare ecosystem for elderly individuals, caretakers, and family members.',
  icons: {
    icon: FAVICON_SVG,
  },
};

/** Root layout wrapping the entire application with dual-theme baseline. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen bg-background antialiased selection:bg-teal-500/30">
        {children}
      </body>
    </html>
  );
}
