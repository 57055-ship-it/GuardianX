import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { Badge } from '../common/Badge';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, tenant, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">GUARDIAN<span className="text-indigo-500">X</span></span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                PARENT PORTAL
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {tenant && (
            <Badge variant="info" size="sm">
              {tenant.name} ({tenant.plan})
            </Badge>
          )}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
                {user?.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-bold text-slate-100">{user?.name}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
