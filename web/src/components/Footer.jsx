"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { lang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render "en" on server and first client render to prevent hydration mismatch.
  const displayLang = mounted ? lang : 'en';

  return (
    <footer className="w-full py-8 text-center text-[12px] text-[var(--muted-text)] relative z-10 border-t border-[var(--divider)]/50 mt-12 font-sans" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-3" suppressHydrationWarning>
        {/* Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-medium" aria-label="Footer navigation">
          <Link 
            href="/terms" 
            className="hover:text-[var(--theme-color)] transition-colors"
          >
            {displayLang === 'ja' ? '利用規約' : 'Terms of Service'}
          </Link>
          <span className="text-[var(--divider)] select-none">•</span>
          <Link 
            href="/privacy" 
            className="hover:text-[var(--theme-color)] transition-colors"
          >
            {displayLang === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
          </Link>
          <span className="text-[var(--divider)] select-none">•</span>
          <Link 
            href="/help" 
            className="hover:text-[var(--theme-color)] transition-colors"
          >
            {displayLang === 'ja' ? 'ヘルプ & FAQ' : 'Help & FAQ'}
          </Link>
        </nav>

        {/* Brand & Copyright */}
        <p className="text-[11px] text-[var(--muted-text)]/80 tracking-wide" suppressHydrationWarning>
          {displayLang === 'ja'
            ? '© 2026 Otakufy · 日本語学習者のための教育プラットフォーム'
            : '© 2026 Otakufy · Built for Japanese Language Learners'}
        </p>
      </div>
    </footer>
  );
}
