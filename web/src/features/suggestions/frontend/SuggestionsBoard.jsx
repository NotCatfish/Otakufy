"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../auth/frontend/supabaseClient';
import SuggestionCard from './SuggestionCard';
import SuggestionForm from './SuggestionForm';
import Toast from '@/components/ui/Toast';
import { useLanguage } from '@/context/LanguageContext';
import { useSuggestions } from '../hooks/useSuggestions';

export default function SuggestionsBoard() {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState('hot'); // 'hot', 'new', 'top'
  const [activeTab, setActiveTab] = useState('board'); // 'board', 'roadmap', 'shipped'
  const [showForm, setShowForm] = useState(false);

  const {
    session,
    suggestions,
    userVotes,
    loading,
    toast,
    setToast,
    isAdmin,
    handleVote,
    handleSubmitSuggestion,
    handleUpdateStatus
  } = useSuggestions(activeTab, sortBy);

  return (
    <div className="flex flex-col gap-8 w-full">
        
        {/* Top Level Tabs */}
        <div className="flex items-center gap-6 border-b border-[var(--strong-border)] pb-4 overflow-x-auto hide-scrollbar">
            {[
                { id: 'board', label: 'Suggestions' },
                { id: 'roadmap', label: 'Roadmap' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'rejected', label: 'Rejected' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-lg md:text-xl font-medium tracking-wide whitespace-nowrap transition-colors ${
                        activeTab === tab.id 
                            ? 'text-white' 
                            : 'text-white/30 hover:text-white/50'
                    }`}
                >
                    {t(tab.label)}
                </button>
            ))}
        </div>

        {/* Header & Controls */}
        <div className="flex flex-col gap-2 mb-2">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
                {activeTab === 'board' ? t('Community Suggestions') : activeTab === 'roadmap' ? t('Coming Soon') : activeTab === 'shipped' ? t('Recently Released') : t('Declined Ideas')}
            </h2>
            <p className="text-[14px] text-white/50">
                {activeTab === 'board' ? t('Vote on existing features or share your own ideas for Otakufy.') : activeTab === 'roadmap' ? t('Features we are actively working on.') : activeTab === 'shipped' ? t('Things we have already built.') : t('Ideas that don\'t fit our current vision.')}
            </p>
        </div>

        {/* Sorting & Timeframe Controls */}
        {activeTab === 'board' && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--strong-border)] pb-4 mb-2">
                <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 hide-scrollbar">
                    {[
                        { id: 'hot', label: 'Trending' },
                        { id: 'top', label: 'Top Rated' },
                        { id: 'new', label: 'Newest' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSortBy(tab.id)}
                            className={`px-4 py-2 rounded font-medium text-[13px] whitespace-nowrap transition-all ${sortBy === tab.id ? 'bg-[var(--surface-hover)] text-white' : 'text-white/50 hover:text-white hover:bg-[var(--surface)]'}`}
                        >
                            {t(tab.label)}
                        </button>
                    ))}
                </div>
                
                {session?.user ? (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-5 py-2 bg-white text-black font-medium text-[13px] rounded-lg hover:bg-white/90 transition-all shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                        {t("New Suggestion")}
                    </button>
                ) : (
                    <div className="px-5 py-2 bg-[var(--surface)] border border-[var(--strong-border)] text-white/40 font-medium text-[13px] rounded-lg shrink-0">
                        {t("Log in to submit")}
                    </div>
                )}
            </div>
        )}

        {/* Board Content */}
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="w-6 h-6 border border-[var(--strong-border)] border-t-white rounded-full animate-spin"></div>
            </div>
        ) : suggestions.length === 0 ? (
            <div className="text-center py-20 text-white/30 text-[13px]">
                <p>{t("Nothing to see here right now.")}</p>
            </div>
        ) : (
            <div className="flex flex-col gap-4">
                {suggestions.map(s => (
                    <SuggestionCard 
                        key={s.id} 
                        suggestion={s} 
                        userVote={s.userVote !== undefined ? s.userVote : (userVotes[s.id] || 0)}
                        onVote={handleVote}
                        isAdmin={isAdmin}
                        onUpdateStatus={handleUpdateStatus}
                    />
                ))}
            </div>
        )}

        {/* Modal Overlay */}
        {showForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <SuggestionForm 
                    onSubmit={handleSubmitSuggestion} 
                    existingSuggestions={suggestions}
                    onClose={() => setShowForm(false)} 
                />
            </div>
        )}
        <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
