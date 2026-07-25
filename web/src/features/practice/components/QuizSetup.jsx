import React from 'react';
import { VOCAB_TYPES_CONFIG, GRAMMAR_TYPES_CONFIG } from '../config/quizConfig';
import ReturnButton from './ReturnButton';
import { useLanguage } from '@/context/LanguageContext';
import SmoothFade from '@/components/SmoothFade';
import RevealText from '@/components/RevealText';

export default function QuizSetup({ category, currentTheme, engineState, hasSeenIntro = false }) {
  const { t, lang } = useLanguage();
  
  const tLocal = (str) => {
    if (lang !== 'ja') return t(str);
    const map = {
      'Practice': '練習',
      'Example': '例題',
      'Solution': '解答',
      'Overview': '概要',
      'This comprehensive drill will dynamically cycle through all JLPT vocabulary formats. Carefully read the instruction header for each question during the quiz, as the format will constantly change.': 'このドリルはすべてのJLPT形式を順番に出題します。問題ごとの指示をよく読んでください。',
      'New Session': '新規学習セッション',
      'This deck currently holds': 'このデッキに収録されている問題数は',
      'questions': '問',
      'cards': 'カード',
      'How many would you like to study?': '何問学習しますか？',
      'Start Study': '学習を開始する',
      'Saved Sessions': '保存されたセッション',
      'Slot': 'スロット',
      'is empty': 'は空です',
      'Progress': '進捗',
      'Resume': '再開'
    };
    return map[str] || t(str);
  };

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
      return numToKanji(parseInt(match.replace(/,/g, ''), 10));
    }).replace('N', 'Ｎ');
  };
  
  const { 
    level, setAppState, vocabType, deckData, 
    cardAmount, setCardAmount, startNewSession, 
    saves, loadSave, deleteSave 
  } = engineState;

  const handleBack = () => {
    engineState.navigateBack();
  };

  const handleStart = () => {
    startNewSession();
  };

  const handleLoadSave = (index) => {
    loadSave(index);
  };

  const config = category === 'grammar' ? GRAMMAR_TYPES_CONFIG : VOCAB_TYPES_CONFIG;

  return (
    <div className="max-w-[1440px] w-full mx-auto py-24 px-4 md:px-8 relative z-10 flex flex-col font-light tracking-wide text-[var(--foreground)] opacity-90">
      
      <SmoothFade delay={0.2} disabled={hasSeenIntro} className="mb-16">
        <ReturnButton onClick={handleBack} />
      </SmoothFade>

      <SmoothFade delay={0.4} disabled={hasSeenIntro}>
        <h1 className="text-5xl md:text-6xl font-bold mb-16 tracking-tight text-[var(--foreground)]">
          <RevealText text={`${toKanji(level)} ${tLocal("Practice")}`} baseDelay={1.6} disabled={hasSeenIntro} />
        </h1>
      </SmoothFade>
      
      {(category === 'vocabulary' || category === 'grammar') && level !== 'SRS' && (
        <SmoothFade delay={0.8} disabled={hasSeenIntro} className="w-full mb-16 relative">
           <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--strong-border)]">
              <span className="border border-[var(--strong-border)] text-[var(--muted-text)] px-2 py-0.5 rounded text-xs tracking-widest uppercase">{toKanji('N1-N5')}</span>
              <span className="text-[var(--foreground)] font-light tracking-widest text-sm uppercase opacity-90">
                 {lang === 'ja' ? config[vocabType]?.ja : `${config[vocabType]?.en} (${config[vocabType]?.ja})`}
              </span>
           </div>
           
           <div className="flex flex-col gap-8">
               <p className="font-light text-xl text-[var(--foreground)] tracking-wide leading-relaxed opacity-95">
                 <RevealText text={config[vocabType]?.instruction || ""} baseDelay={1.8} charDelay={0.015} disabled={hasSeenIntro} />
               </p>

               {vocabType !== 'random' && (
                 <>
                   <div className="border border-[var(--strong-border)] bg-[var(--surface-hover)] backdrop-blur-md rounded-xl p-6 relative">
                       <span className="absolute -top-3 left-6 bg-[var(--card-bg)] px-2 text-xs font-light tracking-widest text-[var(--muted-text)] uppercase">{tLocal("Example")}</span>
                       <div className="mt-4 flex flex-col items-center">
                           <p className="text-2xl font-light tracking-wide mb-8 text-[var(--foreground)]">
                               {config[vocabType]?.exampleText}
                           </p>
                           <div className="flex gap-6 text-lg w-full justify-center flex-wrap font-light text-[var(--muted-text)]">
                               {config[vocabType]?.exampleOptions}
                           </div>
                       </div>
                   </div>

                   <div className="border border-[var(--strong-border)] bg-[var(--surface-hover)] backdrop-blur-md rounded-xl p-6 relative">
                       <span className="absolute -top-3 left-6 bg-[var(--card-bg)] px-2 text-xs font-light tracking-widest text-[var(--muted-text)] uppercase">{tLocal("Solution")}</span>
                       <div className="mt-4 flex flex-col items-center text-center">
                           {config[vocabType]?.solutionText}
                           <p className="text-xl font-light flex items-center gap-4 text-[var(--foreground)] opacity-90">
                               正しい答えは 
                               <span className={`w-12 h-12 flex items-center justify-center border-2 ${currentTheme.border} rounded-full text-[var(--foreground)] ${currentTheme.bgHover}`}>
                                   {config[vocabType]?.correctAnswer}
                               </span> 
                               です。
                           </p>
                       </div>
                   </div>
                 </>
               )}

               {vocabType === 'random' && (
                   <div className="border border-[var(--strong-border)] bg-[var(--surface-hover)] backdrop-blur-md rounded-xl p-6 relative">
                       <span className="absolute -top-3 left-6 bg-[var(--card-bg)] px-2 text-xs font-light tracking-widest text-[var(--muted-text)] uppercase">{tLocal("Overview")}</span>
                       <div className="mt-4 flex flex-col items-center text-center">
                           <p className="text-xl font-light tracking-wide text-[var(--muted-text)] leading-relaxed max-w-2xl">
                               {tLocal("This comprehensive drill will dynamically cycle through all JLPT vocabulary formats. Carefully read the instruction header for each question during the quiz, as the format will constantly change.")}
                           </p>
                       </div>
                   </div>
               )}
           </div>
        </SmoothFade>
      )}

      <SmoothFade delay={1.2} disabled={hasSeenIntro} className="flex flex-col gap-20">
        <section className="flex flex-col gap-6">
          <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--muted-text)] border-b border-[var(--strong-border)] pb-4">
            <RevealText text={tLocal("New Session")} baseDelay={1.4} disabled={hasSeenIntro} />
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed font-light text-[var(--muted-text)]">
            <RevealText text={`${tLocal("This deck currently holds")}${lang === 'ja' ? '' : ' '}`} baseDelay={2.0} charDelay={0.015} disabled={hasSeenIntro} />
            <SmoothFade as="span" delay={2.4} disabled={hasSeenIntro} className="font-semibold text-3xl text-[var(--foreground)] mx-1.5 inline-block">
              {typeof engineState.totalDbCount === 'number' ? String(toKanji(engineState.totalDbCount)) : String(toKanji(deckData?.length || 0))}
            </SmoothFade>
            <RevealText text={`${lang === 'ja' ? '' : ' '}${category === 'vocabulary' ? tLocal('questions') : tLocal('cards')}. ${tLocal("How many would you like to study?")}`} baseDelay={2.8} charDelay={0.015} disabled={hasSeenIntro} />
          </p>
          
          <SmoothFade delay={5.6} disabled={hasSeenIntro} className="flex items-center gap-6 mt-4">
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={cardAmount}
              onChange={(e) => {
                  engineState.setValidationError && engineState.setValidationError('');
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '') {
                      setCardAmount('');
                  } else {
                      const num = parseInt(val, 10);
                      const maxLimit = deckData?.length || 0;
                      setCardAmount(num > maxLimit ? maxLimit : num);
                  }
              }}
              onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                      e.preventDefault();
                      startNewSession();
                  }
              }}
              className="w-24 bg-transparent border-b border-[var(--strong-border)] text-3xl font-light text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors pb-2 text-center"
            />
            <span className="text-sm text-[var(--muted-text)]">{category === 'vocabulary' ? tLocal('questions') : tLocal('cards')}</span>
          </SmoothFade>
          
          {engineState.validationError && (
              <p className="text-red-400 font-medium tracking-wide mt-2">{engineState.validationError}</p>
          )}
          
          <SmoothFade delay={5.8} disabled={hasSeenIntro} className="mt-6 self-start">
            <button 
              onClick={handleStart}
              className="px-8 py-3 border border-[var(--strong-border)] rounded-full text-sm uppercase tracking-[0.1em] hover:bg-[var(--foreground)] hover:text-[var(--background)] text-[var(--foreground)] transition-all duration-300"
            >
              {tLocal("Start Study")}
            </button>
          </SmoothFade>

          {engineState.isSrsMode && (
            <SmoothFade delay={6.2} disabled={hasSeenIntro} className="mt-8 border border-[var(--strong-border)] bg-[var(--surface-hover)] rounded-xl p-6 relative">
                <span className="absolute -top-3 left-6 bg-[var(--card-bg)] px-2 text-xs font-light tracking-widest text-green-400 uppercase">{tLocal("The Point System")}</span>
                <ul className="mt-2 text-sm text-[var(--muted-text)] font-light space-y-2 leading-relaxed tracking-wide">
                    <li><span className="text-sakura-dark font-medium">{tLocal("First Try:")}</span> {tLocal("Answer correctly on your first attempt to instantly master the card.")}</li>
                    <li><span className="text-yellow-400 font-medium">{tLocal("Mistakes:")}</span> {tLocal("If you make a mistake, you enter the Point System for that card.")}</li>
                    <li><span className="text-green-400 font-medium">+1</span> {tLocal("Point for correct answers.")}</li>
                    <li><span className="text-red-400 font-medium">-1</span> {tLocal("Point for incorrect answers (minimum 0).")}</li>
                    <li><span className="text-[var(--foreground)] font-medium">4</span> {tLocal("Points required to clear the card.")}</li>
                </ul>
            </SmoothFade>
          )}
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--muted-text)] border-b border-[var(--strong-border)] pb-4">
            <RevealText text={tLocal("Saved Sessions")} baseDelay={6.0} disabled={hasSeenIntro} />
          </h2>
          
          <SmoothFade delay={6.4} disabled={hasSeenIntro} className="flex items-start gap-2 text-[11px] text-[var(--muted-text)] italic -mt-2 mb-1 opacity-60">
             <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <p>{tLocal("Mid-quiz saves are stored locally in this browser. They do not sync to the cloud and will be lost if you clear your site data.")}</p>
          </SmoothFade>

          <div className="flex flex-col gap-4">
            {[0, 1].map((index) => {
                const save = saves[index];
                
                if (!save) {
                    return (
                        <div key={index} className="px-6 py-5 border border-[var(--strong-border)] rounded-lg flex items-center text-[var(--muted-text)] text-sm italic opacity-70">
                            {tLocal("Slot")} {toKanji(index + 1)} {tLocal("is empty")}
                        </div>
                    );
                }
                
                const dateObj = new Date(save.date);
                return (
                    <div key={index} className="group px-6 py-5 border border-[var(--strong-border)] bg-[var(--surface)] backdrop-blur-md rounded-lg flex items-center justify-between hover:border-[var(--foreground)] transition-colors">
                        <div className="flex flex-col gap-1">
                          <span className="text-[var(--foreground)] text-lg font-medium">{save.name || `${tLocal('Session')} ${toKanji(index + 1)}`}</span>
                          <span className="text-xs text-[var(--muted-text)]">{toKanji(dateObj.toLocaleDateString())} {toKanji(dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))}</span>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            <div className="text-right flex flex-col gap-1">
                              <span className="text-xs text-[var(--muted-text)] uppercase tracking-wider">{tLocal("Progress")}</span>
                              <span className="text-[var(--foreground)] text-lg">
                                {toKanji(Math.max(0, Math.min(save.initialQueueLength || save.queue.length, (save.initialQueueLength || save.queue.length) - (save.queue.length - save.currentIndex))))} / {toKanji(save.initialQueueLength || save.queue.length)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                  onClick={() => handleLoadSave(index)}
                                  className="px-6 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-full text-xs uppercase tracking-wider hover:opacity-80 transition-colors"
                              >
                                  {tLocal("Resume")}
                              </button>
                              <button 
                                  onClick={() => deleteSave(index)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--muted-text)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors"
                                  title="Delete Session"
                              >
                                  ✕
                              </button>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        </section>
      </SmoothFade>
    </div>
  );
}
