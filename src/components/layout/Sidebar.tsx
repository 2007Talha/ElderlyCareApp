'use client';

import type { UserRole } from '@/types';
import BrandLogo from '@/components/ui/BrandLogo';
import {
  LayoutDashboard, Pill, Activity, Calendar, MailCheck,
  Sparkles, Send, ShieldCheck, LogOut,
  HeartHandshake, Stethoscope, UsersRound, X,
} from 'lucide-react';

type TabId = 'dashboard' | 'medications' | 'adherence' | 'appointments'
  | 'reminders' | 'assistant' | 'email-log' | 'settings';

interface SidebarProps {
  readonly activeTab: TabId;
  readonly onTabChange: (tab: TabId) => void;
  readonly role: UserRole;
  readonly onLogout: () => void;
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

interface NavItem {
  readonly id: TabId;
  readonly label: string;
  readonly icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'medications', label: 'Medications', icon: <Pill className="w-5 h-5" /> },
  { id: 'adherence', label: 'Adherence', icon: <Activity className="w-5 h-5" /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
  { id: 'reminders', label: 'Reminders', icon: <MailCheck className="w-5 h-5" /> },
  { id: 'assistant', label: 'Smart Assistant', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'email-log', label: 'Email Log', icon: <Send className="w-5 h-5" /> },
  { id: 'settings', label: 'Consent & Settings', icon: <ShieldCheck className="w-5 h-5" /> },
];

/** Responsive Sidebar navigation with desktop docking and mobile/tablet drawer. */
export default function Sidebar({
  activeTab, onTabChange, role, onLogout, isOpen = false, onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          aria-hidden="true"
        />
      )}
      <nav
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border-color flex flex-col h-full shrink-0 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:min-h-screen ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="p-4 border-b border-border-color flex items-center justify-between">
          <div>
            <BrandLogo size="sm" />
            <div className="flex items-center gap-1.5 mt-2.5 px-2 py-1 rounded-md bg-card-subtle border border-border-color w-fit">
              {role === 'Elderly Individual' && <HeartHandshake className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />}
              {role === 'Caretaker' && <Stethoscope className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />}
              {role === 'Family Member' && <UsersRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />}
              <span className="text-xs font-semibold text-text-secondary">{role}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-card-subtle"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ul className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => { onTabChange(item.id); onClose?.(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-card-subtle'
                }`}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="p-4 border-t border-border-color">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-sm text-text-secondary hover:text-danger transition-colors py-1"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}

export type { TabId };
