import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = <AlertCircle className="w-12 h-12 text-slate-500" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
      <div className="p-3 bg-slate-800/80 rounded-2xl mb-4 border border-slate-700/50">{icon}</div>
      <h3 className="text-lg font-bold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
