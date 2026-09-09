import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Baby,
  Building2,
  PackageCheck,
  CreditCard,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminSidebar: React.FC = () => {
  const { logout } = useAdminAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Parents', path: '/parents', icon: Users },
    { label: 'Children', path: '/children', icon: Baby },
    { label: 'Families', path: '/families', icon: Building2 },
    { label: 'Plans', path: '/plans', icon: PackageCheck },
    { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
    { label: 'Usage', path: '/usage', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
            GX
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm tracking-tight">GuardianX</h1>
            <p className="text-[10px] font-bold tracking-wider uppercase text-amber-700">Super Admin Control</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-transparent hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
};
