/**
 * Helper utilities for prescription scanning, image compression, and auto-scheduling.
 */
import type { PrescriptionScanResult, ApiResponse, Medication, DrugInteraction } from '@/types';
import { deriveScheduledTimes } from '@/utils/helpers';

/**
 * Compresses an uploaded image file via HTML5 Canvas to lightweight base64 JPEG.
 * @param file The image file from file input.
 * @returns Base64 encoded string without data URI prefix.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1] || '');
      };
      img.onerror = () => resolve('');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Saves scanned prescription payload directly to medications store via API.
 * @param scan The structured AI scan result.
 * @returns The created Medication record and any drug interaction warnings.
 */
export async function saveScannedMedication(scan: PrescriptionScanResult): Promise<{
  medication: Medication;
  interactions?: DrugInteraction[];
}> {
  const times = deriveScheduledTimes(scan.frequency);
  const payload = {
    medicationName: scan.medicationName,
    dosage: scan.dosage,
    frequency: scan.frequency,
    scheduledTimes: times,
    inventoryCount: 30,
    instructions: scan.instructions || 'Take with water as directed.',
    prescribedBy: 'Dr. Sarah Jenkins (Prescription Scan)',
    isActive: true,
  };
  const res = await fetch('/api/medications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: ApiResponse<{ medication: Medication; interactions?: DrugInteraction[] }> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'Failed to save scanned medication.');
  }
  return data.data;
}
