'use client';

interface StatusBadgeProps {
  readonly status: string;
}

/** Returns tailwind classes for a given status string. */
function getStatusClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === 'taken' || s === 'delivered' || s === 'acknowledged') {
    return 'bg-success/20 text-success';
  }
  if (s === 'missed' || s === 'failed') {
    return 'bg-danger/20 text-danger';
  }
  if (s === 'snoozed' || s === 'pending' || s === 'queued') {
    return 'bg-warning/20 text-warning';
  }
  return 'bg-gray-700 text-gray-300';
}

/** Pill-shaped status badge for dose, email, and reminder statuses. */
export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(status)}`}>
      {status}
    </span>
  );
}
