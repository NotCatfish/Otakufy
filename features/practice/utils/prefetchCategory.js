import { supabase } from '../../auth/frontend/supabaseClient';
import localforage from 'localforage';

// Global memory flag to prevent duplicate background fetches in the same window session
const prefetchInProgress = new Set();

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

export const prefetchCategory = async (category) => {
    if (!category) return;
    const prefetchKey = `otakufy_prefetched_v9_${category}`;
    
    if (typeof window === 'undefined') return;
    
    // If it's already cached in localforage, skip
    const isPrefetched = await localforage.getItem(prefetchKey);
    if (isPrefetched) return;
    
    // If it's currently fetching, skip duplicate triggers
    if (prefetchInProgress.has(category)) return;
    
    prefetchInProgress.add(category);

    const tablesToFetch = category === 'random' ? [
        { t: 'kanji_data', s: 'kanji' },
        { t: 'vocabulary_questions', s: 'vocabulary' },
        { t: 'grammar_questions', s: 'grammar' },
        { t: 'comprehension_questions', s: 'comprehension' }
    ] : [
        { 
          t: category === 'kanji' ? 'kanji_data' :
             category === 'vocabulary' ? 'vocabulary_questions' :
             category === 'grammar' ? 'grammar_questions' :
             category === 'comprehension' ? 'comprehension_questions' : null,
          s: category
        }
    ];

    if (!tablesToFetch[0].t) {
        prefetchInProgress.delete(category);
        return;
    }

    Promise.all(tablesToFetch.map(({t, s}) => 
        fetchAll(() => supabase.from(t).select('*')).then(data => 
            data ? data.map(d => ({...d, _source: s})) : []
        )
    )).then(async results => {
        const allData = results.flat();
        if (!allData || allData.length === 0) {
            prefetchInProgress.delete(category);
            return;
        }
        
        await localforage.setItem(prefetchKey, 'true');
        
        if (category === 'kanji') {
            await localforage.setItem(`otakufy_cache_kanji_v9_Global`, allData);
        }
        
        const byLevel = allData.reduce((acc, curr) => {
            const lvl = curr.jlpt_level || 'N5';
            if (!acc[lvl]) acc[lvl] = [];
            acc[lvl].push(curr);
            return acc;
        }, {});

        const promises = [];
        Object.keys(byLevel).forEach(lvl => {
            if (category === 'random') {
                promises.push(localforage.setItem(`otakufy_cache_random_v9_${lvl}`, byLevel[lvl]));
            } else if (category === 'kanji' || category === 'comprehension') {
                promises.push(localforage.setItem(`otakufy_cache_${category}_v9_${lvl}`, byLevel[lvl]));
            } else {
                const byType = byLevel[lvl].reduce((tAcc, curr) => {
                    const t = curr.question_type;
                    if (!tAcc[t]) tAcc[t] = [];
                    tAcc[t].push(curr);
                    return tAcc;
                }, {});
                
                const typeMapping = {
                    'kanji_reading': 'reading',
                    'kanji_writing': 'orthography',
                    'fill_in_the_blank': 'context',
                    'paraphrase': 'paraphrase',
                    'usage': 'usage',
                    'scramble': 'scramble'
                };

                Object.keys(byType).forEach(dbType => {
                    let uiType = typeMapping[dbType] || dbType;
                    promises.push(localforage.setItem(`otakufy_cache_${category}_v9_${lvl}_${uiType}`, byType[dbType]));
                });
                
                promises.push(localforage.setItem(`otakufy_cache_${category}_v9_${lvl}_random`, byLevel[lvl]));
            }
        });
        
        await Promise.all(promises);
        prefetchInProgress.delete(category);
    }).catch(err => {
        console.error("Prefetch error:", err);
        prefetchInProgress.delete(category);
    });
};
