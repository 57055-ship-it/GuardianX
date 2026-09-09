import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400 mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-slate-100 mb-2">404 — Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-sm mb-6">
        The requested GuardianX Parent Portal page does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Return to Parent Dashboard</Button>
      </Link>
    </div>
  );
};
