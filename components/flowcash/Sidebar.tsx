'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Settings,
  Sparkles,
  Rocket,
  CreditCard,
  Bell,
  ChevronRight,
  Download,
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'cards', label: 'Cards', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-[#E5E5E5] z-40"
      style={{ width: '260px' }}>

      {/* Logo */}
      <div className="px-6 py-7 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-[20px] font-bold tracking-tight text-black">FlowCash</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-[#666666] hover:bg-[#F5F5F5] hover:text-black'
                }`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200
                ${isActive ? 'text-white' : 'text-[#666666] group-hover:text-black group-hover:scale-105'}`} />
              <span>{label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/60" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Get Premium Card */}
      <div className="p-4">
        <div className="relative bg-black rounded-3xl p-5 overflow-hidden">
          {/* Decorative gradient blob */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />

          {/* Rocket icon */}
          <div className="relative mb-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <Rocket className="w-5 h-5 text-white" />
            </div>
          </div>

          <p className="text-white font-semibold text-sm mb-0.5">Upgrade to Pro</p>
          <p className="text-white/50 text-xs leading-relaxed mb-4">
            Unlock AI insights, unlimited exports & more.
          </p>

          <button className="w-full bg-white text-black rounded-full py-2 text-xs font-semibold
            hover:bg-white/90 transition-all duration-200 active:scale-95">
            Get Premium
          </button>
        </div>
      </div>
    </aside>
  );
}
