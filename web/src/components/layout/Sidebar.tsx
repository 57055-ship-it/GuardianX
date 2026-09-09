import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  ShieldAlert,
  Bell,
  Smartphone,
  FileBarChart,
  CalendarCheck,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Family & Children', path: '/family', icon: Users },
    { label: 'Live Location', path: '/location', icon: MapPin },
    { label: 'Safe Zones', path: '/safe-zones', icon: ShieldAlert },
    { label: 'SOS & Alerts', path: '/alerts', icon: Bell },
    { label: 'Digital Wellbeing', path: '/usage', icon: Smartphone },
    { label: 'Safety Reports', path: '/reports', icon: FileBarChart },
    { label: 'Family Routines', path: '/routines', icon: CalendarCheck },
    { label: 'Account Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 border border-indigo-400/30 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-100 text-lg tracking-tight">GuardianX</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Parent Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Platform Services
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-transparent text-indigo-300 border-l-2 border-indigo-500 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-slate-200 block text-[11px]">24/7 Safety Active</span>
            <span className="text-[10px] text-slate-400">Multi-Tenant Telemetry</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

