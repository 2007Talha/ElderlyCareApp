'use client';

import React, { useState } from 'react';
import type { EcosystemActivity, UserRole } from '@/types';
import {
  Activity, UsersRound, Sparkles, Mail, HeartHandshake, CheckCircle2,
} from 'lucide-react';

interface SharedActivityTimelineProps {
  readonly activities: EcosystemActivity[];
}

const CATEGORY_ICONS: Record<EcosystemActivity['category'], React.ReactNode> = {
  medication: <Activity className="w-4 h-4 text-teal-400" />,
  adherence: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  appointment: <Sparkles className="w-4 h-4 text-amber-400" />,
  email: <Mail className="w-4 h-4 text-sky-400" />,
  autonomy: <HeartHandshake className="w-4 h-4 text-rose-400" />,
};

function getRoleBadge(role: UserRole | 'System'): { label: string; className: string } {
  if (role === 'Elderly Individual') {
    return { label: 'Elderly User', className: 'text-teal-400 bg-teal-500/15 border-teal-500/30' };
  }
  if (role === 'Caretaker') {
    return { label: 'Caretaker', className: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
  }
  if (role === 'Family Member') {
    return { label: 'Family', className: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
  }
  return { label: 'CarePulse Engine', className: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
}

/**
 * Shared Ecosystem Activity Timeline demonstrating live cross-role interconnected collaboration.
 */
export default function SharedActivityTimeline({ activities }: SharedActivityTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'medication' | 'email' | 'autonomy'>('all');

  const filtered = activities.filter((a) => (filter === 'all' ? true : a.category === filter));

  return (
    <div className="bg-surface border border-border-color rounded-2xl p-5 mb-6 shadow-sm" aria-live="polite">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-border-color">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-teal-400" aria-hidden="true" />
            Shared Ecosystem Activity Stream
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time collaborative audit trail between Elderly, Caretakers, and Family members.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-card-subtle border border-border-color p-0.5 rounded-lg text-xs">
          {(['all', 'medication', 'email', 'autonomy'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded capitalize font-semibold transition-colors ${
                filter === cat ? 'bg-teal-600 text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.slice(0, 6).map((item) => {
          const badge = getRoleBadge(item.actorRole);
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-card-subtle border border-border-color flex items-start gap-3 hover:border-gray-400 dark:hover:border-gray-700 transition-colors shadow-sm"
            >
              <div className="p-2 rounded-lg bg-surface border border-border-color shrink-0 mt-0.5">
                {CATEGORY_ICONS[item.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-semibold text-text-primary truncate">{item.action}</span>
                  </div>
                  <span className="text-[11px] text-text-secondary shrink-0">{item.timestamp}</span>
                </div>
                {item.details && (
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{item.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
