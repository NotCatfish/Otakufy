"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className="h-11 min-h-[44px] px-3.5 rounded-full glass-panel hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg border border-white/15 bg-black/40 hover:bg-black/60 group shrink-0"
      aria-label="Toggle Application Language (English / 日本語)"
      title={lang === "en" ? "Switch to Japanese (日本語)" : "Switch to English"}
    >
      <span className={`text-xs font-bold tracking-wider transition-colors ${lang === "en" ? "text-white underline decoration-sakura dark:decoration-white decoration-2 underline-offset-4" : "text-white/40 group-hover:text-white/70"}`}>
        EN
      </span>
      <span className="text-white/20 text-[10px] select-none">/</span>
      <span className={`text-xs font-bold tracking-wider transition-colors ${lang === "ja" ? "text-sakura dark:text-white underline decoration-white decoration-2 underline-offset-4" : "text-white/40 group-hover:text-white/70"}`}>
        JP
      </span>
    </button>
  );
}
