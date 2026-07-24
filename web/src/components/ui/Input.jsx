import React from 'react';

export default function Input({ className = '', ...props }) {
  return (
    <input 
      className={`w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded-xl px-4 py-3 min-h-[48px] text-[13px] outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/30 text-white ${className}`}
      {...props}
    />
  );
}
