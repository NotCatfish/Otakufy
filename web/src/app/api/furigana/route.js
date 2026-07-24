import { NextResponse } from 'next/server';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import path from 'path';
import { BaseApiRoute } from '@/lib/BaseApiRoute';

let kuroshiro = null;
let initPromise = null;

const initKuroshiro = async () => {
    if (kuroshiro) return kuroshiro;
    if (initPromise) return initPromise;
    
    initPromise = (async () => {
        try {
            const KuroshiroClass = Kuroshiro.default || Kuroshiro;
            const k = new KuroshiroClass();
            const dictPath = path.join(process.cwd(), 'public', 'dict');
            const AnalyzerClass = KuromojiAnalyzer.default || KuromojiAnalyzer;
            await k.init(new AnalyzerClass({ dictPath }));
            kuroshiro = k;
            return k;
        } catch (error) {
            initPromise = null;
            throw error;
        }
    })();
    
    return initPromise;
};

class FuriganaRoute extends BaseApiRoute {
    constructor() {
        super({
            actionName: 'furigana',
            rateLimitMax: 30,
            requireAuth: false,
            requireAdmin: false,
            verifyCsrf: true
        });
    }

    async execute(req, ctx) {
        const { anonClient: supabase } = ctx;
        const { text, texts } = await req.json();
        
        if (!text && (!texts || !Array.isArray(texts))) {
            return NextResponse.json({ result: '' });
        }
        
        if (texts) {
            // Batch processing
            const totalLength = texts.reduce((acc, val) => acc + (val ? val.length : 0), 0);
            if (totalLength > 10000) {
                return NextResponse.json({ error: 'Batch text too long (max 10000 characters).' }, { status: 400 });
            }
            
            const validTexts = texts.filter(t => t && typeof t === 'string');
            let cachedMap = {};
            
            if (validTexts.length > 0) {
                try {
                    const { data, error } = await supabase
                        .from('furigana_cache')
                        .select('text, html')
                        .in('text', validTexts);
                        
                    if (!error && data) {
                        data.forEach(row => {
                            cachedMap[row.text] = row.html;
                        });
                    }
                } catch (dbErr) {
                    console.error("DB Cache fetch error:", dbErr);
                }
            }
            
            const k = await initKuroshiro();
            const newEntries = [];
            
            const results = await Promise.all(texts.map(async (t) => {
                if (!t || typeof t !== 'string') return '';
                if (cachedMap[t]) return cachedMap[t];
                
                try {
                    const result = await k.convert(t, { mode: 'furigana', to: 'hiragana' });
                    newEntries.push({ text: t, html: result });
                    return result;
                } catch (e) {
                    console.error('Kuroshiro convert error on batch item:', e);
                    return t;
                }
            }));
            
            if (newEntries.length > 0) {
                supabase.from('furigana_cache').upsert(newEntries, { onConflict: 'text' })
                    .then(({ error }) => { if (error) console.error("DB Cache save error:", error); });
            }
            
            return NextResponse.json({ results });
        } else {
            // Single processing
            if (text.length > 2000) {
                return NextResponse.json({ error: 'Text too long (max 2000 characters).' }, { status: 400 });
            }
            
            try {
                const { data, error } = await supabase
                    .from('furigana_cache')
                    .select('html')
                    .eq('text', text)
                    .single();
                
                if (!error && data && data.html) {
                    return NextResponse.json({ result: data.html });
                }
            } catch (dbErr) {
                console.error("DB Cache fetch error:", dbErr);
            }
            
            const k = await initKuroshiro();
            const result = await k.convert(text, { mode: 'furigana', to: 'hiragana' });
            
            supabase.from('furigana_cache').upsert([{ text, html: result }], { onConflict: 'text' })
                .then(({ error }) => { if (error) console.error("DB Cache save error:", error); });
                
            return NextResponse.json({ result });
        }
    }
}

const route = new FuriganaRoute();
export const POST = (req) => route.handle(req);
