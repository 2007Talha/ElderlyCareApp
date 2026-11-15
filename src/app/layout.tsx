import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Elderly Care & Medication Management Platform',
  description: 'A shared healthcare ecosystem for elderly individuals, caretakers, and family members.',
};

/** Root layout wrapping the entire application. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
