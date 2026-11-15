'use client';

import React from 'react';

interface BrandLogoProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly showText?: boolean;
  readonly className?: string;
}

/**
 * Letter-free Brand Logo featuring a protective heart-shield,
 * medical cross, and subtle ECG pulse wave inside a geometric squircle.
 */
export default function BrandLogo({
  size = 'md',
  showText = true,
  className = '',
}: BrandLogoProps) {
  const dimensions = {
    sm: { box: 28, text: 'text-base', sub: 'text-[10px]' },
    md: { box: 36, text: 'text-xl', sub: 'text-xs' },
    lg: { box: 48, text: 'text-2xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={dimensions.box}
        height={dimensions.box}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Elderly Care Platform Logo"
        className="shrink-0 transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id="logoSquircleGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
          <linearGradient id="shieldFill" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Squircle container */}
        <rect width="48" height="48" rx="13" fill="url(#logoSquircleGrad)" />

        {/* Protective Heart-Shield silhouette */}
        <path
          d="M24 9C20 9 12 12.5 12 21C12 29.5 24 38 24 38C24 38 36 29.5 36 21C36 12.5 28 9 24 9Z"
          fill="url(#shieldFill)"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Centered Medical Cross */}
        <path
          d="M24 14V22M20 18H28"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle ECG Pulse Wave */}
        <path
          d="M15 28H19L21.5 24L24 32L26.5 26.5L28.5 29H33"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold tracking-tight text-white ${dimensions.text} font-heading`}>
            ElderCare
          </span>
          <span className={`font-medium tracking-wide text-teal-400 ${dimensions.sub}`}>
            Care & Health Platform
          </span>
        </div>
      )}
    </div>
  );
}
