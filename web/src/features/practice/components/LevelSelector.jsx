import React, { useState, useEffect } from 'react';
import ReturnButton from './ReturnButton';
import SmoothFade from '@/components/SmoothFade';
import RevealText from '@/components/RevealText';
import { useTransitionContext } from '@/context/TransitionContext';
import { useLanguage } from '@/context/LanguageContext';

export default function LevelSelector({ category, currentTheme, engineState }) {
  const { lang } = useLanguage();
  const { setLevel, setAppState, loadLevelData } = engineState;
  const { triggerExitTransition, isExiting } = useTransitionContext();
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const key = `levelSelectorAnimated_${category}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, 'true');
    } else {
      setShouldAnimate(false);
    }
  }, [category]);

  const handleLevelClick = async (lvl) => {
    if (isExiting) return;
    await triggerExitTransition(2500);
    if (lvl === 'SRS') {
      loadLevelData(lvl);
    } else if (category === 'vocabulary' || category === 'grammar') {
      setLevel(lvl);
      setAppState('select_vocab_type');
    } else if (category === 'kana') {
      engineState.loadVocabData(lvl, 'random');
    } else {
      loadLevelData(lvl);
    }
  };

  const handleBack = async () => {
    if (isExiting) return;
    await triggerExitTransition(2500);
    engineState.navigateBack();
  };

  return (
    <div className="max-w-[1440px] w-full mx-auto py-32 px-4 md:px-8 text-center relative z-10 font-light text-white/80 flex flex-col items-center">
      <SmoothFade delay={0.2} className="self-start md:self-auto w-full flex justify-start md:justify-center mb-8" forceAnimate={shouldAnimate}>
        <ReturnButton onClick={handleBack} />
      </SmoothFade>
      
      <SmoothFade delay={0.4} className="flex flex-col items-center" forceAnimate={shouldAnimate}>
        <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight capitalize text-white">
          <RevealText text={lang === 'ja' ? (category === 'vocabulary' ? '単語' : category === 'grammar' ? '文法' : category === 'kanji' ? '漢字' : category === 'reading' ? '読解' : category === 'random' ? 'ランダム' : category) : category} baseDelay={1.6} forceAnimate={shouldAnimate} />
        </h1>
        <p className="text-xl md:text-2xl font-medium opacity-60 mb-20 text-white">
          <RevealText text={lang === 'ja' ? '開始するレベルを選択してください' : 'Select a proficiency level to begin'} baseDelay={1.8} charDelay={0.02} forceAnimate={shouldAnimate} />
        </p>
      </SmoothFade>
      
      <SmoothFade delay={0.8} className="flex flex-wrap justify-center gap-5 w-full max-w-[1440px] mt-12" forceAnimate={shouldAnimate}>
        {['N1', 'N2', 'N3', 'N4', 'N5', 'SRS', category === 'random' ? 'Global' : 'Random'].map((lvl, index) => {
          const kanjiMap = {'1': '一', '2': '二', '3': '三', '4': '四', '5': '五'};
          const displayLvl = lang === 'ja' 
            ? lvl.replace('N', 'Ｎ').replace('SRS', 'ＳＲＳ').replace(/[1-5]/g, s => kanjiMap[s] || s)
            : lvl;
          return (
          <button 
            key={lvl}
            onClick={() => handleLevelClick(lvl)}
            className="mb-module w-40 h-32 flex flex-col items-center justify-center group cursor-pointer transition-all"
          >
            <span className={`text-3xl font-bold ${currentTheme.color} transition-colors tracking-tight`}>
              <RevealText text={lvl === 'Global' && lang === 'ja' ? '全レベル' : lvl === 'Random' && lang === 'ja' ? 'ランダム' : displayLvl} baseDelay={2.0 + (index * 0.1)} forceAnimate={shouldAnimate} />
            </span>
            <span className={`text-[11px] font-medium uppercase tracking-[0.2em] mt-3 ${currentTheme.color} opacity-80 group-hover:opacity-100 transition-colors`}>
              <RevealText text={lvl === 'SRS' ? (lang === 'ja' ? '間隔反復' : 'Spaced Rep') : lvl.startsWith('N') ? (lang === 'ja' ? 'JLPT レベル' : 'JLPT Level') : (lang === 'ja' ? 'ミックスデッキ' : 'Mixed Deck')} baseDelay={2.0 + (index * 0.1)} forceAnimate={shouldAnimate} />
            </span>
          </button>
        )})}
      </SmoothFade>
    </div>
  );
}
