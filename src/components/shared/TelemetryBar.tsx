'use client';

import React, { useState } from 'react';
import {
  ShieldCheck, ShieldAlert, Clock, EyeOff, CheckCircle,
  ChevronDown, ChevronUp, Activity, Cpu, Sparkles,
} from 'lucide-react';

export interface GuardrailsTelemetry {
  source: 'gemini' | 'deterministic' | 'cache';
  cacheHit: boolean;
  latencyMs: number;
  piiTokensRedacted: number;
  promptInjectionBlocked: boolean;
  inputSanitized: boolean;
  schemaValid: boolean;
}

interface TelemetryBarProps {
  readonly telemetry: GuardrailsTelemetry | null;
}

/** Live System Defense & Health Guardrails Telemetry Drawer. */
export default function TelemetryBar({ telemetry }: TelemetryBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!telemetry) {
    return (
      <aside aria-label="System telemetry standby" className="mt-8 bg-surface border border-gray-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400 animate-pulse" aria-hidden="true" />
            <span className="font-semibold text-white">Defense Guardrails Telemetry Standby</span>
          </div>
          <span className="text-gray-500">Ready for query or scan evaluation</span>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="System engineering guardrails telemetry" className="mt-8 bg-surface border border-teal-500/30 rounded-xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-gray-800/40 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-teal-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>SECURITY & EFFICIENCY TELEMETRY</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
            SOURCE: {telemetry.source.toUpperCase()}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-bold border ${telemetry.cacheHit ? 'bg-success/10 text-success border-success/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
            {telemetry.cacheHit ? 'CACHE HIT (0ms LLM)' : 'CACHE MISS'}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-bold border ${telemetry.piiTokensRedacted > 0 ? 'bg-warning/10 text-warning border-warning/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
            PII: {telemetry.piiTokensRedacted} Scrubbed
          </span>
          <span className="text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            {telemetry.latencyMs}ms
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-teal-400 shrink-0">
          <span>{isExpanded ? 'Hide Diagnostics' : 'Evaluator Audit'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-800 bg-gray-900/60 text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-surface border border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Input Sanitization</span>
              <span className="text-sm font-bold text-success mt-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                {telemetry.inputSanitized ? 'XSS Purged' : 'Failed'}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5 block">HTML & control chars sanitized</span>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Prompt Guard</span>
              <span className={`text-sm font-bold mt-1 flex items-center gap-1.5 ${telemetry.promptInjectionBlocked ? 'text-danger' : 'text-success'}`}>
                {telemetry.promptInjectionBlocked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {telemetry.promptInjectionBlocked ? 'Threat Blocked' : 'Clean Prompt'}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Jailbreak & override defense</span>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">PII Redaction</span>
              <span className={`text-sm font-bold mt-1 flex items-center gap-1.5 ${telemetry.piiTokensRedacted > 0 ? 'text-warning' : 'text-teal-400'}`}>
                <EyeOff className="w-4 h-4" />
                {telemetry.piiTokensRedacted} Scrubbed
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5 block">SSNs, phones & addresses redacted</span>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Zod Strict Schema</span>
              <span className="text-sm font-bold text-success mt-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                {telemetry.schemaValid ? '100% Runtime Valid' : 'Invalid'}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Type safety & envelope verification</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
