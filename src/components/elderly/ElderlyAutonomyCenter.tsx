'use client';

import React, { useState, useCallback } from 'react';
import type { ElderlyProposal } from '@/types';
import {
  ShieldCheck, Check, X, Bell, UserCheck, HeartHandshake, AlertCircle,
} from 'lucide-react';

interface ElderlyAutonomyCenterProps {
  readonly onProposalResolved?: (proposal: ElderlyProposal, action: 'approved' | 'declined') => void;
}

const INITIAL_PROPOSALS: ElderlyProposal[] = [
  {
    id: 'prop-1',
    proposerRole: 'Caretaker',
    proposerName: 'Sarah Jenkins, RN',
    title: 'Evening Metformin Timing Optimization',
    description: 'Recommend taking Metformin 500mg at 20:30 with your light evening snack to minimize stomach sensitivity.',
    suggestedChange: 'Shift 20:00 dose to 20:30',
    status: 'pending',
    createdAt: 'Today, 10:15 AM',
  },
  {
    id: 'prop-2',
    proposerRole: 'Family Member',
    proposerName: 'Emily Vance (Daughter)',
    title: 'Sunday Family Health Digest Subscription',
    description: 'Requested access to receive weekly automated Sunday adherence progress email summaries.',
    suggestedChange: 'Enable Sunday Family Progress Digest',
    status: 'pending',
    createdAt: 'Yesterday, 4:30 PM',
  },
];

/**
 * Dedicated Elderly Decision Center guaranteeing full individual healthcare sovereignty.
 * Problem Statement Requirement: "Elderly individuals remain at the centre of their own healthcare decisions."
 */
export default function ElderlyAutonomyCenter({ onProposalResolved }: ElderlyAutonomyCenterProps) {
  const [proposals, setProposals] = useState<ElderlyProposal[]>(INITIAL_PROPOSALS);
  const [resolvedMsg, setResolvedMsg] = useState<string | null>(null);

  const handleResolve = useCallback((id: string, action: 'approved' | 'declined') => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: action } : p))
    );
    const resolved = proposals.find((p) => p.id === id);
    if (resolved) {
      const msg = action === 'approved'
        ? `✅ Approved proposal: "${resolved.title}". Your schedule has been updated.`
        : `❌ Declined proposal: "${resolved.title}". Your preferences were preserved.`;
      setResolvedMsg(msg);
      setTimeout(() => setResolvedMsg(null), 4000);
      onProposalResolved?.(resolved, action);
    }
  }, [proposals, onProposalResolved]);

  return (
    <div className="bg-surface border border-teal-500/30 rounded-2xl p-5 mb-6 shadow-sm" aria-live="polite">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-border-color">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-400" aria-hidden="true" />
            My Healthcare Decisions & Care Circle Proposals
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            You hold 100% final decision authority. Caregivers and family can only suggest updates with your explicit consent.
          </p>
        </div>
        <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/25 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 w-fit">
          <ShieldCheck className="w-3.5 h-3.5" /> Full Patient Sovereignty
        </span>
      </div>

      {resolvedMsg && (
        <div className="mb-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-700 dark:text-teal-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{resolvedMsg}</span>
        </div>
      )}

      <div className="space-y-3">
        {proposals.map((prop) => (
          <div
            key={prop.id}
            className={`p-4 rounded-xl border transition-colors shadow-sm ${
              prop.status === 'pending'
                ? 'bg-surface border-border-color hover:border-teal-400/50'
                : prop.status === 'approved'
                ? 'bg-emerald-500/10 border-emerald-500/30 opacity-90'
                : 'bg-rose-500/10 border-rose-500/30 opacity-80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> {prop.proposerRole}: {prop.proposerName}
                  </span>
                  <span className="text-[11px] text-text-secondary">{prop.createdAt}</span>
                </div>
                <h4 className="font-bold text-text-primary text-sm mt-1.5">{prop.title}</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{prop.description}</p>
                <div className="mt-2 text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-teal-400" />
                  Suggested Action: {prop.suggestedChange}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
                {prop.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleResolve(prop.id, 'approved')}
                      className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white dark:border-transparent font-semibold text-xs px-3 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-white" /> Approve
                    </button>
                    <button
                      onClick={() => handleResolve(prop.id, 'declined')}
                      className="flex items-center gap-1.5 bg-surface hover:bg-gray-100 dark:hover:bg-gray-700 text-text-primary font-semibold text-xs px-3 py-2 rounded-lg border border-border-color transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </>
                ) : (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                    prop.status === 'approved'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                  }`}>
                    {prop.status === 'approved' ? '✓ Approved by You' : '✕ Declined by You'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
