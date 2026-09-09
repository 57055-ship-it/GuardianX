import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  count = 1,
}) => {
  const getBaseStyle = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full w-12 h-12';
      case 'rectangular':
        return 'rounded-xl w-full h-24';
      case 'card':
        return 'rounded-2xl w-full h-32 bg-slate-900/60 border border-slate-800/80 p-5';
      case 'table-row':
        return 'rounded-lg w-full h-12';
      case 'text':
      default:
        return 'rounded-md w-full h-4';
    }
  };

  const renderItem = (index: number) => (
    <div
      key={index}
      className={`animate-skeleton ${getBaseStyle()} ${className}`}
    />
  );

  if (count > 1) {
    return (
      <div className="space-y-3 w-full">
        {Array.from({ length: count }).map((_, i) => renderItem(i))}
      </div>
    );
  }

  return renderItem(0);
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-4" />
            <Skeleton variant="circular" className="w-8 h-8" />
          </div>
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-48 h-3" />
        </div>
      ))}
    </div>
  );
};
