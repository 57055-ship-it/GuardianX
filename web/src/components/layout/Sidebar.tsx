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
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 border border-teal-500/30 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-lg tracking-tight">GuardianX</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Parent Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
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
                      ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-600 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-slate-900 block text-[11px]">24/7 Safety Active</span>
            <span className="text-[10px] text-slate-500">Multi-Tenant Telemetry</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

