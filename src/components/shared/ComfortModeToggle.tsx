'use client';

import { Eye } from 'lucide-react';

interface ComfortModeToggleProps {
  readonly enabled: boolean;
  readonly onToggle: () => void;
}

/** One-click toggle for Elderly Comfort Mode (large text, big touch targets). */
export default function ComfortModeToggle({
  enabled, onToggle,
}: ComfortModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors shadow-sm ${
        enabled
          ? 'bg-accent/20 border-accent text-accent'
          : 'bg-card-subtle border-border-color text-text-secondary hover:text-text-primary'
      }`}
      aria-pressed={enabled}
      aria-label="Toggle Elderly Comfort Mode"
    >
      <Eye className="w-5 h-5" aria-hidden="true" />
      <span className="text-sm font-medium">
        {enabled ? 'Comfort Mode ON' : 'Comfort Mode'}
      </span>
    </button>
  );
}
