import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:bg-indigo-700',
    secondary:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:bg-emerald-700',
    outline:
      'border border-slate-700 hover:bg-slate-800 text-slate-200 hover:border-slate-600 active:bg-slate-800/80',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:bg-rose-700',
    ghost: 'hover:bg-slate-800 text-slate-300 hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg font-medium',
    md: 'px-4 py-2 text-sm rounded-xl font-semibold',
    lg: 'px-6 py-3 text-base rounded-xl font-semibold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
