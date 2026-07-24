import React from 'react';
import { Check } from 'lucide-react';
import { useQuests } from '../hooks/useQuests';
import { useLanguage } from '../../../web/src/context/LanguageContext';
import RevealText from '../../../web/src/components/RevealText';


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

    if (!userId) return null;

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
            <RevealText text={t("daily_objectives")} baseDelay={10.0} disabled={!isInitialLoad} />
          </div>
          <span className="text-[13px] text-[var(--muted-text)] mb-mono tnum">
            <RevealText text={`${toKanji(completedCount, lang)}`} baseDelay={10.4} disabled={!isInitialLoad} />
            <span className="opacity-50">
              <RevealText text={` / ${toKanji(quests.length, lang)}`} baseDelay={10.4} disabled={!isInitialLoad} />
            </span>
          </span>
        </div>
        <div>
            {quests.length === 0 && (
              <span className="text-[14px] text-[var(--muted-text)]">
                <RevealText text={t("No quests assigned today.")} baseDelay={10.4} disabled={!isInitialLoad} />
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
                            <div className="w-3.5 h-3.5 rounded-sm shrink-0 bg-[var(--foreground)]/30 flex items-center justify-center opacity-0 animate-fade-in" style={{ animationDelay: isInitialLoad ? `${10.8 + (0.2 * index)}s` : '0s', animationFillMode: 'forwards' }}>
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--background)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        ) : (
                            <div className={`w-3.5 h-3.5 rounded-sm shrink-0 flex items-center justify-center border transition-colors opacity-0 animate-fade-in ${isComplete ? 'bg-[var(--foreground)] border-[var(--foreground)]' : 'border-[var(--card-border)] bg-[var(--card-bg)]'}`} style={{ animationDelay: isInitialLoad ? `${10.8 + (0.2 * index)}s` : '0s', animationFillMode: 'forwards' }}>
                                {isComplete && <Check className="w-2.5 h-2.5 text-[var(--background)]" />}
                            </div>
                        )}
                        <span className={`text-[13.5px] truncate text-[var(--foreground)] ${isClaimed || isComplete ? 'line-through opacity-50' : 'opacity-90'}`}>
                          <RevealText text={toKanji(t(pool.description), lang)} baseDelay={10.8 + (0.2 * index)} disabled={!isInitialLoad} charDelay={0.02} />
                        </span>
                    </div>
                    
                    {!isClaimed && isComplete ? (
                        <button 
                            onClick={() => claimReward(quest.id, pool.xp_reward)}
                            className="text-[11px] uppercase font-bold text-[var(--background)] bg-[var(--foreground)] hover:opacity-85 rounded-sm py-0.5 px-2 text-center transition-opacity col-span-2 opacity-0 animate-fade-in"
                            style={{ animationDelay: isInitialLoad ? `${11.0 + (0.2 * index)}s` : '0s', animationFillMode: 'forwards' }}
                        >
                            <RevealText text={t("Claim")} baseDelay={11.0 + (0.2 * index)} disabled={!isInitialLoad} />
                        </button>
                    ) : (
                        <>
                            <span className="mb-mono text-[13px] text-[var(--muted-text)] text-right tnum">
                              <RevealText text={`${toKanji(Math.min(quest.current_progress, pool.target_amount), lang)}`} baseDelay={11.0 + (0.2 * index)} disabled={!isInitialLoad} />
                              <span className="opacity-50">
                                <RevealText text={`/${toKanji(pool.target_amount, lang)}`} baseDelay={11.0 + (0.2 * index)} disabled={!isInitialLoad} />
                              </span>
                            </span>
                            <span className={`mb-mono text-[13px] text-right tnum text-[var(--foreground)] ${isClaimed ? 'opacity-30' : 'opacity-60'}`}>
                              <RevealText text={`+${toKanji(pool.xp_reward, lang)}${lang === 'ja' ? '経験値' : 'xp'}`} baseDelay={11.0 + (0.2 * index)} disabled={!isInitialLoad} />
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
