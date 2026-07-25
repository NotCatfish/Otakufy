import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function SuggestionForm({ onSubmit, existingSuggestions, onClose }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Duplicate Mitigation (Live Filtering)
  const similar = React.useMemo(() => {
    if (title.length > 3) {
      const query = title.toLowerCase();
      return existingSuggestions.filter(s => 
        s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
      ).slice(0, 3);
    }
    return [];
  }, [title, existingSuggestions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (title.length < 5) return setError("Please enter a title of at least 5 characters.");
    if (description.length < 10) return setError("Please enter a description of at least 10 characters.");

    setIsSubmitting(true);
    try {
      await onSubmit({ title, description, isAnonymous });
      onClose(); // Close modal or form on success
    } catch (err) {
      const errorMsg = err?.message || err?.details || JSON.stringify(err);
      setError(`Failed to submit: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--strong-border)] rounded-2xl p-8 w-full max-w-2xl relative shadow-2xl">
      <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <h2 className="text-2xl font-semibold tracking-tight text-white mb-6">
        {t("New Suggestion")}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium uppercase tracking-widest text-[var(--muted-text)] flex justify-between">
                <span>{t("Title")}</span>
                <span className={title.length > 0 && title.length < 5 ? 'text-red-400' : 'text-white/40'}>{title.length}/100</span>
            </label>
            <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Add a Dark Mode toggle for specific sections"
                className={`bg-[var(--input-bg)] border rounded px-4 py-3 text-white text-[13px] focus:outline-none transition-colors ${title.length > 0 && title.length < 5 ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--strong-border)] focus:border-[var(--divider)]'}`}
                maxLength={100}
                required
            />
            {title.length > 0 && title.length < 5 && (
                <span className="text-[12px] text-red-400 font-medium px-1">Title must be at least 5 characters long.</span>
            )}
        </div>

        {/* Similar Suggestions Warning */}
        {similar.length > 0 && (
            <div className="bg-[var(--input-bg)] border border-[var(--strong-border)] rounded p-4 animate-fade-in">
                <p className="text-white text-[13px] font-medium mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--muted-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {t("Similar ideas exist! Consider upvoting them instead:")}
                </p>
                <div className="flex flex-col gap-2">
                    {similar.map(s => (
                        <div key={s.id} className="text-[12px] text-[var(--muted-text)] bg-[var(--surface-hover)] px-3 py-2 rounded border border-[var(--card-border)]">
                            <span className="font-medium text-white">{s.title}</span> — {s.upvotes - s.downvotes} {t("points")}
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium uppercase tracking-widest text-[var(--muted-text)] flex justify-between">
                <span>{t("Details")}</span>
                <span className={description.length > 0 && description.length < 10 ? 'text-red-400' : 'text-white/40'}>{description.length}/2000</span>
            </label>
            <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why this feature would be helpful and how it might work..."
                className={`bg-[var(--input-bg)] border rounded px-4 py-3 text-white text-[13px] focus:outline-none transition-colors h-32 resize-none ${description.length > 0 && description.length < 10 ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--strong-border)] focus:border-[var(--divider)]'}`}
                maxLength={2000}
                required
            />
            {description.length > 0 && description.length < 10 && (
                <span className="text-[12px] text-red-400 font-medium px-1">Description must be at least 10 characters long.</span>
            )}
        </div>

        <div className="flex items-center gap-3 mt-2">
            <button 
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center border ${isAnonymous ? 'bg-[var(--foreground)] border-[var(--foreground)]' : 'bg-[var(--surface-hover)] border-[var(--strong-border)] shadow-inner'}`}
            >
                <div className={`w-4 h-4 rounded-full shadow-sm absolute transition-all ${isAnonymous ? 'bg-[var(--background)] translate-x-6' : 'bg-[var(--foreground)] opacity-60 translate-x-1'}`}></div>
            </button>
            <div className="flex flex-col">
                <span className="text-[13px] font-medium text-white">{t("Submit Anonymously")}</span>
                <span className="text-[12px] text-[var(--muted-text)]">{t("Your username and avatar will be hidden.")}</span>
            </div>
        </div>

        {error && (
            <div className="text-emerald-300 text-[13px] font-medium bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl shadow-sm">
                {error}
            </div>
        )}

        <button 
            type="submit" 
            disabled={isSubmitting || title.length < 5 || description.length < 10}
            className="mt-4 bg-white text-black font-medium text-[13px] py-3 rounded hover:bg-white transition-all disabled:opacity-50 disabled:hover:bg-white flex justify-center items-center h-12"
        >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : t("Submit Suggestion")}
        </button>
      </form>
    </div>
  );
}
