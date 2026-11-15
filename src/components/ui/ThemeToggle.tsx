'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sun, MoonStar } from 'lucide-react';

interface ThemeToggleProps {
  readonly className?: string;
}

export type ThemeMode = 'dark' | 'light';

/** Dual-theme switcher between Midnight Sanctuary (Dark) and Warm Daylight (Light). */
export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('eldercare_theme') as ThemeMode | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    document.documentElement.classList.toggle('light', initial === 'light');
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('eldercare_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, [theme]);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
        theme === 'dark'
          ? 'bg-card-subtle border-border-color text-amber-300 hover:bg-gray-700'
          : 'bg-surface border-border-color text-text-primary shadow-sm hover:bg-card-subtle'
      } ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'Warm Daylight Light Mode' : 'Midnight Sanctuary Dark Mode'}`}
      title={theme === 'dark' ? 'Switch to Warm Daylight' : 'Switch to Midnight Sanctuary'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
      ) : (
        <MoonStar className="w-5 h-5 transition-transform hover:-rotate-12" />
      )}
      <span className="text-xs font-semibold hidden md:inline">
        {theme === 'dark' ? 'Daylight' : 'Midnight'}
      </span>
    </button>
  );
}
