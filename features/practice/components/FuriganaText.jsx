import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

const furiganaCache = new Map();

export const FuriganaText = ({ text, showFurigana, fallbackReading }) => {
    const [html, setHtml] = useState(text);
    useEffect(() => {
        if (showFurigana && typeof text === 'string' && text) {
            if (furiganaCache.has(text) && furiganaCache.get(text) !== '__loading__') {
                setHtml(furiganaCache.get(text));
                return;
            }
            
            // Show base text while loading
            setHtml(text);
            
            // If already loading via batch, just wait for the event
            if (furiganaCache.get(text) === '__loading__') return;
            
            fetch('/api/furigana', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ text })
            })
            .then(res => {
                if (!res.ok) {
                    setHtml(text);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.result) {
                    let finalHtml = data.result;
                    // If the API couldn't determine furigana (returned identical text) and we have a fallback
                    if (finalHtml === text && fallbackReading) {
                        finalHtml = `<ruby>${text}<rt>${fallbackReading}</rt></ruby>`;
                    }
                    furiganaCache.set(text, finalHtml);
                    setHtml(finalHtml);
                }
            })
            .catch((e) => {
                console.error(e);
                setHtml(text); // Fallback on error
            });
        } else {
            setHtml(text);
        }
    }, [text, showFurigana, fallbackReading]);

    useEffect(() => {
        const handleUpdate = () => {
            if (showFurigana && furiganaCache.has(text) && furiganaCache.get(text) !== '__loading__') {
                setHtml(furiganaCache.get(text));
            }
        };
        window.addEventListener('furigana-updated', handleUpdate);
        return () => window.removeEventListener('furigana-updated', handleUpdate);
    }, [text, showFurigana]);

    if (!showFurigana) return <>{text}</>;
    
    const safeHtml = typeof window !== 'undefined' 
        ? DOMPurify.sanitize(html, { ADD_TAGS: ['ruby', 'rt', 'rp'] }) 
        : text;
    
    return <span dangerouslySetInnerHTML={{ __html: safeHtml }} />;
};

export const updateFuriganaBatch = (texts) => {
    const missingTexts = texts.filter(t => typeof t === 'string' && t.trim() && !furiganaCache.has(t));
    if (missingTexts.length === 0) return;
    
    // chunk into chunks of 9000 characters
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;
    missingTexts.forEach(t => {
        if (currentLength + t.length > 9000 && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentLength = 0;
        }
        currentChunk.push(t);
        currentLength += t.length;
    });
    if (currentChunk.length > 0) chunks.push(currentChunk);
    
    // Mark as loading to prevent duplicate triggers
    missingTexts.forEach(t => furiganaCache.set(t, '__loading__'));
    
    chunks.forEach(chunk => {
        fetch('/api/furigana', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ texts: chunk })
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.results) {
                chunk.forEach((t, i) => {
                    if (data.results[i]) furiganaCache.set(t, data.results[i]);
                });
                window.dispatchEvent(new CustomEvent('furigana-updated'));
            }
        })
        .catch(e => console.error("Batch furigana failed", e));
    });
};
