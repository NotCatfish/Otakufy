"use client";

import Link from 'next/link';
import PageContainer from '../components/PageContainer';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <PageContainer maxWidth="max-w-2xl" className="flex flex-col items-center justify-center min-h-[75vh] text-center animate-slide-up">
      {/* Gamified Japanese Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-serif tracking-[0.2em] uppercase mb-8">
        <span>迷子</span>
        <span>•</span>
        <span>{t("Satori Lost")}</span>
      </div>

      {/* Main 404 Glitch & Heading */}
      <div className="relative mb-6">
        <h1 className="text-8xl sm:text-9xl font-black font-serif tracking-tighter logo-gradient select-none">
          404
        </h1>
        <div className="absolute -inset-4 bg-red-500/5 blur-3xl -z-10 rounded-full"></div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-white mb-4">
        {t("Wandering in the Fog")}
      </h2>

      <p className="text-sm sm:text-base font-light text-[var(--muted-text)] max-w-md mb-10 leading-relaxed">
        {t("You have drifted into the uncharted void between study decks. This realm does not exist or has not yet been unlocked on your Japanese learning journey.")}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm">
        <Link
          href="/"
          className="w-full sm:w-auto flex-1 min-h-[44px] px-8 py-3.5 rounded-full bg-white text-black font-medium text-xs tracking-[0.2em] uppercase hover:bg-[#e5e5e5] transition-all duration-300 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.15)]"
        >
          {t("Return to Dashboard")}
        </Link>
        <Link
          href="/practice/kanji"
          className="w-full sm:w-auto flex-1 min-h-[44px] px-8 py-3.5 rounded-full bg-[var(--surface)] border border-[var(--strong-border)] text-white font-medium text-xs tracking-[0.2em] uppercase hover:border-[var(--divider)] hover:bg-[var(--surface-hover)] transition-all duration-300 flex items-center justify-center"
        >
          {t("Study Kanji")}
        </Link>
      </div>

      {/* Ambient Japanese Background Characters */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] sm:text-[300px] font-serif font-bold text-white/[0.015] pointer-events-none select-none -z-20">
        虚無
      </div>
    </PageContainer>
  );
}
