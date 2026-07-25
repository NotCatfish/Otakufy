import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../auth/frontend/supabaseClient';
import * as wanakana from 'wanakana';
import { SETTINGS_KEYS, getSetting, saveSetting } from '../../profile/utils/settingsUtils';
import { useLanguage } from '@/context/LanguageContext';
import { FuriganaText, updateFuriganaBatch } from './FuriganaText';
import SaveProgressModal from './SaveProgressModal';

export default function FlashcardView({ category, currentTheme, engineState, renderWithUnderline }) {
  const { lang } = useLanguage();
  
  const tLocal = (str) => {
    if (lang !== 'ja') return str;
    const map = {
      'Cancel': 'キャンセル',
      'CLEARED': 'クリア',
      'Mastery: ': '習熟度: ',
      '/ 85% required': '/ 85% 必要',
      'Correct': '正解',
      'Partial': '部分正解',
      'Incorrect': '不正解',
      'Reading': '読み方',
      'Meaning': '意味',
      'Select': '選択',
      'Skip': 'スキップ',
      'Next': '次へ',
      'Save': '保存',
      'Quit': '終了',
      'Finish': '完了',
      'Submit': '決定',
      'Reading (Romaji / Kana)': '読み方 (ローマ字 / かな)',
      'English Meaning': '英語の意味',
      '🔊 Audio': '🔊 音声',
      'Play Audio (Spacebar)': '音声を再生 (スペースキー)',
      'Furigana: ': 'ふりがな: ',
      'ON': 'オン',
      'OFF': 'オフ',
      'Save Progress': '進行状況を保存',
      'Select a slot to save your current session': 'セーブするスロットを選択してください',
      'Session Name (Optional)': 'セッション名 (任意)',
      'Slot ': 'スロット ',
      '(Overwrite)': '(上書き)',
      '(Empty)': '(空)',
      'comprehension': '読解',
      'vocabulary_questions': '単語',
      'grammar_questions': '文法',
      'usage': '使い方'
    };
    return map[str] || str;
  };

  const {
    appState, setAppState, queue, currentIndex, status, initialQueueLength,
    readingInput, setReadingInput, meaningInput, setMeaningInput,
    validationError, setValidationError, showSaveModal, setShowSaveModal, 
    saveName, setSaveName, saveAndQuit,
    handleVocabAnswer, handleSubmit, handleSkip, handleNext, saves
  } = engineState;

  const [selectedOption, setSelectedOption] = useState(null);
  const [totalDbCount, setTotalDbCount] = useState(null);
  const [showFurigana, setShowFurigana] = useState(() => {
      return getSetting(SETTINGS_KEYS.SHOW_FURIGANA, true);
  });

  // Reset to global setting when moving to the next card
  useEffect(() => {
      setShowFurigana(getSetting(SETTINGS_KEYS.SHOW_FURIGANA, true));
  }, [currentIndex]);

  const toggleFurigana = () => {
      const newVal = !showFurigana;
      setShowFurigana(newVal);
  };

  const [toastMessage, setToastMessage] = useState('');

  // Stop background animation strictly during active quiz
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sakura-control", { detail: { action: "stop" } }));
    return () => {
      window.dispatchEvent(new CustomEvent("sakura-control", { detail: { action: "normal" } }));
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const currentCard = queue[currentIndex];
  const displayCategory = currentCard ? (category === 'random' ? (currentCard._source || 'kanji') : category) : '';
  const safeRenderWithUnderline = renderWithUnderline || ((t) => t);

  // Batch Prefetch Furigana for the entire queue when session starts
  useEffect(() => {
    if (appState === 'playing' && queue && queue.length > 0) {
      const textsToFetch = new Set();
      
      queue.forEach(card => {
         if (card.text) textsToFetch.add(card.text);
         if (card.kanji) textsToFetch.add(card.kanji);
         if (card.passage) {
            card.passage.split('\n').forEach(p => textsToFetch.add(p));
         }
         if (card.question) textsToFetch.add(card.question);
         if (card.title) textsToFetch.add(card.title);
         if (card.options && Array.isArray(card.options)) {
            card.options.forEach(o => textsToFetch.add(o));
         }
      });
      
      const missingTexts = Array.from(textsToFetch);
      updateFuriganaBatch(missingTexts);
    }
  }, [appState, queue]);

  const isFuriganaAllowed = useMemo(() => {
      if (status !== 'idle') return true;
      
      // If it's a Flashcard (typing card without options), hide Furigana so we don't give away the reading
      // Note: kanji_reading and kanji_writing have options, so they will pass this check
      if (!currentCard?.options || !Array.isArray(currentCard.options) || currentCard.options.length === 0) {
          if (currentCard?.type === 'kanji_reading' || currentCard?.type === 'kanji_writing') return true; // Just in case it's a flashcard variant
          return false;
      }
      
      return true;
  }, [currentCard, status]);

  const effectiveShowFurigana = isFuriganaAllowed && showFurigana;

  const displayOptions = useMemo(() => {
    if (!currentCard || !currentCard.options || !Array.isArray(currentCard.options)) return [];
    return [...currentCard.options].sort(() => 0.5 - Math.random());
  }, [currentCard?.id, currentIndex]);

  const isSrsMode = engineState.level === 'SRS';
  const currentItemId = currentCard?.parent_id || currentCard?.id;
  const srsStats = engineState.srsSessionStats?.current ? engineState.srsSessionStats.current[currentItemId] : null;

  const getDisplayReading = () => {
    if (!currentCard) return '';
    if (currentCard.reading) return Array.isArray(currentCard.reading) ? currentCard.reading.join(', ') : currentCard.reading;
    const kanjiReadings = [].concat(currentCard.onyomi || [], currentCard.kunyomi || []);
    return kanjiReadings.join(', ');
  };

  const getPrimaryKana = () => {
    const display = getDisplayReading();
    if (!display) return '';
    const first = display.split(',')[0].trim();
    const match = first.match(/（(.*?)）/);
    return match ? match[1] : first;
  };

  const getDisplayMeaning = () => {
    if (!currentCard) return '';
    if (currentCard.meaning) return Array.isArray(currentCard.meaning) ? currentCard.meaning.join(', ') : currentCard.meaning;
    if (currentCard.meanings) return Array.isArray(currentCard.meanings) ? currentCard.meanings.join(', ') : currentCard.meanings;
    return 'N/A';
  };

  const displayExample = currentCard ? (currentCard.example || (currentCard.examples && currentCard.examples.length > 0 ? currentCard.examples[0] : null)) : null;

  // totalDbCount is now fetched in useQuizEngine and exposed via engineState

  useEffect(() => {
    setSelectedOption(null);
    window.scrollTo(0, 0);
  }, [currentIndex]);

  const playAudio = () => {
    if (status === 'idle' && displayCategory === 'kanji') {
        showToast("Audio can only be played after the question is answered.");
        return;
    }
    if (!currentCard || typeof window === 'undefined') return;
    
    let textToSpeak = '';
    
    if (currentCard.kanji) {
        textToSpeak = currentCard.kanji;
    } else if (displayCategory === 'comprehension') {
        textToSpeak = `${currentCard.title}。${currentCard.passage}`;
    } else {
        let text = currentCard.text || '';
        if (text.includes('{}') && typeof currentCard.answer === 'string') {
            text = text.replace('{}', currentCard.answer);
        }
        text = text.replace(/_+/g, '、、、'); // Use commas to force TTS to pause gracefully
        textToSpeak = text.replace(/[{}]/g, '');
    }
    
    if (!textToSpeak) return;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
      if (status !== 'idle' && typeof window !== 'undefined') {
          if (getSetting(SETTINGS_KEYS.AUTO_AUDIO, false)) {
              playAudio();
          }
      }
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSaveModal) {
          if (e.key === 'Escape') {
              e.preventDefault();
              e.stopImmediatePropagation();
              setShowSaveModal(false);
          }
          return;
      }

      // Ignore if typing in an input field
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
          if (e.key === 'Enter' && status !== 'idle') {
              e.preventDefault();
              handleNext();
          }
          return;
      }
      
      if (e.key === 'Enter' && status !== 'idle') {
          e.preventDefault();
          handleNext();
      } else if (e.key === 'Spacebar' || e.key === ' ') {
          e.preventDefault(); 
          if (status !== 'idle' || displayCategory !== 'kanji') {
              playAudio();
          } else {
              showToast("Audio can only be played after the question is answered.");
          }
      } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (status === 'idle') handleSkip();
      } else if (['1','2','3','4'].includes(e.key)) {
          e.preventDefault();
          if (status === 'idle' && displayOptions.length >= parseInt(e.key)) {
              handleVocabAnswer(displayOptions[parseInt(e.key) - 1]);
          }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, displayOptions, currentCard, playAudio, showSaveModal]);

  // Converts {} to underlined blank and {word} to (word) for vocab question display
  const renderVocabText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\{[^}]*\}|_{2,}|＿{2,})/);
    return parts.map((part, i) => {
      if (part === '{}' || /^_{2,}$/.test(part) || /^＿{2,}$/.test(part)) {
        return <span key={i} className="inline-block mx-1 border-b-2 border-sakura-dark/70 dark:border-white/80 font-bold" style={{minWidth: '3rem'}}>&nbsp;&nbsp;&nbsp;&nbsp;</span>;
      }
      if (part.startsWith('{') && part.endsWith('}')) {
        return <span key={i} className="text-sakura-dark dark:text-white">({part.slice(1, -1)})</span>;
      }
      return <FuriganaText key={i} text={part} showFurigana={effectiveShowFurigana} />;
    });
  };

  if (!currentCard) return null;

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 sm:px-6 animate-fade-in flex flex-col items-center min-h-screen relative z-10 font-light text-white/80">
      
      {/* Settings / Toggles */}
      <div className="absolute top-4 right-4 flex gap-3 z-20">
         {isFuriganaAllowed && (
             <button 
                type="button"
                onClick={toggleFurigana}
                className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-full border transition-all flex items-center justify-center ${showFurigana ? 'bg-sakura dark:bg-white text-white dark:text-black border-sakura dark:border-white' : 'bg-transparent text-sakura-dark dark:text-white/60 border-sakura/40 dark:border-white/20 hover:border-sakura dark:hover:border-white/50'}`}
             >
                {tLocal('Furigana: ')}{showFurigana ? tLocal('ON') : tLocal('OFF')}
             </button>
         )}
         <button 
            type="button"
            onClick={playAudio}
            className={`min-h-[44px] min-w-[44px] px-4 py-2 text-xs font-bold rounded-full border transition-all flex items-center justify-center ${(status === 'idle' && displayCategory === 'kanji') ? 'border-sakura/20 dark:border-white/10 text-sakura/40 dark:text-white/20 cursor-not-allowed' : 'border-sakura/40 dark:border-white/20 text-sakura-dark dark:text-white/60 hover:bg-sakura dark:hover:bg-white hover:text-white dark:hover:text-black'}`}
            title={tLocal("Play Audio (Spacebar)")}
         >
            {tLocal("🔊 Audio")}
         </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full z-50 animate-fade-in text-xs uppercase tracking-[0.15em]">
          {toastMessage}
        </div>
      )}

      {/* Save Modal */}
      <SaveProgressModal
        showSaveModal={showSaveModal}
        setShowSaveModal={setShowSaveModal}
        saveName={saveName}
        setSaveName={setSaveName}
        saves={saves}
        saveAndQuit={saveAndQuit}
        tLocal={tLocal}
      />

      {/* Progress Counter */}
      <div className="w-full max-w-xl mx-auto flex flex-col justify-center items-center mb-2">
        <div className="text-sakura-dark dark:text-white/50 font-medium text-sm uppercase tracking-[0.2em] mb-1 mt-6">
          <span className="font-bold text-sakura-dark dark:text-white">{Math.max(0, Math.min(initialQueueLength, initialQueueLength - (queue.length - currentIndex)))}</span> / {initialQueueLength} {tLocal("CLEARED")}
        </div>
        
        {isSrsMode && srsStats && srsStats.attempts > 0 && !(srsStats.attempts === 1 && srsStats.points === 1) && (
            <div className="flex flex-col items-center mt-2 opacity-80 animate-fade-in transition-all duration-500">
                <div className="text-[10px] uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                    <span className="text-white">{tLocal("Points: ")}{srsStats.points || 0}</span> 
                    <span className="opacity-50">{tLocal("/ 4 required")}</span>
                </div>
                <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4].map((point) => (
                        <div 
                            key={point}
                            className={`w-8 h-1.5 rounded-full transition-all duration-700 ${(srsStats.points || 0) >= point ? 'bg-green-400' : 'bg-white/10'}`}
                        />
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Feedback Banner */}
      <div className="h-8 mb-4 flex items-center justify-center text-sm uppercase tracking-[0.2em] font-bold">
        {status === 'correct' && <span className="text-green-400 animate-fade-in">{tLocal("Correct")}</span>}
        {status === 'partial' && <span className="text-yellow-400 animate-fade-in">{tLocal("Partial")}</span>}
        {status === 'incorrect' && <span className="text-red-400 animate-fade-in">{tLocal("Incorrect")}</span>}
      </div>

      {/* Flashcard */}
      <div className="flex flex-col items-center justify-center w-full mb-8 min-h-[150px]">
        {(displayCategory === 'vocabulary' || displayCategory === 'grammar' || displayCategory === 'comprehension') ? (
          <div className="flex flex-col items-center w-full max-w-4xl text-center">
             <span className="text-sm uppercase tracking-[0.3em] text-sakura-dark/40 dark:text-white/40 mb-6">{tLocal(currentCard.type) !== currentCard.type ? tLocal(currentCard.type) : (currentCard.type || '').replace(/_/g, ' ')}</span>
             
             {displayCategory === 'comprehension' && (
                 <div className="w-full bg-sakura/5 dark:bg-black/20 border border-sakura/20 dark:border-white/10 rounded-xl p-6 md:p-10 mb-8 text-left">
                    <h3 className="text-2xl font-bold text-sakura-dark dark:text-white mb-6 border-b border-sakura/20 dark:border-white/10 pb-4 tracking-wide"><FuriganaText text={currentCard.title} showFurigana={effectiveShowFurigana} /></h3>
                    {currentCard.passage.split('\n').map((para, i) => (
                       <p key={i} className="mb-4 last:mb-0 text-lg md:text-xl font-light leading-relaxed tracking-wide text-sakura-dark/90 dark:text-white/90">
                         <FuriganaText text={para} showFurigana={effectiveShowFurigana} />
                       </p>
                     ))}
                 </div>
             )}
             {currentCard.type === 'usage' ? (
                  <span className="text-6xl sm:text-7xl font-normal mb-4 tracking-wider text-sakura dark:text-white dark:font-light leading-tight">
                      {renderVocabText(currentCard.text)}
                  </span>
             ) : displayCategory === 'comprehension' ? (
                 <div className="text-2xl sm:text-3xl font-normal dark:font-light tracking-wider text-sakura-dark dark:text-white/90">
                   <FuriganaText text={currentCard.text || currentCard.question} showFurigana={effectiveShowFurigana} />
                 </div>
             ) : (
                 <p className="text-4xl sm:text-5xl font-light leading-relaxed tracking-wide text-sakura-dark dark:text-white">
                     {renderVocabText(currentCard.text)}
                 </p>
             )}
          </div>
        ) : (
          <>
            <span 
              className={`font-normal transition-all duration-700 ${status === 'correct' ? 'text-green-500 dark:text-green-400' : status === 'partial' ? 'text-yellow-500 dark:text-yellow-400' : status === 'incorrect' ? 'text-red-500 dark:text-red-400' : 'text-sakura dark:text-white'} dark:font-light ${status !== 'idle' ? 'mb-12' : 'mb-0'}`} 
              style={{ fontSize: (currentCard.kanji || currentCard.text || '').length > 20 ? '2.5rem' : (currentCard.kanji || currentCard.text || '').length > 4 ? '4rem' : (currentCard.kanji || currentCard.text || '').length > 2 ? '6rem' : '8rem', lineHeight: effectiveShowFurigana ? '1.5' : '1' }}
            >
              {currentCard.type === 'kanji_reading' || currentCard.type === 'kanji_writing' ? (
                  (currentCard.kanji || currentCard.text || '').split(/(\(.*?\)|（.*?）)/g).map((part, i) => {
                      if (part.startsWith('(') || part.startsWith('（')) {
                          return <span key={i} className="font-bold opacity-90">{part}</span>;
                      }
                      return <FuriganaText key={i} text={part} showFurigana={effectiveShowFurigana} />;
                  })
              ) : (
                  <FuriganaText text={currentCard.kanji || currentCard.text} showFurigana={effectiveShowFurigana} fallbackReading={getPrimaryKana()} />
              )}
            </span>
            
            {status !== 'idle' && (
              <div className="flex flex-col items-center w-full animate-fade-in">
                {displayExample && (
                  <div className="flex flex-col items-center max-w-md text-center mb-8">
                    <span className="text-base text-sakura-dark dark:text-white opacity-90 mb-2">
                        {renderVocabText(displayExample.ja)}
                    </span>
                    <span className="text-sm italic text-[var(--muted-text)] mb-1">{safeRenderWithUnderline(displayExample.ro)}</span>
                    <span className="text-sm text-[var(--muted-text)]">{safeRenderWithUnderline(displayExample.en)}</span>
                  </div>
                )}
                
                <div className="flex gap-16 mb-8">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted-text)] mb-2">{tLocal("Reading")}</span>
                    <span className="text-xl font-light text-[var(--foreground)]">{getDisplayReading()}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted-text)] mb-2">{tLocal("Meaning")}</span>
                    <span className="text-xl font-light text-[var(--foreground)]">{getDisplayMeaning()}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Inputs / Options */}
      {(displayCategory === 'vocabulary' || displayCategory === 'grammar' || displayCategory === 'comprehension') ? (
        <div className="w-full max-w-3xl flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {displayOptions.map((opt, i) => {
              const cleanOpt = typeof opt === 'string' ? opt.replace(/[{}]/g, '') : String(opt || '');
              const cleanAnswer = typeof currentCard.answer === 'string' ? currentCard.answer.replace(/[{}]/g, '') : String(currentCard.answer || '');
              
              let btnClass = "min-h-[52px] py-4 px-6 border rounded-xl text-2xl md:text-3xl transition-all duration-300 text-center relative flex items-center justify-center ";
              if (status === 'idle') {
                const isSelected = selectedOption === opt;
                btnClass += isSelected
                  ? " border-sakura dark:border-white bg-sakura/15 dark:bg-white/10 text-sakura-dark dark:text-white font-medium dark:font-light scale-[1.02]"
                  : " border-sakura/40 dark:border-white/20 text-sakura-dark dark:text-white font-medium dark:font-light hover:border-sakura dark:hover:border-white/60 hover:bg-sakura/10 dark:hover:bg-white/5";
              } else {
                if (cleanOpt === cleanAnswer) {
                  btnClass += " border-green-500 bg-green-500/10 text-green-400";
                } else if (opt === readingInput && cleanOpt !== cleanAnswer) {
                  btnClass += " border-red-500 bg-red-500/10 text-red-400";
                } else {
                  btnClass += " border-sakura/20 dark:border-white/5 text-sakura/40 dark:text-white/20";
                }
              }
              return (
                <button 
                  key={i}
                  disabled={status !== 'idle'}
                  onClick={() => handleVocabAnswer(opt)}
                  className={btnClass}
                >
                  <span className="absolute top-2 left-3 text-[10px] opacity-30">[{i + 1}]</span>
                  <FuriganaText text={cleanOpt} showFurigana={effectiveShowFurigana && (status !== 'idle' || currentCard.type !== 'kanji_writing')} />
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
             {status === 'idle' ? (
                <p className="text-center text-[10px] uppercase tracking-widest text-sakura-dark dark:text-white/50 font-medium mb-2">
                   <kbd className="px-1.5 py-0.5 border border-sakura/40 dark:border-white/20 rounded mx-1 bg-sakura/10 dark:bg-transparent font-mono font-bold text-sakura dark:text-white">1-4</kbd> {tLocal("Select")} &nbsp;•&nbsp; 
                   <kbd className="px-1.5 py-0.5 border border-sakura/40 dark:border-white/20 rounded mx-1 bg-sakura/10 dark:bg-transparent font-mono font-bold text-sakura dark:text-white">→</kbd> {tLocal("Skip")}
                </p>
             ) : (
                <p className="text-center text-[10px] uppercase tracking-widest text-sakura-dark dark:text-white/50 font-medium mb-2">
                   <kbd className="px-1.5 py-0.5 border border-sakura/40 dark:border-white/20 rounded mx-1 bg-sakura/10 dark:bg-transparent font-mono font-bold text-sakura dark:text-white">Enter</kbd> {tLocal("Next")}
                </p>
             )}
             
            {status === 'idle' ? (
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => handleSkip()}
                  className="flex-1 min-h-[44px] py-3 border border-sakura/40 dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-sakura dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-sakura-dark dark:text-white/60 font-medium flex items-center justify-center"
                >
                  {tLocal("Skip")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(true)}
                  className="flex-1 min-h-[44px] py-3 border border-sakura/40 dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-sakura dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-sakura-dark dark:text-white/60 font-medium flex items-center justify-center"
                >
                  {tLocal("Save")}
                </button>
                <button
                  type="button"
                  onClick={() => { setValidationError(''); engineState.navigateBack(); }}
                  className="flex-1 min-h-[44px] py-3 border border-sakura/40 dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-sakura-dark dark:text-white/60 font-medium flex items-center justify-center"
                >
                  {tLocal("Quit")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full animate-fade-in">
                <button 
                  type="button"
                  onClick={handleNext}
                  className="w-full min-h-[48px] py-4 bg-sakura dark:bg-white text-white dark:text-black rounded-full text-xs uppercase tracking-[0.2em] hover:bg-sakura-dark dark:hover:bg-white/90 transition-all font-bold flex items-center justify-center shadow-md dark:shadow-none"
                >
                  {currentIndex + 1 >= queue.length ? tLocal('Finish') : tLocal('Next')}
                </button>
                <div className="flex gap-4 w-full">
                  <button
                    type="button"
                    onClick={() => { setValidationError(''); engineState.navigateBack(); }}
                    className="flex-1 min-h-[44px] py-3 border border-sakura/40 dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all text-sakura-dark dark:text-white/60 font-medium flex items-center justify-center"
                  >
                    {tLocal("Quit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    className="flex-1 min-h-[44px] py-3 border border-sakura/40 dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all text-sakura-dark dark:text-white/60 font-medium flex items-center justify-center"
                  >
                    {tLocal("Save")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col relative">
          {validationError && (
            <div className="absolute -top-8 left-0 right-0 text-center text-red-400 text-xs tracking-widest uppercase animate-fade-in">
              {validationError}
            </div>
          )}

          <div className="flex flex-col mb-8">
            <input 
              id="reading-input"
              type="text" 
              placeholder={tLocal("Reading (Romaji / Kana)")}
              value={readingInput}
              onChange={(e) => setReadingInput(wanakana.toKana(e.target.value, { IMEMode: true }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.getElementById('meaning-input').focus();
                }
              }}
              disabled={status !== 'idle' || showSaveModal}
              autoFocus
              className="w-full bg-transparent border-b border-sakura/40 dark:border-white/20 py-3 text-center text-lg font-medium dark:font-light text-sakura-dark dark:text-white placeholder-sakura/60 dark:placeholder-white/30 focus:outline-none focus:border-sakura-dark dark:focus:border-white transition-colors disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col mb-8">
            <input 
              id="meaning-input"
              type="text" 
              placeholder={tLocal("English Meaning")}
              value={meaningInput}
              onChange={(e) => setMeaningInput(e.target.value)}
              disabled={status !== 'idle' || showSaveModal}
              className="w-full bg-transparent border-b border-sakura/40 dark:border-white/20 py-3 text-center text-lg font-medium dark:font-light text-sakura-dark dark:text-white placeholder-sakura/60 dark:placeholder-white/30 focus:outline-none focus:border-sakura-dark dark:focus:border-white transition-colors disabled:opacity-50"
            />
          </div>
          
          <div className="flex justify-center w-full">
            {status === 'idle' ? (
              <div className="flex flex-col gap-4 w-full">
                <p className="text-center text-[10px] uppercase tracking-widest text-sakura-dark dark:text-white/50 font-medium mb-0 mt-[-10px]">
                   <kbd className="px-1.5 py-0.5 border border-sakura/40 dark:border-white/20 rounded mx-1 bg-sakura/10 dark:bg-transparent font-mono font-bold text-sakura dark:text-white">Enter</kbd> {tLocal("Submit")} &nbsp;•&nbsp; 
                   <kbd className="px-1.5 py-0.5 border border-sakura/40 dark:border-white/20 rounded mx-1 bg-sakura/10 dark:bg-transparent font-mono font-bold text-sakura dark:text-white">→</kbd> {tLocal("Skip")}
                </p>
                <div className="flex gap-6 w-full">
                  <button 
                    type="submit"
                    className="flex-1 py-3 border border-sakura dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] bg-sakura dark:bg-transparent text-white hover:bg-sakura-dark dark:hover:bg-white dark:hover:text-black transition-all font-bold shadow-md dark:shadow-none"
                  >
                    {tLocal("Submit")}
                  </button>
                  <button 
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 py-3 border border-sakura/40 dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-sakura dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-sakura-dark dark:text-white/60 font-medium"
                  >
                    {tLocal("Skip")}
                  </button>
                </div>
                {/* QUIT and SAVE below Submit/Skip */}
                <div className="flex gap-4 w-full">
                  <button 
                    type="button"
                    onClick={() => { setValidationError(''); engineState.navigateBack(); }}
                    className="flex-1 py-3 border border-sakura/40 dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-sakura-dark dark:text-white/60 font-medium"
                  >
                    {tLocal("Quit")}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    className="flex-1 py-3 border border-sakura/40 dark:border-white/20 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-sakura dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-sakura-dark dark:text-white/60 font-medium"
                  >
                    {tLocal("Save")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <p className="text-center text-[10px] uppercase tracking-widest text-sakura-dark dark:text-white/50 font-medium mb-0">
                   <kbd className="px-1.5 py-0.5 border border-sakura/40 dark:border-white/20 rounded mx-1 bg-sakura/10 dark:bg-transparent font-mono font-bold text-sakura dark:text-white">Enter</kbd> {tLocal("Next")}
                </p>
                <button 
                  type="button"
                  onClick={handleNext}
                  className="w-full py-4 bg-sakura dark:bg-white text-white dark:text-black rounded-full text-xs uppercase tracking-[0.2em] hover:bg-sakura-dark dark:hover:bg-white/90 transition-all font-bold shadow-md dark:shadow-none"
                >
                  {currentIndex + 1 >= queue.length ? tLocal('Finish') : tLocal('Next')}
                </button>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
