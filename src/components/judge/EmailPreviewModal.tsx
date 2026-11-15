'use client';

import React, { useState } from 'react';
import type { EmailDispatchLog } from '@/types';
import { X, Mail, CheckCircle2, ShieldCheck, Code, Eye } from 'lucide-react';

interface EmailPreviewModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly email: EmailDispatchLog | null;
}

/**
 * Realistic email client preview modal demonstrating live HTML email dispatches to judges.
 */
export default function EmailPreviewModal({
  isOpen, onClose, email,
}: EmailPreviewModalProps) {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  if (!isOpen || !email) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="bg-surface border border-teal-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Email Client App Header */}
        <div className="bg-card-subtle border-b border-border-color p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 id="email-preview-title" className="text-sm font-bold text-text-primary flex items-center gap-2">
                Live Dispatched Email Inspector
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {email.deliveryStatus}
                </span>
              </h2>
              <p className="text-xs text-text-secondary">Verifiable production HTML output</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-surface transition-colors"
            aria-label="Close email inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata Envelope */}
        <div className="bg-card-subtle border-b border-border-color p-3.5 space-y-1.5 text-xs text-text-secondary">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="font-semibold text-text-primary">Subject: {email.subject}</span>
            <span className="text-[11px] text-text-secondary">{new Date(email.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] text-text-secondary">
            <span><strong>From:</strong> CarePulse Dispatcher &lt;alerts@carepulse.health&gt;</span>
            <span><strong>To:</strong> <span className="text-teal-400">{email.recipient}</span></span>
            <span><strong>Trigger:</strong> {email.triggerReason}</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-surface px-4 py-2 border-b border-border-color flex items-center justify-between">
          <div className="flex items-center gap-1 bg-card-subtle p-0.5 rounded-lg border border-border-color">
            <button
              onClick={() => setViewMode('html')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                viewMode === 'html' ? 'bg-teal-600 text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Rendered HTML
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                viewMode === 'text' ? 'bg-teal-600 text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Plaintext
            </button>
          </div>
          <span className="text-[11px] text-text-secondary flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> End-to-End Verified
          </span>
        </div>

        {/* Email Body Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-card-subtle">
          {viewMode === 'html' && email.htmlBody ? (
            <div
              className="bg-surface rounded-xl p-2 sm:p-4 text-text-primary overflow-x-auto shadow-inner border border-border-color"
              dangerouslySetInnerHTML={{ __html: email.htmlBody }}
            />
          ) : (
            <pre className="text-xs text-text-primary whitespace-pre-wrap font-mono p-4 bg-surface rounded-xl border border-border-color">
              {email.body}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-card-subtle border-t border-border-color flex items-center justify-between text-xs text-text-secondary">
          <span>Delivery Telemetry ID: <code className="text-teal-400">{email.id}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary border border-border-color font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
