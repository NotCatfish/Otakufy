"use client";

import React, { useState, useEffect } from 'react';
import * as wanakana from 'wanakana';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { useTransitionContext, TransitionContext } from '@/context/TransitionContext';
import { VOCAB_TYPES_CONFIG, THEME_MAP } from '../config/quizConfig';
import LevelSelector from '../components/LevelSelector';
import VocabTypeSelector from '../components/VocabTypeSelector';
import QuizSetup from '../components/QuizSetup';
import FlashcardView from '../components/FlashcardView';
import SessionSummary from '../components/SessionSummary';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { CheckCircle2, Lock, BookOpen, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function QuizEngine({ category }) {
  const currentTheme = THEME_MAP[category] || THEME_MAP['random'];
  const [mounted, setMounted] = useState(false);
  const { lang } = useLanguage();
  
  const tLocal = (str) => {
    if (lang !== 'ja') return str;
    const map = {
      'Fetching questions...': '問題を読み込んでいます...',
      'SRS Queue Cleared!': 'SRSキューをクリアしました！',
      'You have zero Spaced Repetition reviews due right now. Incredible discipline! The algorithm will schedule more items when they are ready for review.': '現在レビューすべきSRSアイテムはありません。素晴らしい！準備ができたらアルゴリズムがまた追加します。',
      'Study Another Level': '別のレベルを学習する',
      'Sign In Required for SRS': 'SRSにはサインインが必要です',
      'Spaced Repetition (SRS) tracks your personal memory intervals and retention history over time. Please sign in or create a free account to unlock this feature.': '間隔反復 (SRS) は、記憶の間隔と定着履歴を追跡します。この機能を使用するにはサインインまたは無料登録してください。',
      'Sign In / Register': 'サインイン / 登録',
      'No Questions Available Yet': '問題がまだありません',
      "We haven't added practice questions for this level selection in this category yet. Our curriculum is constantly expanding!": 'このカテゴリのこのレベルにはまだ問題が追加されていません。カリキュラムは随時拡張中です！',
      'Select Different Level': '別のレベルを選択する',
      'Connection Issue': '接続エラー',
      'We encountered an issue connecting to the practice database. Please verify your connection and try again.': 'データベースへの接続に問題が発生しました。接続を確認して再試行してください。',
      'Return to Level Selection': 'レベル選択に戻る'
    };
    return map[str] || str;
  };
  
  const engineState = useQuizEngine(category);
  const { appState, isLoading, dispatch } = engineState;
  const transitionContext = useTransitionContext();
  
  const currentKey = `/practice/${category}/${appState}`;
  const isVisited = transitionContext?.hasVisited ? transitionContext.hasVisited(currentKey) : false;

  useEffect(() => {
    if (transitionContext?.registerVisit) {
      transitionContext.registerVisit(currentKey);
    }
  }, [currentKey, transitionContext]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleEsc = async (e) => {
        if (document.querySelector('[data-modal="true"]') || document.querySelector('[role="dialog"]') || document.querySelector('[data-dropdown="true"]')) {
            return;
        }
        const tag = document.activeElement?.tagName;
        if (e.key === 'Escape' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
            e.preventDefault();
            engineState.navigateBack();
        }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [engineState.navigateBack]);

  const handleSelectLevel = (level) => {
    engineState.setLevel(level);
    engineState.setAppState('select_vocab_type');
  };

  const handleSelectType = (type) => {
    dispatch({ type: 'SELECT_TYPE', payload: type });
  };

  const handleStartSession = (config) => {
    dispatch({ type: 'START_SESSION', payload: config });
  };

  const renderWithUnderline = (text) => {
    if (!text) return null;
    const parts = text.split(/\{|\}/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
          return <span key={index} className="underline decoration-[var(--foreground)] decoration-2 underline-offset-2 font-bold opacity-80">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!mounted) return null;

  return (
    <TransitionContext.Provider value={{ ...transitionContext }}>
      <div>
        {isLoading || ((appState === 'setup' || appState === 'playing') && engineState.deckData?.length === 0) ? (
        <div className="max-w-3xl mx-auto py-32 animate-fade-in text-center flex flex-col items-center justify-center relative z-10">
          <div className="w-12 h-12 border-4 border-[var(--strong-border)] border-t-[var(--foreground)] rounded-full otakufy-spin-fast mb-8"></div>
          <h2 className="text-sm font-light text-[var(--muted-text)] tracking-[0.2em] uppercase">{tLocal('Fetching questions...')}</h2>
        </div>
      ) : appState === 'srs_empty' ? (
        <div className="max-w-2xl mx-auto py-16 animate-fade-in relative z-10 px-4">
          <EmptyState
            icon={CheckCircle2}
            title={tLocal("SRS Queue Cleared!")}
            description={tLocal("You have zero Spaced Repetition reviews due right now. Incredible discipline! The algorithm will schedule more items when they are ready for review.")}
            actionLabel={tLocal("Study Another Level")}
            onAction={() => engineState.setAppState('select_level')}
          />
        </div>
      ) : appState === 'srs_unauth' ? (
        <div className="max-w-2xl mx-auto py-16 animate-fade-in relative z-10 px-4">
          <EmptyState
            icon={Lock}
            title={tLocal("Sign In Required for SRS")}
            description={tLocal("Spaced Repetition (SRS) tracks your personal memory intervals and retention history over time. Please sign in or create a free account to unlock this feature.")}
            actionLabel={tLocal("Sign In / Register")}
            actionHref="/login"
          />
        </div>
      ) : appState === 'deck_empty' ? (
        <div className="max-w-2xl mx-auto py-16 animate-fade-in relative z-10 px-4">
          <EmptyState
            icon={BookOpen}
            title={tLocal("No Questions Available Yet")}
            description={tLocal(`We haven't added practice questions for this level selection in this category yet. Our curriculum is constantly expanding!`)}
            actionLabel={tLocal("Select Different Level")}
            onAction={() => engineState.setAppState('select_level')}
          />
        </div>
      ) : appState === 'db_error' ? (
        <div className="max-w-2xl mx-auto py-16 animate-fade-in relative z-10 px-4">
          <EmptyState
            icon={AlertCircle}
            title={tLocal("Connection Issue")}
            description={tLocal("We encountered an issue connecting to the practice database. Please verify your connection and try again.")}
            actionLabel={tLocal("Return to Level Selection")}
            onAction={() => engineState.setAppState('select_level')}
          />
        </div>
      ) : appState === 'select_level' ? (
        <LevelSelector key={`level-${appState}`} category={category} currentTheme={currentTheme} engineState={engineState} hasSeenIntro={isVisited} />
      ) : appState === 'select_vocab_type' ? (
        <VocabTypeSelector key={`vocabtype-${appState}`} category={category} currentTheme={currentTheme} engineState={engineState} hasSeenIntro={isVisited} />
      ) : appState === 'setup' ? (
        <QuizSetup key={`setup-${appState}`} category={category} currentTheme={currentTheme} engineState={engineState} hasSeenIntro={isVisited} />
      ) : appState === 'finished' ? (
        <SessionSummary key={`summary-${appState}`} currentTheme={currentTheme} engineState={engineState} hasSeenIntro={isVisited} />
      ) : appState === 'playing' ? (
        <FlashcardView key={`play-${appState}`} category={category} currentTheme={currentTheme} engineState={engineState} renderWithUnderline={renderWithUnderline} />
      ) : null}

      <ConfirmModal 
        isOpen={engineState.confirmModal?.isOpen}
        message={engineState.confirmModal?.message}
        onConfirm={engineState.confirmModal?.onConfirm}
        onCancel={() => engineState.setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
      />
    </div>
    </TransitionContext.Provider>
  );
}
