import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, action, className = '' }) => {
  return (
    <div
      className={`bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-xl transition-all duration-200 hover:border-slate-600/80 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
