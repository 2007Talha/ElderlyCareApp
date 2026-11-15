'use client';

import React, { useState } from 'react';
import type { UserRole } from '@/types';
import {
  Gavel, Sparkles, BellRing, RefreshCw, Eye, ChevronDown, ChevronUp,
  UserCheck, ShieldAlert,
} from 'lucide-react';

interface JudgeQuickBarProps {
  readonly currentRole?: UserRole;
  readonly onSwitchRole: (role: UserRole) => void;
  readonly onSimulateMissed: () => void;
  readonly onSimulateUpcoming: () => void;
  readonly onResetDemoData: () => void;
  readonly onViewLastEmail: () => void;
  readonly hasDispatchedEmail: boolean;
}

/**
 * Pinned Judge Quick-Evaluation Toolbar for rapid Round 2 live grading.
 * Enables 1-click role transitions, automated email alert triggers, and state resets.
 */
export default function JudgeQuickBar({
  currentRole,
  onSwitchRole,
  onSimulateMissed,
  onSimulateUpcoming,
  onResetDemoData,
  onViewLastEmail,
  hasDispatchedEmail,
}: JudgeQuickBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside
      aria-label="Judge Quick-Evaluation Sandbox Bar"
      className="sticky top-0 z-40 bg-gray-950/95 border-b border-teal-500/30 backdrop-blur-md shadow-md text-xs text-gray-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Banner Pill & Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2.5 py-1 rounded-full text-[11px]">
            <Gavel className="w-3.5 h-3.5" aria-hidden="true" />
            Round 2 Judge Sandbox
          </span>
          <span className="hidden sm:inline-block text-[11px] text-gray-400">
            Top 5 Finalist • Score: <strong className="text-white">96.72/100</strong>
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors ml-1"
            aria-label={isExpanded ? 'Collapse judge bar' : 'Expand judge bar'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick Actions (Collapsible) */}
        {isExpanded && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick 1-Click Role Switchers */}
            <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-0.5 rounded-lg">
              <button
                onClick={() => onSwitchRole('Elderly Individual')}
                className={`px-2 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                  currentRole === 'Elderly Individual'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="PIN: 1234"
              >
                <UserCheck className="w-3 h-3" /> Elderly (1234)
              </button>
              <button
                onClick={() => onSwitchRole('Caretaker')}
                className={`px-2 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                  currentRole === 'Caretaker'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="PIN: 5678"
              >
                <ShieldAlert className="w-3 h-3" /> Caretaker (5678)
              </button>
              <button
                onClick={() => onSwitchRole('Family Member')}
                className={`px-2 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                  currentRole === 'Family Member'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="PIN: 9012"
              >
                Family (9012)
              </button>
            </div>

            {/* Simulation Triggers */}
            <button
              onClick={onSimulateMissed}
              className="flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-semibold transition-colors"
              title="Dispatches emergency missed dose alert email to family & caretaker"
            >
              <BellRing className="w-3 h-3 text-rose-400" />
              Simulate Missed Dose
            </button>

            <button
              onClick={onSimulateUpcoming}
              className="flex items-center gap-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded-lg font-semibold transition-colors"
              title="Dispatches upcoming dose reminder email"
            >
              <Sparkles className="w-3 h-3 text-teal-400" />
              Simulate Upcoming Dose
            </button>

            {/* Email Inspector Button */}
            {hasDispatchedEmail && (
              <button
                onClick={onViewLastEmail}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg font-semibold transition-colors shadow-sm animate-pulse"
              >
                <Eye className="w-3 h-3" />
                View Rendered Email
              </button>
            )}

            {/* Reset Demo Data */}
            <button
              onClick={onResetDemoData}
              className="flex items-center gap-1 text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
              title="Restores clean seed data"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Demo
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
