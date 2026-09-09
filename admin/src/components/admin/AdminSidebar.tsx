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
  LogOut,
  X
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Fixed Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-30 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
                GX
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm tracking-tight">GuardianX</h1>
                <p className="text-[10px] font-bold tracking-wider uppercase text-amber-700">Super Admin Control</p>
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

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onClose}
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
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Admin Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};
