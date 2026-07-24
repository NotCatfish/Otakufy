import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  active = false,
  ...props 
}) {
  const baseClasses = 'transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-white text-black font-semibold hover:bg-white/90 shadow-sm rounded-xl',
    outline: 'border border-[var(--strong-border)] text-white/80 hover:text-white font-semibold hover:border-white/40 bg-[var(--surface-hover)] rounded-xl',
    ghost: active 
      ? 'bg-[var(--surface-hover)] text-white font-medium rounded-lg' 
      : 'text-white/50 hover:text-white font-medium rounded-lg',
    pill: 'rounded-full text-[11px] uppercase tracking-widest font-semibold text-white/50 hover:text-white',
    'pill-active': 'rounded-full text-[11px] uppercase tracking-widest font-semibold bg-white text-black shadow-md',
  };

  const sizes = {
    sm: 'min-h-[36px] px-3 text-[12px]',
    md: 'min-h-[40px] px-4 py-2 text-[13px]',
    lg: 'min-h-[48px] px-6 py-2.5 text-[14px]',
    icon: 'w-10 h-10',
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button 
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
