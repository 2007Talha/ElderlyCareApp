'use client';

import React from 'react';
import type { UserRole } from '@/types';
import BrandLogo from '@/components/ui/BrandLogo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ComfortModeToggle from '@/components/shared/ComfortModeToggle';
import { HeartHandshake, Stethoscope, UsersRound, Menu } from 'lucide-react';

interface AppHeaderProps {
  readonly role: UserRole;
  readonly comfortMode: boolean;
  readonly onToggleComfort: () => void;
  readonly onOpenMenu: () => void;
}

/** Responsive application header supporting mobile app bar and desktop title bar. */
export default function AppHeader({
  role, comfortMode, onToggleComfort, onOpenMenu,
}: AppHeaderProps) {
  return (
    <>
      {/* Mobile & Tablet App Bar (< lg) */}
      <div className="lg:hidden flex items-center justify-between pb-3.5 mb-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMenu}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BrandLogo size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ComfortModeToggle enabled={comfortMode} onToggle={onToggleComfort} />
        </div>
      </div>

      {/* Desktop Header (>= lg) */}
      <header className="hidden lg:flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {role === 'Elderly Individual' && <HeartHandshake className="w-6 h-6 text-teal-400" />}
            {role === 'Caretaker' && <Stethoscope className="w-6 h-6 text-amber-400" />}
            {role === 'Family Member' && <UsersRound className="w-6 h-6 text-emerald-400" />}
            Welcome, {role}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {role === 'Elderly Individual' && 'Primary Decision-Maker • Full Privacy Autonomy'}
            {role === 'Caretaker' && 'Healthcare Clinical Oversight & Supply Management'}
            {role === 'Family Member' && 'Family Peace-of-Mind & Support Network'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ComfortModeToggle enabled={comfortMode} onToggle={onToggleComfort} />
        </div>
      </header>
    </>
  );
}
