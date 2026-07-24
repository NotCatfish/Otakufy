"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/features/auth/frontend/supabaseClient';
import { toRomaji } from 'wanakana';
import PageContainer from '../../components/PageContainer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SETTINGS_KEYS, getSetting } from '@/features/profile/utils/settingsUtils';
import { useLanguage } from '../../context/LanguageContext';

export default function DictionaryPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('kanji');
  const [searchQuery, setSearchQuery] = useState('');
  const [jlptLevel, setJlptLevel] = useState('All');
  const [questionType, setQuestionType] = useState('All');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRomaji, setShowRomaji] = useState(false);
  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    setShowRomaji(getSetting(SETTINGS_KEYS.SHOW_ROMAJI, false));
  }, []);

  const sortDictionaryResults = (items, sq) => {
    if (!sq || !sq.trim()) return items;
    const q = sq.trim().toLowerCase();

    const cleanString = (str) => {
      if (!str) return '';
      return str.toLowerCase().replace(/^[\s~～\uff5e\(\)-]+/, '').trim();
    };

    const getCandidates = (item) => {
      if (item.kanji) {
        const meanings = Array.isArray(item.meanings) ? item.meanings : [item.meanings || ''];
        const readings = Array.isArray(item.readings) ? item.readings : [item.readings || ''];
        return [
          { type: 'exact_kanji', val: item.kanji.toLowerCase(), clean: cleanString(item.kanji) },
          ...meanings.map(m => ({ type: 'meaning', val: m.toLowerCase(), clean: cleanString(m) })),
          ...readings.map(r => ({ type: 'reading', val: r.toLowerCase(), clean: cleanString(r) })),
        ];
      } else {
        const target = item.target_word || '';
        const ans = item.correct_answer || '';
        const opts = Array.isArray(item.options) ? item.options : [item.options || ''];
        return [
          { type: 'target', val: target.toLowerCase(), clean: cleanString(target) },
          { type: 'answer', val: ans.toLowerCase(), clean: cleanString(ans) },
          ...opts.map(o => ({ type: 'option', val: o.toLowerCase(), clean: cleanString(o) })),
        ];
      }
    };

    const getPriorityAndSortKey = (item) => {
      const cands = getCandidates(item);

      const exactMatch = cands.find(c => c.clean === q || c.val === q);
      if (exactMatch) {
        return { priority: 0, sortKey: exactMatch.clean || exactMatch.val };
      }

      const prefixMatches = cands.filter(c => c.clean.startsWith(q));
      if (prefixMatches.length > 0) {
        prefixMatches.sort((a, b) => {
          if (a.clean.length !== b.clean.length) return a.clean.length - b.clean.length;
          return a.clean.localeCompare(b.clean);
        });
        return { priority: 1, sortKey: prefixMatches[0].clean };
      }

      const containsMatches = cands.filter(c => c.clean.includes(q) || c.val.includes(q));
      if (containsMatches.length > 0) {
        containsMatches.sort((a, b) => {
          if (a.clean.length !== b.clean.length) return a.clean.length - b.clean.length;
          return a.clean.localeCompare(b.clean);
        });
        return { priority: 2, sortKey: containsMatches[0].clean };
      }

      return { priority: 3, sortKey: cleanString(item.kanji || item.target_word || '') };
    };

    return [...items].sort((a, b) => {
      const aMeta = getPriorityAndSortKey(a);
      const bMeta = getPriorityAndSortKey(b);

      if (aMeta.priority !== bMeta.priority) {
        return aMeta.priority - bMeta.priority;
      }

      return aMeta.sortKey.localeCompare(bMeta.sortKey);
    });
  };

  const fetchDictionary = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;
    
    let data = [];
    let error = null;

    if (activeTab === 'kanji') {
        const res = await supabase.rpc('search_kanji_cards', {
            query_text: searchQuery.trim(),
            jlpt_filter: jlptLevel,
            offset_num: currentPage * ITEMS_PER_PAGE,
            limit_num: ITEMS_PER_PAGE
        });
        data = res.data;
        error = res.error;
    } else if (activeTab === 'vocabulary') {
        const typeMap = { 'Reading': 'kanji_reading', 'Orthography': 'kanji_writing', 'Paraphrase': 'paraphrase', 'Usage': 'usage' };
        const qType = questionType !== 'All' ? (typeMap[questionType] || questionType) : 'All';
        const res = await supabase.rpc('search_vocabulary_cards', {
            query_text: searchQuery.trim(),
            jlpt_filter: jlptLevel,
            q_type_filter: qType,
            offset_num: currentPage * ITEMS_PER_PAGE,
            limit_num: ITEMS_PER_PAGE
        });
        data = res.data;
        error = res.error;
    } else if (activeTab === 'grammar') {
        const typeMap = { 'Fill In The Blank': 'fill_in_the_blank', 'Scramble': 'scramble' };
        const qType = questionType !== 'All' ? (typeMap[questionType] || questionType) : 'All';
        const res = await supabase.rpc('search_grammar_cards', {
            query_text: searchQuery.trim(),
            jlpt_filter: jlptLevel,
            q_type_filter: qType,
            offset_num: currentPage * ITEMS_PER_PAGE,
            limit_num: ITEMS_PER_PAGE
        });
        data = res.data;
        error = res.error;
    }

    if (error) {
        console.error("Dictionary fetch error:", error);
    } else {
        let processedData = data || [];
        if (searchQuery.trim() !== '') {
            processedData = sortDictionaryResults(processedData, searchQuery);
        }

        if (reset) {
            setResults(processedData);
        } else {
            setResults(prev => {
                const combined = [...prev, ...processedData];
                return searchQuery.trim() !== '' ? sortDictionaryResults(combined, searchQuery) : combined;
            });
        }
        setHasMore((data || []).length === ITEMS_PER_PAGE);
    }
    setLoading(false);
  }, [activeTab, searchQuery, jlptLevel, questionType, page]);

  useEffect(() => {
    setPage(0);
    const timeoutId = setTimeout(() => {
        fetchDictionary(true);
    }, 400); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [activeTab, searchQuery, jlptLevel, questionType]); // Intentional: we only want this to run when filters change

  useEffect(() => {
    if (page > 0) {
        fetchDictionary(false);
    }
  }, [page]); // Intentional: fetch more when page increments

  // Handle Modal Body Lock & Escape Key
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && selectedItem) {
            e.preventDefault();
            e.stopImmediatePropagation();
            setSelectedItem(null);
        }
    };

    if (selectedItem) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
    } else {
        document.body.style.overflow = 'unset';
    }

    return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItem]);

  return (
    <PageContainer maxWidth="max-w-[1440px]" className="font-medium text-white">
      <header className="mb-12 border-b border-[var(--strong-border)] pb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
          {t("Dictionary")}
        </h1>
        <p className="text-[14px] text-white/50">{t("Search through over 9,000 Kanji, Vocabulary, and Grammar points.")}</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-12">
        <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
                <Input 
                    type="text" 
                    placeholder={t("Search Japanese or English...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12"
                />
                <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            {/* Tabs */}
            <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--strong-border)] shrink-0 min-h-[46px] items-center">
                {['kanji', 'vocabulary', 'grammar'].map(tab => (
                    <Button
                        key={tab}
                        variant="ghost"
                        active={activeTab === tab}
                        onClick={() => { setActiveTab(tab); setQuestionType('All'); }}
                        className="capitalize"
                    >
                        {t(tab)}
                    </Button>
                ))}
            </div>
            
            {/* Level Filter */}
            <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--strong-border)] shrink-0 overflow-x-auto min-h-[46px] items-center hide-scrollbar">
                {['All', 'N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                    <Button
                        key={level}
                        variant="ghost"
                        active={jlptLevel === level}
                        onClick={() => setJlptLevel(level)}
                        className="min-w-[44px]"
                    >
                        {level === 'All' ? t("All") : level}
                    </Button>
                ))}
            </div>
        </div>

        {/* Sub-Filters */}
        {(activeTab === 'vocabulary' || activeTab === 'grammar') && (
            <div className="flex animate-fade-in">
                <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--strong-border)] overflow-x-auto h-[46px] hide-scrollbar">
                    {(activeTab === 'vocabulary' ? ['All', 'Reading', 'Orthography', 'Paraphrase', 'Usage'] : ['All', 'Fill In The Blank', 'Scramble']).map(type => (
                        <Button
                            key={type}
                            variant="ghost"
                            active={questionType === type}
                            onClick={() => setQuestionType(type)}
                            className="whitespace-nowrap"
                        >
                            {t(type)}
                        </Button>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((item, idx) => (
            <div 
                key={`${item.id}-${idx}`} 
                onClick={() => setSelectedItem(item)}
                className="mb-module rounded-2xl p-6 group flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-[var(--surface-hover)] rounded font-medium text-[var(--label-text)]">
                            {item.jlpt_level}
                        </span>
                        {item.question_type && (
                            <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-[var(--strong-border)] rounded font-medium text-[var(--label-text)] opacity-80">
                                {item.question_type.replace('_', ' ')}
                            </span>
                        )}
                    </div>
                    
                    <div className="text-3xl md:text-4xl mb-4 font-semibold tracking-tight text-[var(--foreground)] group-hover:text-[var(--muted-text)] transition-colors leading-snug">
                        {(item.kanji || item.target_word || item.question_text)?.replace(/\{\}/g, '( 　 )')}
                    </div>

                    <div className="space-y-2">
                        {item.readings && (
                            <div className="flex flex-col">
                                <div className="text-[13px] text-[var(--label-text)] font-medium">
                                    {Array.isArray(item.readings) ? item.readings.join(', ') : item.readings}
                                </div>
                            </div>
                        )}
                        
                        {/* Vocab/Grammar Specific Rendering */}
                        {!item.kanji && item.question_text && item.target_word && (
                            <div className="text-[12px] text-[var(--label-text)] italic mt-2 border-l border-[var(--strong-border)] pl-3">
                                {item.question_text.replace(/\{\}/g, '( 　 )')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/5 bg-[var(--error-surface)] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="h-8 w-24 skeleton-shimmer rounded"></div>
                <div className="h-4 w-12 skeleton-shimmer rounded-full"></div>
              </div>
              <div className="h-4 w-48 skeleton-shimmer rounded"></div>
              <div className="h-10 w-full skeleton-shimmer rounded-xl mt-2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
          <div className="py-24 text-center text-white/30 uppercase tracking-widest text-[12px]">
              {t("No results found matching your search.")}
          </div>
      )}

      {/* Load More */}
      {!loading && hasMore && results.length > 0 && (
          <div className="mt-12 text-center">
              <Button 
                variant="outline"
                disabled={false}
                onClick={() => setPage(p => p + 1)}
              >
                  {t("Load More")}
              </Button>
          </div>
      )}

      {/* Modal Overlay */}
      {selectedItem && (
          <div data-modal="true" role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
              {/* Backdrop */}
              <div 
                  className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity duration-300"
                  onClick={() => setSelectedItem(null)}
              ></div>
              
              {/* Modal Card */}
              <div className="relative bg-[var(--background)] border border-[var(--strong-border)] rounded-2xl p-8 sm:p-12 w-full max-w-2xl shadow-2xl animate-scale-up-fast flex flex-col gap-6 max-h-[90vh] overflow-y-auto hide-scrollbar z-10">
                  <button 
                      onClick={() => setSelectedItem(null)}
                      className="absolute top-6 right-6 w-8 h-8 text-white/30 hover:text-white rounded-full flex items-center justify-center transition-colors focus:outline-none"
                  >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div className="flex flex-col gap-4">
                      <div className="flex gap-2 items-center">
                          <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-[var(--surface-hover)] text-white/50 rounded font-medium">
                              {selectedItem.jlpt_level}
                          </span>
                          {selectedItem.question_type && (
                              <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-[var(--strong-border)] text-white/30 rounded font-medium">
                                  {selectedItem.question_type.replace('_', ' ')}
                              </span>
                          )}
                      </div>

                      <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-2 text-white">
                          {(selectedItem.kanji || selectedItem.target_word || selectedItem.question_text)?.replace(/\{\}/g, '( 　 )')}
                      </h2>

                      {selectedItem.readings && (
                          <div className="flex flex-col gap-1">
                              <div className="text-lg sm:text-xl text-white/50 font-medium">
                                  {Array.isArray(selectedItem.readings) ? selectedItem.readings.join(', ') : selectedItem.readings}
                              </div>
                              {showRomaji && (
                                  <div className="text-[12px] text-white/30 mb-mono uppercase">
                                      {Array.isArray(selectedItem.readings) ? selectedItem.readings.map(r => toRomaji(r)).join(', ') : toRomaji(selectedItem.readings)}
                                  </div>
                              )}
                          </div>
                      )}

                      <div className="h-px w-full bg-[var(--card-border)] my-2"></div>

                      <div className="flex flex-col gap-6">
                          {selectedItem.meanings && (
                              <div>
                                  <h3 className="mb-label mb-2 text-sm">{t("meanings")}</h3>
                                  <p className="text-[14px] text-white">
                                      {Array.isArray(selectedItem.meanings) ? selectedItem.meanings.join(', ') : selectedItem.meanings}
                                  </p>
                              </div>
                          )}

                          {!selectedItem.kanji && selectedItem.question_text && selectedItem.target_word && (
                              <div>
                                  <h3 className="mb-label mb-2 text-sm">{t("context")}</h3>
                                  <p className="text-[14px] text-white/50 italic border-l border-[var(--strong-border)] pl-4 py-1">
                                      {selectedItem.question_text.replace(/\{\}/g, '( 　 )')}
                                  </p>
                              </div>
                          )}

                          {selectedItem.options && Array.isArray(selectedItem.options) && (
                              <div>
                                  <h3 className="mb-label mb-2 text-sm">{t("options")}</h3>
                                  <div className="flex flex-wrap gap-2">
                                      {selectedItem.options.map((opt, i) => (
                                          <span key={i} className="px-3 py-1.5 bg-[var(--surface-hover)] border border-[var(--card-border)] rounded-md text-[13px] text-white">
                                              {opt}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {selectedItem.correct_answer && (
                              <div>
                                  <h3 className="mb-label mb-2 text-sm">{t("answer")}</h3>
                                  <p className="text-lg font-medium text-white">
                                      {selectedItem.correct_answer}
                                  </p>
                              </div>
                          )}

                          {selectedItem.example_ja && (
                              <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--strong-border)] mt-2">
                                  <h3 className="mb-label mb-4 text-sm">{t("example_sentence")}</h3>
                                  <p className="text-[14px] font-medium text-white mb-2">{selectedItem.example_ja}</p>
                                  {showRomaji && selectedItem.example_ro && (
                                      <p className="text-[13px] text-white/50 mb-3 italic">{selectedItem.example_ro}</p>
                                  )}
                                  <p className="text-[13px] text-white/30">{selectedItem.example_en}</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </PageContainer>
  );
}
