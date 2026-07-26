"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TransitionLink from '@/components/TransitionLink';
import { PenTool, BookOpen, Asterisk, BookText, Headphones, Shuffle, Play } from 'lucide-react';
import DailyObjectives from '@/features/quests/frontend/DailyObjectives';
import { prefetchCategory } from '@/features/practice/utils/prefetchCategory';
import { calculateLevelStats, getAutoJlptLevel } from '@/features/profile/utils/levelUtils';
import PageContainer from './PageContainer';
import RevealText from './RevealText';
import SmoothFade from './SmoothFade';

import { supabase } from '@/features/auth/frontend/supabaseClient';
import { useLanguage } from '@/context/LanguageContext';
import { SETTINGS_KEYS, getSetting } from '@/features/profile/utils/settingsUtils';
import { useTransitionContext } from '@/context/TransitionContext';
import { PageAnimationGate } from '@/context/PageAnimationContext';
import { PAGE_KEYS } from '@/config/pageKeys';

export default function DashboardClient({ initialProfile }) {
  const { lang, t } = useLanguage();
  const { hasSeenIntro } = useTransitionContext();
  const [profile, setProfile] = useState(initialProfile || null);
  const [mounted, setMounted] = useState(false);
  const [dailyXp, setDailyXp] = useState(0);
  const [xpGoal, setXpGoal] = useState(100);

  const toKanji = (str) => {
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

  useEffect(() => {
    if (!profile) {
      const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (data) setProfile(data);
        }
      };
      fetchProfile();
    }
    
    setMounted(true);
  }, []);

  const { calculatedLevel, currentLevelXp, xpForNext, xpPercent, totalXp } = calculateLevelStats(profile?.xp || 0);
  const autoJlptLevel = getAutoJlptLevel(calculatedLevel);

  useEffect(() => {
      window.history.pushState({ isRoot: true }, "", window.location.href);
      const handlePopState = () => window.history.pushState({ isRoot: true }, "", window.location.href);
      const handleEsc = (e) => { if (e.key === 'Escape') e.preventDefault(); };
      window.addEventListener('popstate', handlePopState);
      window.addEventListener('keydown', handleEsc);
      
      // Aggressively prefetch all core decks into IndexedDB to make quiz loading instant
      setTimeout(() => {
          Promise.all([
              prefetchCategory('kanji'),
              prefetchCategory('vocabulary'),
              prefetchCategory('grammar')
          ]).catch(e => console.error("Background prefetch failed:", e));
      }, 1000); // Small delay to prioritize initial render

      const goal = getSetting(SETTINGS_KEYS.XP_GOAL, 500);
      setXpGoal(goal);
      
      try {
        if (profile?.id) {
          const localDailyStr = localStorage.getItem('otakufy_daily_xp');
          if (localDailyStr) {
            try {
              const allXp = JSON.parse(localDailyStr);
              const today = new Date().toISOString().split('T')[0];
              
              let myXp = allXp[profile.id];
              
              // Handle migration from old format
              if (!myXp && allXp.date === today) {
                myXp = { date: allXp.date, xp: allXp.xp };
              }
              
              if (myXp && myXp.date === today) {
                setDailyXp(myXp.xp);
              } else {
                setDailyXp(0);
              }
            } catch(e) {}
          }
        }
      } catch(e) {}

      return () => {
          window.removeEventListener('popstate', handlePopState);
          window.removeEventListener('keydown', handleEsc);
      };
  }, [profile]);

  if (!mounted) return null;

  return (
    <PageAnimationGate pageKey={PAGE_KEYS.DASHBOARD}>
    <PageContainer >
        
        <SmoothFade as="header" delay={0.2}  className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 mb-10 border-b border-[var(--divider)]">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
              <RevealText text={t("Welcome back.")} baseDelay={0.4}  />
            </h1>
            <p className="text-[21px] text-[var(--muted-text)]">
              <RevealText text={t("\"Continue your path to fluency.\"")} baseDelay={0.6} charDelay={0.03}  />
            </p>
            <div className="flex items-center gap-4 pt-1">
              <SmoothFade 
                delay={0.8}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--badge-streak-bg)] border border-[var(--badge-streak-border)] text-[var(--badge-streak-text)] font-medium text-[14px]`}
              >
                <span className="text-lg leading-none">🔥</span>
                <span>{`${toKanji(profile?.streak || 0)} ${t("Day Streak")}`}</span>
              </SmoothFade>
              <SmoothFade 
                delay={4.2}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--badge-xp-bg)] border border-[var(--badge-xp-border)] text-[var(--badge-xp-text)] font-medium text-[14px] mb-mono`}
              >
                <span>⚡</span>
                <span>{`${toKanji(totalXp.toLocaleString())} ${t("Total XP")}`}</span>
              </SmoothFade>
              
              {(() => {
                const isGoalReached = dailyXp >= xpGoal;
                return (
                  <SmoothFade 
                    delay={4.4}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border font-medium text-[14px] mb-mono transition-all duration-500 ${isGoalReached ? 'border-[var(--theme-color)] text-[var(--theme-color)] shadow-[0_0_15px_rgba(var(--theme-rgb),0.4)]' : 'border-[var(--strong-border)] text-[var(--muted-text)]'}`}
                  >
                    <span>
                      {isGoalReached ? '✅' : '🎯'}
                    </span>
                    <span>{`${dailyXp} / ${xpGoal} ${t("Daily XP")}`}</span>
                  </SmoothFade>
                );
              })()}
            </div>
          </div>
          
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90 relative z-10" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="ring-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="#FF2D6A" />
                    <stop offset="25%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="75%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FF2D6A" />
                    
                    <animateTransform 
                      attributeName="gradientTransform" 
                      type="translate" 
                      values="0,0; -100,0"
                      dur="4s" 
                      repeatCount="indefinite" 
                    />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="var(--background)" strokeWidth="3" className="stroke-[var(--ring-track)]" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="46" 
                  fill="none" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeDasharray="289" 
                  strokeDashoffset={289 - (289 * (xpPercent / 100))}
                  stroke="url(#ring-gradient)"
                  style={{
                    filter: `drop-shadow(0 0 ${4 + (xpPercent / 100) * 8}px rgba(255, 154, 158, ${0.3 + (xpPercent / 100) * 0.5}))`
                  }}
                  className="transition-all duration-1000 ease-out" 
                />
              </svg>
              
              <div className="absolute z-10 text-center flex flex-col items-center justify-center drop-shadow-none">
                <div className="text-[33px] font-semibold leading-none tnum text-[var(--foreground)] mb-0.5">
                  <RevealText text={toKanji(calculatedLevel)} baseDelay={1.0}  />
                </div>
                <div className="text-[10px] text-[var(--muted-text)] tracking-[0.16em] uppercase mb-1">
                  <RevealText text={t("LEVEL")} baseDelay={1.2}  />
                </div>
                <div className="text-[11px] text-[var(--foreground)] mb-mono tnum">
                  <RevealText text={`${toKanji(currentLevelXp)}`} baseDelay={1.4}  />
                  <span className="opacity-50">
                    <RevealText text={` / ${toKanji(xpForNext)}`} baseDelay={1.4}  />
                  </span>
                </div>
              </div>
          </div>
        </SmoothFade>

        {/* Quick Practice */}
        <SmoothFade as="section" delay={1.6}  className="mb-16">
          <h2 className="text-[22px] font-semibold text-[var(--foreground)] mb-6 tracking-wide">
            <RevealText text={t("study_modules")} baseDelay={1.8}  />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { text: "Kanji", path: "kanji", Icon: PenTool },
              { text: "Vocabulary", path: "vocabulary", Icon: BookOpen },
              { text: "Grammar", path: "grammar", Icon: Asterisk },
              { text: "Reading", path: "comprehension", Icon: BookText },
              { text: "Listening", path: "listening", Icon: Headphones },
              { text: "Random", path: "random", Icon: Shuffle }
            ].map((item, i) => (
              <TransitionLink 
                href={`/practice/${item.path}`}
                key={i} 
                onMouseEnter={() => prefetchCategory(item.path)}
                className="mb-module rounded-2xl py-12 flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all"
              >
                <SmoothFade delay={2.0 + (0.1 * i)} as={item.Icon} className={`w-8 h-8 group-hover:opacity-60 transition-opacity text-[var(--foreground)]`} />
                <span className="text-[19px] font-medium text-[var(--foreground)] group-hover:text-[var(--muted-text)] transition-colors">
                  <RevealText text={t(item.text)} baseDelay={2.2 + (0.1 * i)}  />
                </span>
              </TransitionLink>
            ))}
          </div>
        </SmoothFade>

        <SmoothFade delay={2.6}  className="grid md:grid-cols-2 gap-8 md:gap-12">
          <DailyObjectives userId={profile?.id} isInitialLoad={true} />
          
          <section className="mb-card rounded-lg p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-[22px] font-semibold text-[var(--foreground)] mb-5 tracking-wide">
                <RevealText text={t("smart_review")} baseDelay={2.8}  />
              </h2>
              <div className="flex flex-col gap-2">
                <span className="text-[var(--foreground)] font-medium text-[16px]">
                  <RevealText text={t("Spaced Repetition")} baseDelay={3.0}  />
                </span>
                <span className="text-[var(--muted-text)] text-[14.5px] leading-relaxed">
                  <RevealText text={t("Power through your due SRS reviews. The algorithm determines exactly what you need to study for optimal long-term retention. If your queue is empty, you'll automatically start a random") + " " + (lang === 'ja' ? toKanji(autoJlptLevel).replace('N', 'Ｎ') : autoJlptLevel) + " " + t("deck.")} baseDelay={3.2} charDelay={0.015}  />
                </span>
              </div>
            </div>
            <div className="mt-8">
              <SmoothFade delay={3.4} as={Link} href={`/practice/random?state=setup&level=SRS&fallback=${autoJlptLevel}`} className={`inline-flex items-center justify-center w-full py-3.5 rounded-md bg-[var(--foreground)] text-[var(--background)] text-[14.5px] font-semibold hover:opacity-85 transition-opacity`}>
                <Play className="w-4 h-4 mr-2 fill-[var(--background)]" />
                <RevealText text={t("Start SRS Review")} baseDelay={3.4}  />
              </SmoothFade>
            </div>
          </section>
        </SmoothFade>
    </PageContainer>
  </PageAnimationGate>
  );
}
