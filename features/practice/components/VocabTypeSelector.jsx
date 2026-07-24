import React from 'react';
import { VOCAB_TYPES_CONFIG, GRAMMAR_TYPES_CONFIG } from '../config/quizConfig';
import ReturnButton from './ReturnButton';
import SmoothFade from '../../../web/src/components/SmoothFade';
import RevealText from '../../../web/src/components/RevealText';
import { useTransitionContext } from '../../../web/src/context/TransitionContext';
import { useLanguage } from '../../../web/src/context/LanguageContext';

export default function VocabTypeSelector({ category, currentTheme, engineState }) {
  const { lang } = useLanguage();
  const { level, setAppState, setVocabType, loadVocabData } = engineState;
  const { triggerExitTransition, isExiting } = useTransitionContext();
  const config = category === 'grammar' ? GRAMMAR_TYPES_CONFIG : VOCAB_TYPES_CONFIG;
  const vocabTypes = Object.values(config);

  const handleBack = async () => {
    if (isExiting) return;
    await triggerExitTransition(2500);
    engineState.navigateBack();
  };

  const handleSelect = async (typeId) => {
    if (isExiting) return;
    await triggerExitTransition(2500);
    setVocabType(typeId);
    loadVocabData(level, typeId);
  };

  return (
    <div className="max-w-[1440px] w-full mx-auto py-24 px-4 md:px-8 relative z-10 font-light text-white/80">
      <SmoothFade delay={0.2} className="mb-8" forceAnimate>
        <ReturnButton onClick={handleBack} />
      </SmoothFade>
      
      <SmoothFade delay={0.4} forceAnimate>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight text-[var(--foreground)]">
          <RevealText text={lang === 'ja' ? "出題形式" : "Question Format"} baseDelay={1.6} forceAnimate />
        </h1>
        <p className="text-xl font-medium opacity-80 mb-16 text-[var(--foreground)]">
          <RevealText text={lang === 'ja' ? `練習したい${level}のドリル形式を選択してください。` : `Select the specific ${level} drill type you want to practice.`} baseDelay={1.8} charDelay={0.02} forceAnimate />
        </p>
      </SmoothFade>
      
      <SmoothFade delay={0.8} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" forceAnimate>
        {vocabTypes.map((type, index) => (
          <button 
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className="mb-module text-left p-8 flex flex-col gap-4 group cursor-pointer transition-all"
          >
            <div className="flex justify-between items-center w-full">
              <span className={`text-2xl font-bold ${currentTheme.color} transition-colors`}>
                <RevealText text={lang === 'ja' ? type.ja : type.en} baseDelay={2.0 + (index * 0.1)} forceAnimate />
              </span>
              <span className={`text-sm opacity-50 group-hover:opacity-100 transition-all font-bold ${currentTheme.color}`}>
                <RevealText text={lang === 'ja' ? '' : type.ja} baseDelay={2.1 + (index * 0.1)} forceAnimate />
              </span>
            </div>
            <p className={`text-sm opacity-80 group-hover:opacity-100 leading-relaxed h-10 ${currentTheme.color} font-medium transition-colors`}>
              <RevealText text={type.desc} baseDelay={2.2 + (index * 0.1)} charDelay={0.015} forceAnimate />
            </p>
            <div className={`mt-4 w-10 h-10 rounded-full border border-[var(--card-border)] group-hover:border-[var(--hover-border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 ${currentTheme.color}`}>
              <span className="text-sm font-bold">→</span>
            </div>
          </button>
        ))}
      </SmoothFade>
    </div>
  );
}
