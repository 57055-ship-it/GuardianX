import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldCheck, UserCheck } from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const { user } = useAdminAuth();

  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Production Control Plane
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
            SA
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <span>{user?.name || 'Super Admin'}</span>
              <UserCheck className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-[10px] text-slate-400">{user?.email || 'admin@guardianx.com'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
