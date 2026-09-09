import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      {label && <p className="text-xs text-slate-600 font-medium">{label}</p>}
    </div>
  );
};
