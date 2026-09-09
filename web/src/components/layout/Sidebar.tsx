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
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Fixed Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-30 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3">
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

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
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
                        ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 font-extrabold shadow-xs'
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

        {/* Footer Badge */}
        <div className="p-4 border-t border-slate-200/80 bg-white shrink-0">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-600 flex items-center gap-3">
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
    </>
  );
};

