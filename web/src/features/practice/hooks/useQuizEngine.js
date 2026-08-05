import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../auth/frontend/supabaseClient';
import PracticeRepository from '../repositories/PracticeRepository';
import ProfileRepository from '../../profile/repositories/ProfileRepository';
import localforage from 'localforage';
import * as wanakana from 'wanakana';
import { validateField } from '../utils/validationUtils';
import { prefetchCategory } from '../utils/prefetchCategory';
import { getTodayDateString } from '../../profile/utils/timeUtils';
import { useRouter } from 'next/navigation';

export const useQuizEngine = (category) => {
  const router = useRouter();
  const [appState, setAppState] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.replace('#', '?')) : null;
      return searchParams.get('state') || (hashParams && hashParams.get('state')) || 'select_level';
    }
    return 'select_level';
  });
  const [level, setLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.replace('#', '?')) : null;
      return searchParams.get('level') || (hashParams && hashParams.get('level')) || null;
    }
    return null;
  });
  const [vocabType, setVocabType] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.replace('#', '?')) : null;
      return searchParams.get('vocabType') || (hashParams && hashParams.get('vocabType')) || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalDbCount, setTotalDbCount] = useState(null);
  
  // Setup State
  const [deckData, setDeckData] = useState([]);
  const [cardAmount, setCardAmount] = useState(20);
  const [saves, setSaves] = useState([null, null]);

  // Playing State
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [readingInput, setReadingInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, correct, partial, incorrect, finished
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [isSavingXP, setIsSavingXP] = useState(false);
  const [xpSaved, setXpSaved] = useState(false);
  const [leveledUpTo, setLeveledUpTo] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [failedItems, setFailedItems] = useState([]);
  const [initialQueueLength, setInitialQueueLength] = useState(0);
  const [quizSessionId, setQuizSessionId] = useState(null);
  const sessionAttemptsRef = useRef(new Set());
  const srsSessionStats = useRef({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const emptySubmitRef = useRef(0);

  // Handle page refresh while in playing/setup state without data
  useEffect(() => {
      if (appState === 'playing' && deckData.length === 0 && !isLoading) {
          const autoSave = sessionStorage.getItem('otakufy_autosave');
          if (autoSave) {
              try {
                  const parsed = JSON.parse(autoSave);
                  setTimeout(() => {
                    setQueue(parsed.queue);
                    setCurrentIndex(parsed.currentIndex);
                    setScore(parsed.score);
                    setStatus(parsed.status || 'idle');
                    setQuizSessionId(parsed.quizSessionId || null);
                    setInitialQueueLength(parsed.initialQueueLength || parsed.queue.length);
                    setDeckData(parsed.queue); // satisfy data dependencies
                  }, 0);
                  return; // Auto-resume successful
              } catch(e) {
                  console.warn("Failed to parse autosave", e);
              }
          }
      }

      if ((appState === 'playing' || appState === 'setup') && deckData.length === 0 && !isLoading) {
          if (level) {
              if (category === 'vocabulary' || category === 'grammar') {
                  if (vocabType) loadVocabData(level, vocabType);
              } else if (category === 'comprehension') {
                  loadVocabData(level, 'random');
              } else {
                  loadLevelData(level);
              }
          } else {
              // eslint-disable-next-line react-hooks/set-state-in-effect
              setAppState('select_level');
              setLevel(null);
              setVocabType(null);
          }
      }
  }, [appState, deckData.length, isLoading, level, vocabType, category]);

  // Auto-backup session state to survive F5 refreshes
  useEffect(() => {
      if (appState === 'playing' && queue.length > 0) {
          sessionStorage.setItem('otakufy_autosave', JSON.stringify({
              queue, currentIndex, score, category, level, status, quizSessionId, initialQueueLength
          }));
      } else if (appState === 'finished' || appState === 'select_level') {
          sessionStorage.removeItem('otakufy_autosave');
      }
  }, [queue, currentIndex, score, status, appState, category, level, quizSessionId, initialQueueLength]);

  const fetchAll = async (buildQuery) => {
      let allData = [];
      let from = 0;
      const step = 1000;
      while (true) {
          const query = buildQuery();
          const { data, error } = await query.range(from, from + step - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          allData.push(...data);
          if (data.length < step) break;
          from += step;
      }
      return allData;
  };

  // Prefetch everything for the selected category in the background
  useEffect(() => {
      if ((appState === 'select_level' || appState === 'select_vocab_type') && category) {
          prefetchCategory(category);
      }
  }, [appState, category]);

  const getDbVocabType = (typeId) => {
    const map = {
        'reading': 'kanji_reading',
        'orthography': 'kanji_writing',
        'context': 'fill_in_the_blank',
        'paraphrase': 'paraphrase',
        'usage': 'usage',
        'scramble': 'scramble'
    };
    return map[typeId] || typeId;
  };

  // Fetch total database count for display in QuizSetup
  useEffect(() => {
    const fetchExactCount = async () => {
      const lvl = level;
      const type = vocabType;
      if (!lvl) return;
      let total = 0;
      
      const isAll = (lvl === 'Global' || lvl === 'Random');
      
      const applyFilters = (query, currentCategory, specificType) => {
          if (!isAll) query = query.eq('jlpt_level', lvl);
          if (specificType) {
              query = query.eq('question_type', specificType);
          } else if (type && type !== 'random' && currentCategory !== 'kanji' && currentCategory !== 'comprehension') {
              query = query.eq('question_type', getDbVocabType(type));
          }
          return query;
      };

      const isRandomMode = (category === 'random');

      const getCount = async (table, currentCategory, specificType) => {
          const { count } = await applyFilters(supabase.from(table).select('*', { count: 'exact', head: true }), currentCategory, specificType);
          return count || 0;
      };

      const sumTypes = async (table, currentCategory, types) => {
          const counts = await Promise.all(types.map(t => getCount(table, currentCategory, t)));
          return counts.reduce((a, b) => a + b, 0);
      };

      if (category === 'kanji' || isRandomMode) {
          total += await getCount('kanji_data', 'kanji');
      }
      
      if (category === 'vocabulary' || isRandomMode) {
          if (type === 'random' && category === 'vocabulary') {
              total += await sumTypes('vocabulary_questions', 'vocabulary', ['kanji_reading', 'kanji_writing', 'paraphrase', 'usage']);
          } else {
              total += await getCount('vocabulary_questions', 'vocabulary');
          }
      }
      
      if (category === 'grammar' || isRandomMode) {
          if (type === 'random' && category === 'grammar') {
              total += await sumTypes('grammar_questions', 'grammar', ['fill_in_the_blank', 'scramble']);
          } else {
              total += await getCount('grammar_questions', 'grammar');
          }
      }
      
      if (category === 'comprehension' || isRandomMode) {
          total += await getCount('comprehension_questions', 'comprehension');
      }
      setTotalDbCount(total);
    };
    
    if (appState === 'setup' || appState === 'select_amount') {
        fetchExactCount();
    }
  }, [category, level, vocabType, appState]);

  const loadDeck = async (selectedLevel, typeId = null) => {
    // Failsafe for HMR state issues
    if (!selectedLevel) {
        selectedLevel = level;
        if (!selectedLevel) {
            console.error("Quiz Engine Terminal Log: Level is not selected properly.");
            setAppState('select_level');
            return;
        }
    }

    setLevel(selectedLevel);
    if (category === 'vocabulary' || category === 'grammar') {
        setVocabType(typeId);
    }
    
    let cacheKey = '';
    let saveKey = '';
    let dbType = typeId ? getDbVocabType(typeId) : null;
    
    if (category === 'random') {
        cacheKey = `otakufy_cache_random_v13_${selectedLevel}`;
        saveKey = `${category}_${selectedLevel}`;
    } else if (category === 'kanji' || category === 'comprehension') {
        cacheKey = `otakufy_cache_${category}_v13_${selectedLevel}`;
        saveKey = `${category}_${selectedLevel}`;
    } else {
        saveKey = `${category}_${selectedLevel}_${typeId}`;
        cacheKey = `otakufy_cache_${category}_v13_${selectedLevel}_${typeId}`;
    }

    // 1. Check cache first (Bypass if SRS)
    if (selectedLevel !== 'SRS') {
        try {
            const data = await localforage.getItem(cacheKey);
            if (data && data.length > 0) {
                setDeckData(data);
                setCardAmount(Math.min(20, data.length));
                const localSaves = JSON.parse(localStorage.getItem('otakufy_saves') || '{}');
                setSaves(localSaves[saveKey] || [null, null]);
                setAppState('setup');
                
                // Background update for non-global categories
                if (category !== 'random' && category !== 'kanji') {
                    const tableName = category === 'vocabulary' ? 'vocabulary_questions' : category === 'grammar' ? 'grammar_questions' : 'comprehension_questions';
                    fetchAll(() => {
                        let bgQuery = supabase.from(tableName).select('*');
                        if (selectedLevel !== 'Random') bgQuery = bgQuery.eq('jlpt_level', selectedLevel);
                        if (typeId && typeId !== 'random') bgQuery = bgQuery.eq('question_type', dbType);
                        return bgQuery;
                    }).then(allData => {
                        if (allData.length > 0) {
                            try { localforage.setItem(cacheKey, allData); } catch(e) {}
                        }
                    }).catch(err => console.error("Background fetch error:", err));
                }
                setIsLoading(false);
                return;
            }
        } catch (e) {
            console.warn("Cache read failed", e);
        }
    }

    setIsLoading(true);
    
    try {
      let combinedData = [];

      // Fetch ALL questions and rely on browser memory for fast shuffling
      const fetchFullTable = async (table, source, jlpt, qtype) => {
          const allData = await fetchAll(() => {
              let q = supabase.from(table).select('*');
              if (jlpt !== 'Random' && jlpt !== 'Global') q = q.eq('jlpt_level', jlpt);
              if (qtype) q = q.eq('question_type', qtype);
              return q;
          });
          return allData.map(d => ({...d, _source: source}));
      };

      if (selectedLevel === 'SRS') {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              setAppState('srs_unauth');
              setLevel(null);
              setIsLoading(false);
              return;
          }
          
          let srsQuery = supabase
              .from('srs_reviews')
              .select('item_id, category')
              .eq('user_id', user.id)
              .eq('is_completed', false);
              
          if (category !== 'random') {
              srsQuery = srsQuery.eq('category', category);
          }
          
          const { data: dueItems, error: srsError } = await srsQuery;
          if (srsError) throw srsError;
          
          if (!dueItems || dueItems.length === 0) {
              const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
              const hashParams = typeof window !== 'undefined' && window.location.hash ? new URLSearchParams(window.location.hash.replace('#', '?')) : null;
              const fallback = searchParams?.get('fallback') || (hashParams && hashParams.get('fallback'));
              
              if (fallback) {
                  if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', `?state=setup&level=${fallback}`);
                  }
                  setTimeout(() => loadDeck(fallback, typeId), 50);
                  return;
              }
              
              setAppState('srs_empty');
              setLevel(null);
              setIsLoading(false);
              return;
          }
          
          const grouped = dueItems.reduce((acc, curr) => {
              if (!acc[curr.category]) acc[curr.category] = [];
              acc[curr.category].push(curr.item_id);
              return acc;
          }, {});
          
          const getTable = (cat) => cat === 'vocabulary' ? 'vocabulary_questions' : cat === 'grammar' ? 'grammar_questions' : cat === 'comprehension' ? 'comprehension_questions' : 'kanji_data';
          
          const results = await Promise.all(Object.entries(grouped).map(async ([cat, ids]) => {
              const table = getTable(cat);
              const { data } = await supabase.from(table).select('*').in('id', ids);
              return (data || []).map(d => ({...d, _source: cat}));
          }));
          
          combinedData = results.flat();
          
      } else if (category === 'random') {
          const tables = [
              { t: 'kanji_data', s: 'kanji' },
              { t: 'vocabulary_questions', s: 'vocabulary' },
              { t: 'grammar_questions', s: 'grammar' },
              { t: 'comprehension_questions', s: 'comprehension' }
          ];
          const results = await Promise.all(tables.map(({t, s}) => fetchFullTable(t, s, selectedLevel, null)));
          combinedData = results.flat();
      } else if (category === 'vocabulary' && typeId === 'random') {
          const types = ['kanji_reading', 'kanji_writing', 'paraphrase', 'usage'];
          const results = await Promise.all(types.map(t => fetchFullTable('vocabulary_questions', 'vocabulary', selectedLevel, t)));
          combinedData = results.flat();
      } else if (category === 'grammar' && typeId === 'random') {
          const types = ['fill_in_the_blank', 'scramble'];
          const results = await Promise.all(types.map(t => fetchFullTable('grammar_questions', 'grammar', selectedLevel, t)));
          combinedData = results.flat();
      } else {
          const tableName = category === 'vocabulary' ? 'vocabulary_questions' : 
                            category === 'grammar' ? 'grammar_questions' : 
                            category === 'comprehension' ? 'comprehension_questions' : 'kanji_data';
                            
          combinedData = await fetchFullTable(tableName, category, selectedLevel, dbType);
      }
      
      if (!combinedData || combinedData.length === 0) {
        setAppState('deck_empty');
        setLevel(null);
        if (category === 'vocabulary' || category === 'grammar') setVocabType(null);
        setIsLoading(false);
        return;
      }
      
      // As requested, the hard-cap has been removed to allow for massive custom quizzes (e.g., 10k cards).
      // The 6MB payload is currently small enough that modern mobile browsers can handle it in IndexedDB.
      if (selectedLevel !== 'SRS') {
          try {
              await localforage.setItem(cacheKey, combinedData);
          } catch (e) {
              console.warn("Failed to save to cache, likely QuotaExceededError", e);
          }
      }
      
      setDeckData(combinedData);
      setCardAmount(Math.min(20, combinedData.length));
      
      const localSaves = JSON.parse(localStorage.getItem('otakufy_saves') || '{}');
      setSaves(localSaves[saveKey] || [null, null]);
      
      setAppState('setup');
    } catch (err) {
      console.error("Failed to load deck:", err);
      setAppState('db_error');
      setLevel(null);
      if (category === 'vocabulary' || category === 'grammar') setVocabType(null);
    } finally {
      setIsLoading(false);
    }
  };

  function loadLevelData(lvl) { return loadDeck(lvl); }
  function loadVocabData(lvl, type) { return loadDeck(lvl, type); }

  const startNewSession = async () => {
    let amount = parseInt(cardAmount);
    const minRequired = Math.min(10, deckData.length);
    
    if (isNaN(amount) || amount < minRequired) {
      setValidationError(`Minimum card amount should be ${minRequired}.`);
      return;
    }
    
    const shuffled = [...deckData].sort(() => 0.5 - Math.random());
    const fullDeck = shuffled.flatMap(row => {
      const effectiveCategory = category === 'random' ? row._source : category;

      if (effectiveCategory === 'vocabulary' || effectiveCategory === 'grammar') {
        let opts = row.options;
        if (typeof opts === 'string') {
            opts = JSON.parse(opts);
        }
        return {
          id: row.id,
          type: row.question_type,
          target: row.target_word,
          text: row.question_text,
          options: Array.isArray(opts) ? [...opts].sort(() => 0.5 - Math.random()) : [],
          answer: row.correct_answer,
          _source: effectiveCategory,
          example: row.example_ja ? {
              ja: row.example_ja,
              ro: row.example_ro,
              en: row.example_en
          } : null
        };
      }
      if (effectiveCategory === 'comprehension') {
         try {
             let subQ = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
             let subA = typeof row.correct_answer === 'string' ? JSON.parse(row.correct_answer) : row.correct_answer;
             subQ = subQ || {};
             subA = subA || {};
             
             return Object.keys(subQ).map(key => {
                 const opts = subQ[key].options || [];
                 return {
                     id: `${row.id}_${key}`,
                     parent_id: row.id,
                     type: 'comprehension',
                     title: row.target_word,
                     passage: row.question_text,
                     text: subQ[key].text,
                     options: [...opts].sort(() => 0.5 - Math.random()),
                     answer: subA[key],
                     _source: effectiveCategory
                 };
             });
         } catch(e) { 
             console.error("Error parsing comprehension:", e);
             return []; 
         }
      }
      return {
        id: row.id,
        kanji: row.kanji,
        reading: row.readings || [],
        meaning: row.meanings || [],
        example: row.example_ja ? {
            ja: row.example_ja,
            ro: row.example_ro,
            en: row.example_en
        } : null,
        _source: effectiveCategory
      };
    });
    
    // Ensure we don't request more than available and clamp exactly to requested amount
    let finalAmount = amount;
    if (finalAmount > fullDeck.length) finalAmount = fullDeck.length;
    const sessionDeck = fullDeck.slice(0, finalAmount);
    
    setQueue(sessionDeck);
    setInitialQueueLength(sessionDeck.length);
    sessionAttemptsRef.current = new Set();
    srsSessionStats.current = {};
    setCurrentIndex(0);
    setScore(0);
    setFailedItems([]);
    setCorrectCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setStatus('idle');
    setReadingInput('');
    setMeaningInput('');
    setAppState('playing');
    
    // Generate Secure Session Token for Anti-Cheat
    try {
        const { data: sid } = await PracticeRepository.startQuizSession(finalAmount);
        if (sid) setQuizSessionId(sid);
    } catch (e) {
        console.error("Failed to generate secure session token", e);
    }
  };

  const getSaveKey = () => (category === 'vocabulary' || category === 'grammar') ? `${category}_${level}_${vocabType}` : `${category}_${level}`;

  const loadSave = (slotIndex) => {
    const save = saves[slotIndex];
    if (!save) return;
    setQueue(save.queue);
    setCurrentIndex(save.currentIndex);
    setScore(save.score);
    setInitialQueueLength(save.initialQueueLength || save.queue.length);
    setFailedItems([]);
    setStatus('idle');
    setReadingInput('');
    setMeaningInput('');
    setAppState('playing');
  };

  const deleteSave = (slotIndex) => {
    setConfirmModal({
        isOpen: true,
        message: `Are you sure you want to delete Slot ${slotIndex + 1}?`,
        onConfirm: () => {
            const localSaves = JSON.parse(localStorage.getItem('otakufy_saves') || '{}');
            const saveKey = getSaveKey();
            if (localSaves[saveKey]) {
                localSaves[saveKey][slotIndex] = null;
                localStorage.setItem('otakufy_saves', JSON.stringify(localSaves));
                setSaves(localSaves[saveKey]);
            }
            setConfirmModal({ isOpen: false, message: '', onConfirm: null });
        }
    });
  };

  const saveAndQuit = (slotIndex) => {
    const executeSave = () => {
        const localSaves = JSON.parse(localStorage.getItem('otakufy_saves') || '{}');
        const saveKey = getSaveKey();
        if (!localSaves[saveKey]) localSaves[saveKey] = [null, null];
        
        localSaves[saveKey][slotIndex] = {
            date: new Date().toISOString(),
            name: saveName.trim() !== '' ? saveName.trim() : null,
            queue,
            currentIndex,
            score,
            initialQueueLength
        };
        localStorage.setItem('otakufy_saves', JSON.stringify(localSaves));
        
        setShowSaveModal(false);
        setSaveName('');
        
        if (category === 'vocabulary' || category === 'grammar') {
            setAppState('select_vocab_type');
        } else {
            setAppState('select_level');
            setLevel(null);
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
    };

    const existingSave = saves[slotIndex];
    if (existingSave) {
        setConfirmModal({
            isOpen: true,
            message: `Slot ${slotIndex + 1} is already full. Overwrite?`,
            onConfirm: executeSave
        });
    } else {
        executeSave();
    }
  };

  const submitReview = (isCorrect) => {
    if (queue.length === 0 || currentIndex >= queue.length) return;
    const currentItem = queue[currentIndex];
    const itemId = currentItem.parent_id || currentItem.id;
    if (sessionAttemptsRef.current.has(itemId)) return;
    
    sessionAttemptsRef.current.add(itemId);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        PracticeRepository.submitReview({
          p_category: currentItem._source || category,
          p_item_id: itemId,
          p_is_correct: isCorrect
        }).then(({ error }) => {
            if (error) {
                console.error('SRS Update Error Details:', JSON.stringify(error));
                console.error('Payload was:', { category: currentItem._source || category, itemId, isCorrect });
            }
        });
      }
    });
  };

  const processSRSSync = (isCorrect, currentItem) => {
      if (level !== 'SRS') {
          submitReview(isCorrect);
          return isCorrect; 
      }
      const itemId = currentItem.parent_id || currentItem.id;
      const stats = srsSessionStats.current[itemId] || { attempts: 0, correct: 0, points: 0 };
      stats.attempts++;
      if (isCorrect) {
          stats.correct++;
          stats.points++;
      } else {
          stats.points = Math.max(0, stats.points - 1);
      }
      srsSessionStats.current[itemId] = stats;

      const passedThreshold = (stats.attempts === 1 && isCorrect) || stats.points >= 4;

      if (passedThreshold) {
          supabase.auth.getUser().then(({ data: { user } }) => {
              if (user) {
                  supabase.from('srs_reviews').update({ 
                      is_completed: true, 
                      attempts_count: stats.attempts, 
                      correct_attempts: stats.correct,
                      points_at_completion: stats.points
                  }).eq('item_id', itemId).eq('user_id', user.id).then();
              }
          });
      }
      return passedThreshold;
  };

  const calculateCardXP = (card, isPartial = false) => {
    const jlpt = card.jlpt_level || level || 'N5';
    let baseXP = 10;
    if (jlpt === 'N4') baseXP = 11;
    else if (jlpt === 'N3') baseXP = 13;
    else if (jlpt === 'N2') baseXP = 16;
    else if (jlpt === 'N1') baseXP = 20;
    
    return isPartial ? Math.floor(baseXP / 2) : baseXP;
  };

  const handleVocabAnswer = (selectedOption) => {
    if (status !== 'idle') return;
    
    setReadingInput(selectedOption); // Store selected temporarily for UI logic
    
    const currentCard = queue[currentIndex];
    
    if (selectedOption === currentCard.answer) {
      const passed = processSRSSync(true, currentCard);
      setStatus('correct');
      setScore(prev => prev + calculateCardXP(currentCard));
      setCorrectCount(prev => prev + 1);
      setCurrentStreak(prev => {
        const next = prev + 1;
        setMaxStreak(m => Math.max(m, next));
        return next;
      });
      if (!passed) {
          setQueue(prev => [...prev, currentCard]);
      }
    } else {
      processSRSSync(false, currentCard);
      setStatus('incorrect');
      setCurrentStreak(0);
      setFailedItems(prev => {
        if (!prev.find(item => item.id === currentCard.id)) {
          return [...prev, currentCard];
        }
        return prev;
      });
      setQueue(prev => [...prev, currentCard]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status !== 'idle') return;
    
    setValidationError('');
    
    const isReadingFilled = readingInput.trim().length > 0;
    const isMeaningFilled = meaningInput.trim().length > 0;

    if (!isReadingFilled && !isMeaningFilled) {
      const now = new Date().getTime();
      if (now - emptySubmitRef.current < 500) {
        return; // Prevent accidental rapid double-enter from skipping
      }
      if (now - emptySubmitRef.current < 2000) {
        handleSkip();
        return;
      }
      emptySubmitRef.current = now;
      setValidationError("Press Enter again to skip.");
      return;
    }

    const currentCard = queue[currentIndex];
    const isReadingCorrect = isReadingFilled ? validateField(readingInput, currentCard.reading, true) : false;
    const isMeaningCorrect = isMeaningFilled ? validateField(meaningInput, currentCard.meaning, false) : false;
    
    if (isReadingCorrect && isMeaningCorrect) {
      const passed = processSRSSync(true, currentCard);
      setStatus('correct');
      setScore(s => s + calculateCardXP(currentCard));
      setCorrectCount(prev => prev + 1);
      setCurrentStreak(prev => {
        const next = prev + 1;
        setMaxStreak(m => Math.max(m, next));
        return next;
      });
      if (!passed) {
          setQueue(prev => [...prev, currentCard]);
      }
    } else if (isReadingCorrect || isMeaningCorrect) {
      processSRSSync(false, currentCard);
      setStatus('partial');
      setScore(s => s + calculateCardXP(currentCard, true));
      setCurrentStreak(0);
      setFailedItems(prev => {
        if (!prev.find(item => item.id === currentCard.id)) {
          return [...prev, currentCard];
        }
        return prev;
      });
      setQueue(prev => [...prev, currentCard]);
    } else {
      processSRSSync(false, currentCard);
      setStatus('incorrect');
      setCurrentStreak(0);
      setFailedItems(prev => {
        if (!prev.find(item => item.id === currentCard.id)) {
          return [...prev, currentCard];
        }
        return prev;
      });
      setQueue(prev => [...prev, currentCard]);
    }
  };

  const handleSkip = () => {
    if (status !== 'idle') return;
    processSRSSync(false, queue[currentIndex]);
    setValidationError('');
    setStatus('incorrect');
    setCurrentStreak(0);
    setFailedItems(prev => {
      if (!prev.find(item => item.id === queue[currentIndex].id)) {
        return [...prev, queue[currentIndex]];
      }
      return prev;
    });
    setQueue(prev => [...prev, queue[currentIndex]]);
  };

  const isTransitioning = useRef(false);
  
  const handleNext = async () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setTimeout(() => { isTransitioning.current = false; }, 300);

    if (currentIndex + 1 >= queue.length) {
      setAppState('finished');
      setIsSavingXP(true);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user && score > 0 && quizSessionId) {
          const { data: xpData, error: xpError } = await PracticeRepository.awardQuizXp(score, quizSessionId);
          
          if (xpError) throw xpError;
          
          if (xpData && xpData.length > 0) {
            const { new_level, new_streak } = xpData[0];
            
            try {
                const today = new Date().toISOString().split('T')[0];
                const myUserId = session.user.id;
                let localDailyAll = JSON.parse(localStorage.getItem('otakufy_daily_xp') || '{}');
                
                let myDaily = localDailyAll[myUserId];
                
                // Migrate from old format if it wasn't keyed by user id
                if (!myDaily && localDailyAll.date) {
                    myDaily = { date: localDailyAll.date, xp: localDailyAll.xp };
                    delete localDailyAll.date;
                    delete localDailyAll.xp;
                } else if (!myDaily) {
                    myDaily = { date: "", xp: 0 };
                }

                if (myDaily.date !== today) {
                    myDaily.date = today;
                    myDaily.xp = score;
                } else {
                    myDaily.xp += score;
                }

                localDailyAll[myUserId] = myDaily;
                localStorage.setItem('otakufy_daily_xp', JSON.stringify(localDailyAll));
            } catch(e) { console.error("Error saving daily xp locally", e); }
            
            // You could optionally do something with new_streak here if you wanted a UI pop
            const currentLevelData = await ProfileRepository.getById(session.user.id, 'level');
            const currentLevel = currentLevelData?.data?.level || 1;
            
            if (new_level > currentLevel) {
              setTimeout(() => setLeveledUpTo(new_level), 500);
            }
            
            // Check for Badges
            try {
                const { data: newBadges, error: badgeError } = await PracticeRepository.checkAndAwardBadges();
                if (badgeError) console.warn("Badge Check Warning (Backend might not be fully implemented yet):", badgeError);
                if (newBadges && newBadges.length > 0) {
                    setTimeout(() => setUnlockedBadges(newBadges), 1000);
                }
            } catch (e) {
                console.warn("Failed to check badges", e);
            }
          }
            
          // Update Daily Quests
          try {
              const today = getTodayDateString();
              const { data: activeQuests } = await QuestRepository.getActiveQuestsForProgress(session.user.id, today);

              if (activeQuests) {
                for (const quest of activeQuests) {
                    let increment = 0;
                    const type = quest.daily_quests_pool.quest_type;
                    
                    if (type === 'session_count') increment = 1;
                    if (type === 'total_count') increment = correctCount;
                    if (type === 'kanji_count' && category === 'kanji') increment = correctCount;
                    if (type === 'vocab_count' && category === 'vocabulary') increment = correctCount;
                    if (type === 'grammar_count' && category === 'grammar') increment = correctCount;
                    if (type === 'perfect_session' && correctCount === queue.length) increment = 1;
                    
                    if (type === 'streak_count') {
                        if (maxStreak > quest.current_progress) {
                            await QuestRepository.updateProgress(quest.id, maxStreak);
                        }
                    } else if (increment > 0) {
                        await QuestRepository.updateProgress(quest.id, quest.current_progress + increment);
                    }
                }
              }
          } catch (questErr) {
              console.error("Failed to update quests:", questErr);
          }
            
          setXpSaved(true);
        } else {
          setXpSaved(true);
        }
      } catch (error) {
        console.error("Quiz Engine Terminal Log [Save XP]:", error);
        setXpSaved(false);
        setValidationError("Progress cached locally for offline sync.");
      } finally {
        setIsSavingXP(false);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
      setReadingInput('');
      setMeaningInput('');
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (appState === 'playing' && status === 'idle' && !showSaveModal) {
      setTimeout(() => {
        const el = document.getElementById('reading-input');
        if (el) el.focus();
      }, 50);
    }
  }, [status, currentIndex, appState, showSaveModal]);



  const isHashChangeRef = useRef(false);
  const isMountedRef = useRef(false);
  const historyIdxRef = useRef(typeof window !== 'undefined' && window.history.state?.idx ? window.history.state.idx : 0);

  useEffect(() => {
     if (!isMountedRef.current) {
         isMountedRef.current = true;
         if (!window.location.hash) {
             window.history.replaceState({ isOtakufy: true, idx: historyIdxRef.current }, "", `#state=${appState}&level=${level || ''}&vocabType=${vocabType || ''}`);
         }
         return;
     }

     if (isHashChangeRef.current) {
         isHashChangeRef.current = false;
         return;
     }
     
     const newHash = `#state=${appState}&level=${level || ''}&vocabType=${vocabType || ''}`;
     
     if (window.location.hash !== newHash) {
         historyIdxRef.current += 1;
         const stateObj = { isOtakufy: true, idx: historyIdxRef.current };
         window.history.pushState(stateObj, "", newHash);
     }
  }, [appState, level, vocabType]);

  const calculateBackTarget = () => {
      let targetState = 'select_level';
      let targetLevel = level;
      let targetVocabType = vocabType;
      
      if (appState === 'finished') {
          targetState = 'select_level';
          targetLevel = null;
          targetVocabType = null;
      } else if (appState === 'playing') {
          targetState = 'setup';
      } else if (appState === 'setup') {
          if (category === 'vocabulary' || category === 'grammar') {
              targetState = 'select_vocab_type';
              targetVocabType = null;
          } else {
              targetState = 'select_level';
              targetLevel = null;
          }
      } else if (appState === 'select_vocab_type') {
          targetState = 'select_level';
          targetLevel = null;
          targetVocabType = null;
      } else if (appState === 'select_level') {
          return null; // Signals root
      }
      return { state: targetState, level: targetLevel, vocabType: targetVocabType };
  };

  const navigateBack = () => {
      const target = calculateBackTarget();
      
      if (!target) {
          router.push('/');
          return;
      }
      
      if (appState === 'finished') setDeckData([]);
      
      isHashChangeRef.current = true;
      setAppState(target.state);
      setLevel(target.level);
      setVocabType(target.vocabType);
      
      historyIdxRef.current += 1;
      const newHash = `#state=${target.state}&level=${target.level || ''}&vocabType=${target.vocabType || ''}`;
      window.history.pushState({ isOtakufy: true, idx: historyIdxRef.current }, "", newHash);
  };

  useEffect(() => {
    const handlePopState = (e) => {
      const newIdx = e.state?.idx || 0;
      const currentIdx = historyIdxRef.current;
      
      if (newIdx < currentIdx) {
          // Backward traversal intercepted: calculate strict hierarchical back step
          navigateBack();
      } else {
          // Forward traversal intercepted (or unknown): nullify it!
          historyIdxRef.current = newIdx;
          const currentHash = `#state=${appState}&level=${level || ''}&vocabType=${vocabType || ''}`;
          window.history.replaceState({ isOtakufy: true, idx: historyIdxRef.current }, "", currentHash);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
        window.removeEventListener('popstate', handlePopState);
    };
  }, [appState, level, vocabType, category]);

  const retryMistakes = () => {
    if (failedItems.length === 0) return;
    setQueue(failedItems);
    setInitialQueueLength(failedItems.length);
    setFailedItems([]);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setAppState('playing');
    sessionAttemptsRef.current = new Set();
  };

  return {
    appState, setAppState,
    level, setLevel,
    vocabType, setVocabType,
    isLoading,
    deckData, cardAmount, setCardAmount, saves,
    queue, initialQueueLength, currentIndex, readingInput, setReadingInput, meaningInput, setMeaningInput,
    status, score, validationError, setValidationError, isSavingXP, xpSaved, leveledUpTo, setLeveledUpTo,
    unlockedBadges, setUnlockedBadges,
    showSaveModal, setShowSaveModal, saveName, setSaveName,
    confirmModal, setConfirmModal, failedItems, retryMistakes,
    srsSessionStats,
    loadLevelData, loadVocabData, startNewSession, loadSave, deleteSave, saveAndQuit, navigateBack,
    handleVocabAnswer, handleSubmit, handleSkip, handleNext
  };
};
