'use client';

import { useState, useCallback, useRef } from 'react';
import type { PrescriptionScanResult, ApiResponse, Medication, DrugInteraction } from '@/types';
import { compressImage, saveScannedMedication } from '@/utils/scanHelpers';
import PrescriptionResultCard from './PrescriptionResultCard';
import { ScanLine, Upload, Sparkles, AlertTriangle, RotateCcw } from 'lucide-react';

interface PrescriptionScannerProps {
  readonly onScanResult?: (result: PrescriptionScanResult) => void;
  readonly onMedicationAdded?: () => void;
}

/** AI Prescription Label Scanner with automated medication scheduling & drug checks. */
export default function PrescriptionScanner({
  onScanResult, onMedicationAdded,
}: PrescriptionScannerProps) {
  const [loading, setLoading] = useState(false);
  const [addedMed, setAddedMed] = useState<Medication | null>(null);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processScan = useCallback(async (base64: string) => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch('/api/assistant/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data: ApiResponse<PrescriptionScanResult> = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Label scan analysis failed.');
      }
      const saved = await saveScannedMedication(data.data);
      setAddedMed(saved.medication);
      setInteractions(saved.interactions ?? []);
      onScanResult?.(data.data);
      onMedicationAdded?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scan or medication creation failed.');
    } finally {
      setLoading(false);
    }
  }, [onScanResult, onMedicationAdded]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await compressImage(file);
    await processScan(base64);
  }, [processScan]);

  const handleDemoScan = useCallback(async () => {
    await processScan('demo-placeholder');
  }, [processScan]);

  const handleReset = useCallback(() => {
    setAddedMed(null);
    setError(null);
    setInteractions([]);
  }, []);

  return (
    <div className="bg-surface border border-gray-800 rounded-xl p-4 shadow-sm" aria-live="polite">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold text-white flex items-center gap-2 text-base">
          <ScanLine className="w-5 h-5 text-teal-400" aria-hidden="true" />
          Scan Prescription Label with AI
        </h3>
        {addedMed && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Scan Another
          </button>
        )}
      </div>

      {!addedMed && (
        <>
          <p className="text-xs text-gray-400 mb-3.5">
            Upload or capture a photo of any medicine bottle or box label. The AI will extract dosage, frequency, and automatically add it to your schedule.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700 text-sm font-semibold transition-colors disabled:opacity-50"
              aria-label="Upload prescription label image"
            >
              <Upload className="w-4 h-4 text-teal-400" aria-hidden="true" />
              Upload Label
            </button>
            <button
              onClick={handleDemoScan}
              disabled={loading}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              {loading ? 'Scanning & Adding...' : 'Demo AI Scan'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select prescription image file"
          />
        </>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {addedMed && (
        <PrescriptionResultCard addedMed={addedMed} interactions={interactions} />
      )}
    </div>
  );
}
