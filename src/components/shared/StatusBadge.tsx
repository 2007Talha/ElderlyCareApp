'use client';

interface StatusBadgeProps {
  readonly status: string;
}

/** Returns tailwind classes for a given status string. */
function getStatusClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === 'taken' || s === 'delivered' || s === 'acknowledged') {
    return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  }
  if (s === 'missed' || s === 'failed') {
    return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
  }
  if (s === 'snoozed' || s === 'pending' || s === 'queued') {
    return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
  }
  if (s === 'active') {
    return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
  }
  if (s === 'inactive') {
    return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
  return 'bg-gray-800 text-gray-300 border border-gray-700';
}

/** Pill-shaped status badge with light & dark theme contrast. */
export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusClasses(status)}`}>
      {status}
    </span>
  );
}
