import React from 'react';

export function Button({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}) {
  const baseStyles =
    'font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FCD116]/60 focus-visible:ring-offset-0';

  const variants = {
    default:
      'text-white bg-gradient-to-r from-[#00A3E0] to-[#0066B3] hover:from-[#19B6EE] hover:to-[#0072C6] shadow-[0_10px_30px_rgba(0,163,224,0.18)]',
    outline: 'border border-white/15 text-slate-100 hover:bg-white/10',
    ghost: 'text-slate-100 hover:bg-white/10',
    destructive:
      'bg-[#CE1126] text-white hover:bg-[#E3142C] shadow-[0_10px_30px_rgba(206,17,38,0.12)]',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur ${className || ''}`}
    >
      {children}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FCD116]/50 ${className || ''}`}
      {...props}
    />
  );
}

export function Select({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FCD116]/50 ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FCD116]/50 ${className || ''}`}
      {...props}
    />
  );
}

export function Badge({
  children,
  variant = 'default',
  className,
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = {
    default: 'bg-[#00A3E0]/15 text-[#BFEFFF] ring-1 ring-[#00A3E0]/25',
    success: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25',
    warning: 'bg-[#FCD116]/15 text-[#FFF0A8] ring-1 ring-[#FCD116]/25',
    danger: 'bg-[#CE1126]/15 text-[#FFC1C9] ring-1 ring-[#CE1126]/25',
  };

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className || ''}`}
    >
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FCD116]" />
    </div>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-500/25 bg-red-500/10 text-red-200 px-4 py-3">
      {message}
    </div>
  );
}

export function SuccessAlert({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-200 px-4 py-3">
      {message}
    </div>
  );
}


