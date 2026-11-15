'use client';

import { useState, useCallback, useRef } from 'react';
import type { PrescriptionScanResult, ApiResponse, Medication, DrugInteraction } from '@/types';
import { readFileAsBase64, saveScannedMedication } from '@/utils/scanHelpers';
import PrescriptionResultCard from './PrescriptionResultCard';
import PrescriptionEditForm from './PrescriptionEditForm';
import { ScanLine, Upload, Sparkles, AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';

interface PrescriptionScannerProps {
  readonly onScanResult?: (result: PrescriptionScanResult) => void;
  readonly onMedicationAdded?: () => void;
}

/** AI Prescription Label Scanner with multimodal OCR and review form. */
export default function PrescriptionScanner({
  onScanResult,
  onMedicationAdded,
}: PrescriptionScannerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<PrescriptionScanResult | null>(null);
  const [addedMed, setAddedMed] = useState<Medication | null>(null);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeScan = useCallback(async (base64: string, filename?: string, mimeType?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assistant/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, filename, mimeType }),
      });
      const data: ApiResponse<PrescriptionScanResult> = await res.json();
      if (!data.success || !data.data) throw new Error(data.error ?? 'Label scan failed.');
      setPendingResult(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Prescription analysis failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { base64, dataUrl, mimeType } = await readFileAsBase64(file);
      setPreviewUrl(dataUrl);
      await executeScan(base64, file.name, mimeType);
    } catch {
      setError('Unable to read selected image file.');
    }
  }, [executeScan]);

  const handleDemoScan = useCallback(async () => {
    setPreviewUrl(null);
    await executeScan('demo-placeholder', 'Amlodipine_5mg.jpg');
  }, [executeScan]);

  const handleApplySave = useCallback(async (data: PrescriptionScanResult) => {
    setSaving(true);
    try {
      const saved = await saveScannedMedication(data);
      setAddedMed(saved.medication);
      setInteractions(saved.interactions ?? []);
      setPendingResult(null);
      onScanResult?.(data);
      onMedicationAdded?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save medication.');
    } finally {
      setSaving(false);
    }
  }, [onScanResult, onMedicationAdded]);

  const handleReset = useCallback(() => {
    setAddedMed(null);
    setPendingResult(null);
    setPreviewUrl(null);
    setError(null);
    setInteractions([]);
  }, []);

  return (
    <div className="bg-surface border border-border-color rounded-xl p-4 shadow-sm" aria-live="polite">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold text-text-primary flex items-center gap-2 text-base">
          <ScanLine className="w-5 h-5 text-teal-400" aria-hidden="true" />
          Scan Prescription Label with AI
        </h3>
        {(addedMed || pendingResult) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary px-2.5 py-1 rounded-lg bg-card-subtle hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Scan Another
          </button>
        )}
      </div>

      {!addedMed && !pendingResult && (
        <>
          <p className="text-xs text-text-secondary mb-3.5">
            Upload or capture a photo of any medicine bottle or box label. The AI extracts dosage, frequency, and instructions for your confirmation.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-2 bg-card-subtle hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary px-4 py-2 rounded-lg border border-border-color text-sm font-semibold transition-colors disabled:opacity-50"
              aria-label="Upload prescription label image"
            >
              <Upload className="w-4 h-4 text-teal-400" aria-hidden="true" />
              Upload Label
            </button>
            <button
              onClick={handleDemoScan}
              disabled={loading}
              className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white dark:border-transparent disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
              {loading ? 'Analyzing Label...' : 'Demo AI Scan'}
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

      {pendingResult && (
        <PrescriptionEditForm
          previewUrl={previewUrl}
          initialData={pendingResult}
          onSave={handleApplySave}
          onCancel={handleReset}
          saving={saving}
        />
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2" role="alert">
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
