import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { UserCheck, Menu } from 'lucide-react';

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAdminAuth();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 lg:pl-64">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs">
            SA
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <span>{user?.name || 'Super Admin'}</span>
              <UserCheck className="w-3 h-3 text-amber-600" />
            </div>
            <div className="text-[10px] text-slate-500">{user?.email || 'admin@guardianx.com'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
