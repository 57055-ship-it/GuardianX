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
  HelpCircle,
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
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          MAIN MENU
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Need help? Contact GuardianX Support anytime.</span>
        </div>
      </div>
    </aside>
  );
};
