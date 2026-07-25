import React from 'react';
import { Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { useQuests } from '../hooks/useQuests';
import { useLanguage } from '@/context/LanguageContext';
import RevealText from '@/components/RevealText';


export const toKanji = (str, lang) => {
    if (lang !== 'ja') return str;
      const numToKanji = (numStr) => {
        const kanjiDigits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const positions = ['', '十', '百', '千'];
        const bigPositions = ['', '万', '億', '兆'];
        let num = parseInt(numStr.replace(/,/g, ''), 10);
        if (isNaN(num)) return numStr;
        if (num === 0) return '〇';
        let result = '';
        let bigPosIndex = 0;
        while (num > 0) {
          let part = num % 10000;
          let partStr = '';
          if (part > 0) {
            let posIndex = 0;
            while (part > 0) {
              let digit = part % 10;
              if (digit > 0) {
                let digitStr = kanjiDigits[digit];
                if (digit === 1 && posIndex > 0 && posIndex < 3) digitStr = ''; 
                if (digit === 1 && posIndex === 3) digitStr = ''; 
                partStr = digitStr + positions[posIndex] + partStr;
              }
              part = Math.floor(part / 10);
              posIndex++;
            }
            result = partStr + bigPositions[bigPosIndex] + result;
          }
          num = Math.floor(num / 10000);
          bigPosIndex++;
        }
        return result;
      };
      
      return String(str).replace(/[0-9,]+/g, (match) => {
        if (match === ',') return match;
        return numToKanji(match);
      });
};

export default function DailyObjectives({ userId, isInitialLoad = false }) {
    const { t, lang } = useLanguage();
    const { quests, loading, claimReward } = useQuests(userId);

    if (!userId) {
        return (
            <div className="mb-card rounded-lg relative overflow-hidden min-h-[220px] flex flex-col">
                {/* Blurred template background */}
                <div className="absolute inset-0 p-6 opacity-30 pointer-events-none filter blur-[3px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-32 h-6 bg-[var(--foreground)] rounded-md opacity-40"></div>
                        <div className="w-12 h-4 bg-[var(--foreground)] rounded-md opacity-20"></div>
                    </div>
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-sm border border-[var(--foreground)] opacity-30"></div>
                            <div className="w-48 h-4 bg-[var(--foreground)] rounded-md opacity-20"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-sm border border-[var(--foreground)] opacity-30"></div>
                            <div className="w-40 h-4 bg-[var(--foreground)] rounded-md opacity-20"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-sm border border-[var(--foreground)] opacity-30"></div>
                            <div className="w-52 h-4 bg-[var(--foreground)] rounded-md opacity-20"></div>
                        </div>
                    </div>
                </div>

                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--background)]/60 backdrop-blur-[2px] z-10 text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center mb-4 shadow-xl">
                        <Lock className="w-5 h-5 text-[var(--muted-text)]" />
                    </div>
                    <h3 className="text-[14px] font-semibold tracking-wide text-[var(--foreground)] mb-1.5">
                        {t("Authentication Required")}
                    </h3>
                    <p className="text-[12px] text-[var(--muted-text)] max-w-[220px] leading-relaxed mb-4">
                        {t("Log in or create an account to unlock daily quests and earn XP.")}
                    </p>
                    <Link href="/login" className="text-[11px] uppercase font-bold text-[var(--background)] bg-[var(--foreground)] hover:opacity-85 rounded-sm py-1.5 px-4 transition-opacity">
                        {t("Log In")}
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mb-card rounded-lg p-6 flex flex-col justify-center min-h-[200px]">
                <div className="flex justify-center">
                    <div className="w-6 h-6 border border-[var(--card-border)] border-t-white/50 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    const completedCount = quests.filter(q => q.current_progress >= q.daily_quests_pool.target_amount || q.is_claimed).length;

    return (
      <div className="mb-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[22px] font-semibold text-[var(--foreground)] tracking-wide">
            <RevealText text={t("daily_objectives")} baseDelay={2.8} />
          </div>
          <span className="text-[13px] text-[var(--muted-text)] mb-mono tnum">
            <RevealText text={`${toKanji(completedCount, lang)}`} baseDelay={3.0} />
            <span className="opacity-50">
              <RevealText text={` / ${toKanji(quests.length, lang)}`} baseDelay={3.0} />
            </span>
          </span>
        </div>
        <div>
            {quests.length === 0 && (
              <span className="text-[14px] text-[var(--muted-text)]">
                <RevealText text={t("No quests assigned today.")} baseDelay={3.0} />
              </span>
            )}
            {quests.map((quest, index) => {
                const pool = quest.daily_quests_pool;
                const isComplete = quest.current_progress >= pool.target_amount;
                const isClaimed = quest.is_claimed;
                
                return (
                  <div key={quest.id} className={`mb-row-grid py-3 ${index !== quests.length - 1 ? 'mb-row border-b border-[var(--divider)]' : ''} ${isClaimed ? 'opacity-30' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        {isClaimed ? (
                            <div className="w-3.5 h-3.5 rounded-sm shrink-0 bg-[var(--foreground)]/30 flex items-center justify-center opacity-0 animate-fade-in" style={{ animationDelay: isInitialLoad ? `${3.2 + (0.2 * index)}s` : '0s', animationFillMode: 'forwards' }}>
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--background)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        ) : (
                            <div className={`w-3.5 h-3.5 rounded-sm shrink-0 flex items-center justify-center border transition-colors opacity-0 animate-fade-in ${isComplete ? 'bg-[var(--foreground)] border-[var(--foreground)]' : 'border-[var(--card-border)] bg-[var(--card-bg)]'}`} style={{ animationDelay: isInitialLoad ? `${3.2 + (0.2 * index)}s` : '0s', animationFillMode: 'forwards' }}>
                                {isComplete && <Check className="w-2.5 h-2.5 text-[var(--background)]" />}
                            </div>
                        )}
                        <span className={`text-[13.5px] truncate text-[var(--foreground)] ${isClaimed || isComplete ? 'line-through opacity-50' : 'opacity-90'}`}>
                          <RevealText text={toKanji(t(pool.description), lang)} baseDelay={3.2 + (0.2 * index)} charDelay={0.02} />
                        </span>
                    </div>
                    
                    {!isClaimed && isComplete ? (
                        <button 
                            onClick={() => claimReward(quest.id, pool.xp_reward)}
                            className="text-[11px] uppercase font-bold text-[var(--background)] bg-[var(--foreground)] hover:opacity-85 rounded-sm py-0.5 px-2 text-center transition-opacity col-span-2 opacity-0 animate-fade-in"
                            style={{ animationDelay: isInitialLoad ? `${3.4 + (0.2 * index)}s` : '0s', animationFillMode: 'forwards' }}
                        >
                            <RevealText text={t("Claim")} baseDelay={3.4 + (0.2 * index)} />
                        </button>
                    ) : (
                        <>
                            <span className="mb-mono text-[13px] text-[var(--muted-text)] text-right tnum">
                              <RevealText text={`${toKanji(Math.min(quest.current_progress, pool.target_amount), lang)}`} baseDelay={3.4 + (0.2 * index)} />
                              <span className="opacity-50">
                                <RevealText text={`/${toKanji(pool.target_amount, lang)}`} baseDelay={3.4 + (0.2 * index)} />
                              </span>
                            </span>
                            <span className={`mb-mono text-[13px] text-right tnum text-[var(--foreground)] ${isClaimed ? 'opacity-30' : 'opacity-60'}`}>
                              <RevealText text={`+${toKanji(pool.xp_reward, lang)}${lang === 'ja' ? '経験値' : 'xp'}`} baseDelay={3.4 + (0.2 * index)} />
                            </span>
                        </>
                    )}
                  </div>
                );
            })}
        </div>
      </div>
    );
}
