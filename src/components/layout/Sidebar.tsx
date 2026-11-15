'use client';

import type { UserRole } from '@/types';
import {
  Heart, Pill, Calendar, Bell, Brain, Mail, Settings, LogOut,
} from 'lucide-react';

type TabId = 'dashboard' | 'medications' | 'adherence' | 'appointments'
  | 'reminders' | 'assistant' | 'email-log' | 'settings';

interface SidebarProps {
  readonly activeTab: TabId;
  readonly onTabChange: (tab: TabId) => void;
  readonly role: UserRole;
  readonly onLogout: () => void;
}

interface NavItem {
  readonly id: TabId;
  readonly label: string;
  readonly icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Heart className="w-5 h-5" /> },
  { id: 'medications', label: 'Medications', icon: <Pill className="w-5 h-5" /> },
  { id: 'adherence', label: 'Adherence', icon: <Bell className="w-5 h-5" /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
  { id: 'reminders', label: 'Reminders', icon: <Bell className="w-5 h-5" /> },
  { id: 'assistant', label: 'Smart Assistant', icon: <Brain className="w-5 h-5" /> },
  { id: 'email-log', label: 'Email Log', icon: <Mail className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

/** Sidebar navigation with role display and logout. */
export default function Sidebar({
  activeTab, onTabChange, role, onLogout,
}: SidebarProps) {
  return (
    <nav
      className="w-64 bg-surface border-r border-gray-800 flex flex-col min-h-screen"
      aria-label="Main navigation"
    >
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-accent" aria-hidden="true" />
          <span className="font-bold text-lg">ElderCare</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{role}</p>
      </div>

      <ul className="flex-1 py-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-accent/10 text-accent border-r-2 border-accent'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-danger transition-colors"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export type { TabId };
