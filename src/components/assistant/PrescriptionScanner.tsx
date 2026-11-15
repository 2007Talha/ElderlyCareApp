'use client';

import { useState, useCallback, useRef } from 'react';
import type { PrescriptionScanResult, ApiResponse } from '@/types';
import { ScanLine, Upload, Sparkles } from 'lucide-react';

interface PrescriptionScannerProps {
  readonly onScanResult: (result: PrescriptionScanResult) => void;
}

/** AI Prescription Label Scanner with Gemini Vision and fallback. */
export default function PrescriptionScanner({ onScanResult }: PrescriptionScannerProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      setPreview(ev.target?.result as string);
      setLoading(true);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch('/api/assistant/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data: ApiResponse<PrescriptionScanResult> = await res.json();
        if (data.success && data.data) {
          onScanResult(data.data);
        }
      } catch { /* fallback handled server-side */ }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  }, [onScanResult]);

  const handleDemoScan = useCallback(async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch('/api/assistant/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'demo-placeholder' }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data: ApiResponse<PrescriptionScanResult> = await res.json();
      if (data.success && data.data) onScanResult(data.data);
    } catch { /* fallback */ }
    finally { setLoading(false); }
  }, [onScanResult]);

  return (
    <div className="bg-surface border border-gray-800 rounded-xl p-4">
      <h3 className="font-medium flex items-center gap-2 mb-3">
        <ScanLine className="w-5 h-5 text-teal-400" aria-hidden="true" />
        Prescription Label AI Scanner
      </h3>

      <div className="flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700 text-sm font-medium"
          aria-label="Upload prescription label image"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          Upload Label
        </button>
        <button
          onClick={handleDemoScan}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          {loading ? 'Scanning...' : 'Demo AI Scan'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Select prescription image file"
      />

      {preview && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Prescription label preview"
            className="max-h-32 rounded-lg border border-gray-700"
          />
        </div>
      )}
    </div>
  );
}
