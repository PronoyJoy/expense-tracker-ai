'use client';

import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Settings,
  Sparkles,
  CreditCard,
  Bell,
  Download,
  ChevronRight,
  Zap,
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badgeClass: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',      icon: LayoutDashboard, badgeClass: 'bg-violet-500/20 text-violet-400' },
  { id: 'transactions',  label: 'Transactions',    icon: ArrowLeftRight,  badgeClass: 'bg-blue-500/20 text-blue-400' },
  { id: 'analytics',    label: 'Analytics',       icon: PieChart,        badgeClass: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'cards',        label: 'Cards',           icon: CreditCard,      badgeClass: 'bg-rose-500/20 text-rose-400' },
  { id: 'notifications',label: 'Notifications',   icon: Bell,            badgeClass: 'bg-amber-500/20 text-amber-400' },
  { id: 'export',       label: 'Export',          icon: Download,        badgeClass: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'settings',     label: 'Settings',        icon: Settings,        badgeClass: 'bg-slate-500/20 text-slate-400' },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40"
      style={{ width: '260px', backgroundColor: '#16213E' }}
    >
      {/* Logo */}
      <div className="px-6 py-7 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-white text-sm font-bold tracking-widest leading-tight">
          AI EXPENSE TRACKER
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon, badgeClass }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {/* Icon badge */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                ${isActive ? 'bg-white/20' : badgeClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">{label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Upgrade card */}
      <div className="p-4">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.15) 100%)',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-3">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <p className="text-white text-sm font-semibold mb-0.5">Upgrade to Pro</p>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Unlock AI insights, unlimited exports &amp; more.
          </p>
          <button
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-2 text-xs font-semibold
              hover:opacity-90 transition-all duration-200 active:scale-95"
          >
            Get Premium
          </button>
        </div>
      </div>
    </aside>
  );
}
