/**
 * Helper utilities for prescription scanning, image compression, and auto-scheduling.
 */
import type { PrescriptionScanResult, ApiResponse, Medication, DrugInteraction } from '@/types';
import { deriveScheduledTimes } from '@/utils/helpers';

/**
 * Reads a File into base64 and data URL for live preview thumbnails.
 */
export function readFileAsBase64(file: File): Promise<{ base64: string; dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = (reader.result as string) || '';
      const base64 = dataUrl.split(',')[1] || '';
      resolve({ base64, dataUrl, mimeType: file.type || 'image/jpeg' });
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an uploaded image file via HTML5 Canvas to lightweight base64 JPEG.
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
 * Parses medication name, dosage, and frequency from file metadata / name.
 */
export function parseFilenameForMedication(filename: string): PrescriptionScanResult | null {
  if (!filename) return null;
  const clean = filename.replace(/\.[^/.]+$/, '').replace(/[_\-+]/g, ' ').trim();
  const dosageMatch = clean.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g)\b/i);
  const dosage = dosageMatch ? `${dosageMatch[1]}${dosageMatch[2].toLowerCase()}` : '10mg';

  let name = clean
    .replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g)\b/i, '')
    .replace(/\b(rx|prescription|label|bottle|scan|img|photo|med|medication)\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!name || name.length < 2) name = 'Prescribed Medication';
  name = name.charAt(0).toUpperCase() + name.slice(1);

  const lower = clean.toLowerCase();
  let frequency = 'Once daily';
  if (lower.includes('bid') || lower.includes('twice')) frequency = 'Twice daily';
  else if (lower.includes('tid') || lower.includes('three')) frequency = 'Three times daily';
  else if (lower.includes('bedtime') || lower.includes('night') || lower.includes('qhs')) {
    frequency = 'Once daily at bedtime';
  }

  return {
    medicationName: name,
    dosage,
    frequency,
    scheduledTimes: deriveScheduledTimes(frequency),
    instructions: `Take ${dosage} ${frequency.toLowerCase()} with water as directed.`,
    prescribedBy: 'Dr. Sarah Jenkins, MD',
  };
}

/**
 * Saves scanned prescription payload directly to medications store via API.
 */
export async function saveScannedMedication(scan: PrescriptionScanResult): Promise<{
  medication: Medication;
  interactions?: DrugInteraction[];
}> {
  const times = scan.scheduledTimes && scan.scheduledTimes.length > 0
    ? scan.scheduledTimes
    : deriveScheduledTimes(scan.frequency);

  const payload = {
    medicationName: scan.medicationName,
    dosage: scan.dosage,
    frequency: scan.frequency,
    scheduledTimes: times,
    inventoryCount: 30,
    instructions: scan.instructions || 'Take with water as directed.',
    prescribedBy: scan.prescribedBy || 'Dr. Sarah Jenkins, MD (Prescription Scan)',
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
