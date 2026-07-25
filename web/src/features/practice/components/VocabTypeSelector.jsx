import React from 'react';
import { VOCAB_TYPES_CONFIG, GRAMMAR_TYPES_CONFIG } from '../config/quizConfig';
import ReturnButton from './ReturnButton';
import SmoothFade from '@/components/SmoothFade';
import RevealText from '@/components/RevealText';
import { useTransitionContext } from '@/context/TransitionContext';
import { useLanguage } from '@/context/LanguageContext';

export default function VocabTypeSelector({ category, currentTheme, engineState }) {
  const { lang } = useLanguage();
  const { level, setVocabType, setAppState, loadVocabData } = engineState;
  const { triggerExitTransition, isExiting, hasSeenIntro } = useTransitionContext();

  const handleTypeClick = async (type) => {
    if (isExiting) return;
    await triggerExitTransition(2500);
    setVocabType(type);
    if (category === 'vocabulary') {
      loadVocabData(level, type);
    } else {
      setAppState('setup');
    }
  };

  const handleBack = async () => {
    if (isExiting) return;
    await triggerExitTransition(2500);
    engineState.setLevel(null);
    engineState.setAppState('select_level');
  };

  const config = category === 'grammar' ? GRAMMAR_TYPES_CONFIG : VOCAB_TYPES_CONFIG;
  const types = Object.keys(config);

  return (
    <div className="max-w-[1440px] w-full mx-auto py-32 px-4 md:px-8 text-center relative z-10 font-light text-white/80 flex flex-col items-center">
      <SmoothFade delay={0.2} disabled={hasSeenIntro} className="self-start md:self-auto w-full flex justify-start md:justify-center mb-8">
        <ReturnButton onClick={handleBack} />
      </SmoothFade>

      <SmoothFade delay={0.4} disabled={hasSeenIntro} className="flex flex-col items-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight capitalize text-white">
          <RevealText text={level.replace('N', 'Ｎ')} baseDelay={1.6} disabled={hasSeenIntro} />
        </h1>
        <p className="text-xl md:text-2xl font-medium opacity-60 mb-20 text-white">
          <RevealText text={lang === 'ja' ? '学習形式を選択してください' : 'Select study format'} baseDelay={1.8} charDelay={0.02} disabled={hasSeenIntro} />
        </p>
      </SmoothFade>
      
      <SmoothFade delay={1.8} disabled={hasSeenIntro} className="flex flex-wrap justify-center gap-5 w-full max-w-[1440px] mt-12">
        {types.map((type, index) => (
          <button 
            key={type}
            onClick={() => handleTypeClick(type)}
            className="mb-module w-40 h-32 flex flex-col items-center justify-center group cursor-pointer transition-all px-4"
          >
            <span className={`text-2xl font-bold ${currentTheme.color} transition-colors tracking-tight leading-tight`}>
              <RevealText text={lang === 'ja' ? config[type].ja : config[type].en} baseDelay={2.0 + (index * 0.1)} disabled={hasSeenIntro} />
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-[0.1em] mt-3 ${currentTheme.color} opacity-80 group-hover:opacity-100 transition-colors`}>
              <RevealText text={lang === 'ja' ? config[type].en : config[type].ja} baseDelay={2.0 + (index * 0.1)} disabled={hasSeenIntro} />
            </span>
          </button>
        ))}
      </SmoothFade>
    </div>
  );
}
