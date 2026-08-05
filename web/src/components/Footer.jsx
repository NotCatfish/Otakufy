"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { lang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render "en" on server and first client render to prevent hydration mismatch.
  // Once mounted, use the real lang from context.
  const displayLang = mounted ? lang : 'en';

  return (
    <footer className="w-full py-8 text-center text-[11px] text-[var(--muted-text)] relative z-10 opacity-50 hover:opacity-100 transition-opacity" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4" suppressHydrationWarning>
        <p className="mb-1 font-mono uppercase tracking-widest text-[9px] mb-2" suppressHydrationWarning>
          {displayLang === 'ja' ? '免責事項・注意事項' : 'Notice & Disclaimer'}
        </p>
        <p className="mb-1" suppressHydrationWarning>
          {displayLang === 'ja' 
            ? 'このプロジェクトはポートフォリオおよび教育目的のために厳密に構築された「バイブコード」(AI支援) プロジェクトです。' 
            : 'This is a "Vibecoded" (AI-assisted) project built strictly for portfolio and educational purposes.'}
        </p>
        <p suppressHydrationWarning>
          {displayLang === 'ja' 
            ? '作成者は、本ソフトウェアの使用から生じるデータ損失、セキュリティ違反、またはあらゆる損害に対して一切の責任を負いません。本サイトを使用することにより、自己責任において使用することに同意するものとします。' 
            : 'The creator assumes absolutely no liability for data loss, security breaches, or any damages arising from the use of this software. By using this site, you agree to use it entirely at your own risk.'}
        </p>
      </div>
    </footer>
  );
}
