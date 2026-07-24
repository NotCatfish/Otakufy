"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '../components/PageContainer';
import { useLanguage } from '@/context/LanguageContext';

export default function ErrorBoundary({ error, reset }) {
  const { t } = useLanguage();
  useEffect(() => {
    // Log the error to console or error reporting service
    console.error("Otakufy Route Error:", error);
  }, [error]);

  return (
    <PageContainer maxWidth="max-w-2xl" className="flex flex-col items-center justify-center min-h-[75vh] text-center animate-slide-up">
      {/* Gamified Error Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-serif tracking-[0.2em] uppercase mb-8">
        <span>不具合</span>
        <span>•</span>
        <span>{t("Dojo Interrupted")}</span>
      </div>

      <div className="relative mb-6">
        <h1 className="text-6xl sm:text-7xl font-black font-serif tracking-tight text-white select-none">
          {t("Study Glitch")}
        </h1>
        <div className="absolute -inset-4 bg-red-500/10 blur-3xl -z-10 rounded-full"></div>
      </div>

      <p className="text-sm sm:text-base font-light text-[var(--muted-text)] max-w-md mb-8 leading-relaxed">
        {t("An unexpected disturbance disrupted your study session. Don't worry — your Satori points and streak data are safe.")}
      </p>

      {/* Error Details (Only visible if dev or message present) */}
      {error?.message && (
        <div className="w-full max-w-md p-4 mb-8 bg-[var(--error-surface)] border border-[var(--strong-border)] rounded-xl text-left font-mono text-xs text-[var(--muted-text)] overflow-x-auto">
          <span className="text-red-400 font-semibold block mb-1">{t("Error Details:")}</span>
          {error.message}
        </div>
      )}

      {/* Recovery Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm">
        <button
          onClick={reset}
          className="w-full sm:w-auto flex-1 min-h-[44px] px-8 py-3.5 rounded-full bg-white text-black font-medium text-xs tracking-[0.2em] uppercase hover:bg-[#e5e5e5] transition-all duration-300 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.15)]"
        >
          {t("Try Again")}
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto flex-1 min-h-[44px] px-8 py-3.5 rounded-full bg-[var(--surface)] border border-[var(--strong-border)] text-white font-medium text-xs tracking-[0.2em] uppercase hover:border-[var(--divider)] hover:bg-[var(--surface-hover)] transition-all duration-300 flex items-center justify-center"
        >
          {t("Dashboard")}
        </Link>
      </div>

      {/* Ambient Background Character */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] sm:text-[260px] font-serif font-bold text-white/[0.015] pointer-events-none select-none -z-20">
        不具合
      </div>
    </PageContainer>
  );
}
