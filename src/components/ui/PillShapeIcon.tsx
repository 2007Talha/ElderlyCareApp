'use client';

import React from 'react';

export type PillShapeType = 'capsule' | 'round-tablet' | 'oval-caplet' | 'liquid-drop';

interface PillShapeIconProps {
  readonly shape?: PillShapeType;
  readonly medicationName?: string;
  readonly size?: number;
  readonly className?: string;
}

/** Automatically infers pill visual shape from medication name or frequency. */
export function deducePillShape(name?: string): PillShapeType {
  const lower = (name ?? '').toLowerCase();
  if (lower.includes('drop') || lower.includes('liquid') || lower.includes('syrup')) {
    return 'liquid-drop';
  }
  if (lower.includes('omeprazole') || lower.includes('capsule') || lower.includes('cap')) {
    return 'capsule';
  }
  if (lower.includes('metformin') || lower.includes('caplet') || lower.includes('500')) {
    return 'oval-caplet';
  }
  return 'round-tablet';
}

/**
 * Accessible inline SVG component rendering 4 color-coded medication visuals
 * for instant at-a-glance recognition by elderly individuals.
 */
export default function PillShapeIcon({
  shape,
  medicationName,
  size = 28,
  className = '',
}: PillShapeIconProps) {
  const resolvedShape = shape ?? deducePillShape(medicationName);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {resolvedShape === 'capsule' && (
        <g transform="rotate(-30 16 16)">
          {/* Two-tone capsule: Teal + Warm Cream */}
          <rect x="10" y="5" width="12" height="22" rx="6" fill="#14B8A6" stroke="#0D9488" strokeWidth="1.5" />
          <path d="M10 16H22V21C22 24.3137 19.3137 27 16 27C12.6863 27 10 24.3137 10 21V16Z" fill="#FDE68A" />
          <line x1="10" y1="16" x2="22" y2="16" stroke="#B45309" strokeWidth="1" strokeDasharray="1 1" />
          {/* Specular highlight */}
          <path d="M13 8V13" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
        </g>
      )}

      {resolvedShape === 'round-tablet' && (
        <g>
          {/* Circular scored tablet: Rose / Coral tone */}
          <circle cx="16" cy="16" r="11" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="9.5" fill="#FFE4E6" fillOpacity="0.35" />
          <line x1="16" y1="7" x2="16" y2="25" stroke="#BE123C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 11C11.5 9 14 8 16 8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
        </g>
      )}

      {resolvedShape === 'oval-caplet' && (
        <g transform="rotate(45 16 16)">
          {/* Elongated caplet: Sky Blue / Cyan */}
          <rect x="9" y="7" width="14" height="18" rx="7" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <line x1="9" y1="16" x2="23" y2="16" stroke="#0369A1" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M12 10V14" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
        </g>
      )}

      {resolvedShape === 'liquid-drop' && (
        <g>
          {/* Teardrop visual: Purple / Violet */}
          <path
            d="M16 6C16 6 9 15 9 19.5C9 23.6421 12.134 27 16 27C19.866 27 23 23.6421 23 19.5C23 15 16 6 16 6Z"
            fill="#A78BFA"
            stroke="#7C3AED"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M13 18C13 16 14.5 13 15 11" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
        </g>
      )}
    </svg>
  );
}
