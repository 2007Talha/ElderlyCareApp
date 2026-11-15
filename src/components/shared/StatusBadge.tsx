'use client';

interface StatusBadgeProps {
  readonly status: string;
}

/** Returns tailwind classes for a given status string. */
function getStatusClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === 'taken' || s === 'delivered' || s === 'acknowledged') {
    return 'bg-emerald-100 dark:bg-success/20 text-emerald-800 dark:text-success border border-emerald-300 dark:border-emerald-500/30';
  }
  if (s === 'missed' || s === 'failed') {
    return 'bg-rose-100 dark:bg-danger/20 text-rose-800 dark:text-danger border border-rose-300 dark:border-rose-500/30';
  }
  if (s === 'snoozed' || s === 'pending' || s === 'queued') {
    return 'bg-amber-100 dark:bg-warning/20 text-amber-800 dark:text-warning border border-amber-300 dark:border-amber-500/30';
  }
  if (s === 'active') {
    return 'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-500/30';
  }
  if (s === 'inactive') {
    return 'bg-stone-200 dark:bg-gray-800 text-stone-700 dark:text-gray-400 border border-stone-300 dark:border-gray-700';
  }
  return 'bg-stone-100 dark:bg-gray-800 text-stone-700 dark:text-gray-300 border border-stone-300 dark:border-gray-700';
}

/** Pill-shaped status badge with light & dark theme contrast. */
export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusClasses(status)}`}>
      {status}
    </span>
  );
}
