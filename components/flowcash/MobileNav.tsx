'use client';

import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Settings,
  Download,
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  activeBg: string;
};

const MOBILE_NAV: NavItem[] = [
  { id: 'dashboard',    label: 'Home',     icon: LayoutDashboard, activeBg: 'bg-violet-600' },
  { id: 'transactions', label: 'Txns',     icon: ArrowLeftRight,  activeBg: 'bg-blue-600' },
  { id: 'analytics',   label: 'Charts',   icon: PieChart,        activeBg: 'bg-emerald-600' },
  { id: 'export',      label: 'Export',   icon: Download,        activeBg: 'bg-cyan-600' },
  { id: 'settings',    label: 'Settings', icon: Settings,        activeBg: 'bg-slate-600' },
];

interface MobileNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 backdrop-blur
        flex items-center justify-around px-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      {MOBILE_NAV.map(({ id, label, icon: Icon, activeBg }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className="flex flex-col items-center gap-1 py-3 px-4 min-w-[56px] transition-all duration-200"
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200
              ${isActive ? activeBg : 'bg-transparent'}`}>
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            </div>
            <span className={`text-[10px] font-medium leading-none
              ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
