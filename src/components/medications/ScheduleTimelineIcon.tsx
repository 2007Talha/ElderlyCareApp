'use client';

import React from 'react';
import { Sunrise, Sun, MoonStar } from 'lucide-react';

interface ScheduleTimelineIconProps {
  readonly time: string;
  readonly showLabel?: boolean;
}

/** Determines whether time is morning, afternoon, or night. */
export function getTimeSlot(timeStr: string): {
  slot: 'Morning' | 'Afternoon' | 'Night';
  color: string;
} {
  const hour = parseInt(timeStr.split(':')[0] || '8', 10);
  if (hour < 12) {
    return { slot: 'Morning', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
  }
  if (hour < 18) {
    return { slot: 'Afternoon', color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
  }
  return { slot: 'Night', color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' };
}

/** Renders Sunrise, Sun, or MoonStar icon for medication schedule times. */
export default function ScheduleTimelineIcon({
  time,
  showLabel = true,
}: ScheduleTimelineIconProps) {
  const { slot, color } = getTimeSlot(time);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium tabular-nums ${color}`}>
      {slot === 'Morning' && <Sunrise className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />}
      {slot === 'Afternoon' && <Sun className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />}
      {slot === 'Night' && <MoonStar className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />}
      <span>{time}</span>
      {showLabel && <span className="opacity-75 text-[10px]">({slot})</span>}
    </span>
  );
}
