import React from 'react';
import DefaultAvatar from '../../profile/frontend/DefaultAvatar';
import { getRelativeTime } from '../../profile/utils/timeUtils';
import { useLanguage } from '../../../web/src/context/LanguageContext';

const STATUS_COLORS = {
  new: 'bg-[var(--surface-hover)] text-white border-[var(--strong-border)]',
  under_review: 'bg-[var(--surface-hover)] text-white border-[var(--divider)]',
  planned: 'bg-[var(--surface)] text-white border-[var(--divider)]',
  shipped: 'bg-white text-black border-white',
  rejected: 'bg-transparent text-[var(--muted-text)] border-[var(--strong-border)] line-through'
};

export default function SuggestionCard({ suggestion, userVote, onVote, isAdmin, onUpdateStatus }) {
  const { t } = useLanguage();
  const { id, title, description, status, upvotes, downvotes, author_username, author_avatar_url, created_at } = suggestion;
  
  const score = upvotes - downvotes;

  const STATUS_LABELS = {
    new: t('New'),
    under_review: t('Under Review'),
    planned: t('Planned'),
    shipped: t('Shipped'),
    rejected: t('Rejected')
  };

  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--strong-border)] hover:border-[var(--divider)] transition-colors animate-fade-in">
      
      {/* Voting Column */}
      <div className="flex flex-col items-center gap-2">
        <button 
            onClick={() => onVote(id, userVote === 1 ? 0 : 1)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${userVote === 1 ? 'bg-white text-black' : 'bg-[var(--surface-hover)] text-[var(--muted-text)] hover:bg-[var(--card-border)] hover:text-white'} border border-transparent`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <span className={`font-mono font-medium text-[13px] ${score > 0 ? 'text-white' : score < 0 ? 'text-[var(--muted-text)]' : 'text-white/40'}`}>
            {score > 0 ? '+' : ''}{score}
        </span>
        <button 
            onClick={() => onVote(id, userVote === -1 ? 0 : -1)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${userVote === -1 ? 'bg-[var(--card-border)] text-white' : 'bg-[var(--surface-hover)] text-[var(--muted-text)] hover:bg-[var(--card-border)] hover:text-white'} border border-transparent`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content Column */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex flex-wrap justify-between items-start gap-4">
            <h3 className="text-lg font-medium text-white tracking-tight">{title}</h3>
            <span className={`px-2.5 py-1 rounded text-[11px] font-medium uppercase tracking-wider border ${STATUS_COLORS[status] || STATUS_COLORS.new}`}>
                {STATUS_LABELS[status] || t('New')}
            </span>
        </div>
        
        <p className="text-[var(--muted-text)] text-[13px] leading-relaxed whitespace-pre-wrap">{description}</p>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-[var(--strong-border)]">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <DefaultAvatar src={author_avatar_url} name={author_username} seed={author_username} size={20} />
                    <span className={`text-[12px] font-medium ${author_username === 'Anonymous' ? 'text-white/40 italic' : 'text-[var(--muted-text)]'}`}>
                        {author_username || t('Anonymous')}
                    </span>
                </div>
                <span className="text-[12px] text-white/30">•</span>
                <span className="text-[12px] text-white/40 mb-mono">{getRelativeTime(created_at)}</span>
            </div>

            {isAdmin && (
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">{t("Admin:")}</span>
                    <select 
                        value={status}
                        onChange={(e) => onUpdateStatus(id, e.target.value)}
                        className="bg-[var(--surface)] border border-[var(--strong-border)] text-white text-[12px] font-medium px-2 py-1 rounded focus:outline-none focus:border-[var(--divider)]"
                    >
                        <option value="new">{t("New")}</option>
                        <option value="under_review">{t("Under Review")}</option>
                        <option value="planned">{t("Planned")}</option>
                        <option value="shipped">{t("Shipped")}</option>
                        <option value="rejected">{t("Rejected")}</option>
                    </select>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
