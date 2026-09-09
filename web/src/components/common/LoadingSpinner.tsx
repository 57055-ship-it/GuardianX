import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-600">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse shadow-2xs">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
    </div>
  );
};
