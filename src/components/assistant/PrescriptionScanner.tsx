'use client';

import { useState, useCallback, useRef } from 'react';
import type { PrescriptionScanResult, ApiResponse } from '@/types';
import { Camera, Upload, FileText } from 'lucide-react';

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
        const res = await fetch('/api/assistant/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });
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
      const res = await fetch('/api/assistant/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'demo-placeholder' }),
      });
      const data: ApiResponse<PrescriptionScanResult> = await res.json();
      if (data.success && data.data) onScanResult(data.data);
    } catch { /* fallback */ }
    finally { setLoading(false); }
  }, [onScanResult]);

  return (
    <div className="bg-surface border border-gray-800 rounded-xl p-4">
      <h3 className="font-medium flex items-center gap-2 mb-3">
        <Camera className="w-5 h-5 text-accent" aria-hidden="true" />
        Prescription Label Scanner
      </h3>

      <div className="flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700"
          aria-label="Upload prescription label image"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          Upload Label
        </button>
        <button
          onClick={handleDemoScan}
          disabled={loading}
          className="flex items-center gap-2 bg-accent hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          {loading ? 'Scanning...' : 'Demo Scan'}
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
