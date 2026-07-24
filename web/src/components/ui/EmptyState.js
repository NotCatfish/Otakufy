"use client";

import React from 'react';
import Link from 'next/link';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionHref, 
  onAction,
  className = "" 
}) {
  return (
    <div className={`mb-card rounded-2xl p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-hover)] flex items-center justify-center mb-6 border border-[var(--strong-border)]">
          <Icon className="w-8 h-8 text-[var(--muted-text)]" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[14.5px] text-[var(--muted-text)] leading-relaxed mb-8 max-w-md">{description}</p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="px-6 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-[14px] font-semibold hover:opacity-80 transition-colors shadow-lg"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button 
          onClick={onAction}
          className="px-6 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-[14px] font-semibold hover:opacity-80 transition-colors shadow-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
