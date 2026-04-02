'use client';

import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  CreditCard,
  Settings,
  Download,
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const MOBILE_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'transactions', label: 'Txns', icon: ArrowLeftRight },
  { id: 'analytics', label: 'Charts', icon: PieChart },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface MobileNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E5E5]
      flex items-center justify-around px-2 pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      {MOBILE_NAV.map(({ id, label, icon: Icon }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`flex flex-col items-center gap-1 py-3 px-4 min-w-[56px] transition-all duration-200
              ${isActive ? 'text-black' : 'text-[#AAAAAA]'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200
              ${isActive ? 'bg-black' : 'bg-transparent'}`}>
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#AAAAAA]'}`} />
            </div>
            <span className={`text-[10px] font-medium leading-none
              ${isActive ? 'text-black' : 'text-[#AAAAAA]'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
