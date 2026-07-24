import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ReturnButton({ onClick, className = 'mb-12' }) {
  const { lang } = useLanguage();
  return (
    <button
      onClick={onClick}
      className={`self-start text-base md:text-lg font-bold uppercase tracking-[0.2em] opacity-70 hover:opacity-100 hover:scale-105 transition-all text-[var(--foreground)] ${className}`}
    >
      ← {lang === 'ja' ? '戻る' : 'Return'}
    </button>
  );
}
