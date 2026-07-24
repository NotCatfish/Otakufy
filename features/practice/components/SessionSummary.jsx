import React, { useState } from 'react';
import { supabase } from '../../auth/frontend/supabaseClient';
import PracticeRepository from '../repositories/PracticeRepository';
import Toast from '../../../web/src/components/ui/Toast';
import { useLanguage } from '../../../web/src/context/LanguageContext';

export default function SessionSummary({ currentTheme, engineState }) {
  const { t } = useLanguage();
  const { setAppState, queue, score, isSavingXP, xpSaved, leveledUpTo, setLeveledUpTo, unlockedBadges, setUnlockedBadges, failedItems, retryMistakes, initialQueueLength } = engineState;

  const [addedToSRS, setAddedToSRS] = useState(new Set());
  const [selectedForSRS, setSelectedForSRS] = useState(new Set());
  const [toast, setToast] = useState(null);
  
  const handleToggleSelect = (item) => {
      const itemId = item.parent_id || item.id;
      if (addedToSRS.has(itemId)) return;
      
      setSelectedForSRS(prev => {
          const newSet = new Set(prev);
          if (newSet.has(itemId)) {
              newSet.delete(itemId);
          } else {
              newSet.add(itemId);
          }
          return newSet;
      });
  };

  const handleSelectAll = () => {
      const availableItems = failedItems.filter(item => !addedToSRS.has(item.parent_id || item.id));
      if (selectedForSRS.size === availableItems.length) {
          // Deselect all
          setSelectedForSRS(new Set());
      } else {
          // Select all
          const newSet = new Set();
          availableItems.forEach(item => newSet.add(item.parent_id || item.id));
          setSelectedForSRS(newSet);
      }
  };

  const handleAddSelectedToSRS = async () => {
      const itemsToAdd = failedItems.filter(item => selectedForSRS.has(item.parent_id || item.id) && !addedToSRS.has(item.parent_id || item.id));
      if (itemsToAdd.length === 0) return;
      
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              setToast({ message: "You must be signed in to save cards to your SRS review deck!", type: "info" });
              return;
          }
          
          const payloads = itemsToAdd.map(item => ({
              user_id: user.id,
              item_id: item.parent_id || item.id,
              category: item._source || 'kanji',
              level: 'N5-N1',
              attempts_count: 0,
              correct_attempts: 0,
              is_completed: false
          }));
          
          const { error } = await PracticeRepository.addBatchSrsReviews(payloads);
          
          if (error && error.code !== '23505') { 
              console.error('Error adding all to SRS:', error);
              setToast({ message: "Failed to save cards to SRS deck.", type: "error" });
          } else {
              setAddedToSRS(prev => {
                  const newSet = new Set(prev);
                  itemsToAdd.forEach(item => newSet.add(item.parent_id || item.id));
                  return newSet;
              });
              setSelectedForSRS(new Set());
              setToast({ message: `Saved ${itemsToAdd.length} cards to your SRS review queue!`, type: "success" });
          }
      } catch(e) {
          console.error('Error adding all to SRS:', e);
          setToast({ message: "Unexpected error while saving to SRS.", type: "error" });
      }
  };

  const totalQuestions = queue.length; // Active queue size (including retries)
  
  // Calculate accuracy based on original queue
  const accuracy = initialQueueLength > 0 ? Math.round(((initialQueueLength - failedItems.length) / initialQueueLength) * 100) : 0;
  const maxPossibleScore = initialQueueLength * 10;

  return (
    <div className="max-w-3xl mx-auto py-24 animate-fade-in text-center relative z-10 font-medium text-sakura-dark dark:text-white">
      
      <div className="mb-12 border-b border-sakura/20 dark:border-white/10 pb-8">
        <h2 className="text-[12px] tracking-widest uppercase text-sakura-dark/60 dark:text-white/60 mb-2 font-semibold">
          {t("Mission Complete")}
        </h2>
        <h1 className="text-4xl font-semibold tracking-tight text-sakura-dark dark:text-white">
          {t("Session Summary")}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        {[
          { label: 'XP Earned', value: score, style: 'text-sakura-dark dark:text-white' },
          { label: 'Accuracy', value: `${accuracy}%`, desc: `${initialQueueLength - failedItems.length} ${t("correct")}`, style: accuracy >= 80 ? 'text-green-600 dark:text-green-400' : accuracy >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400' },
          { label: 'Mistakes', value: failedItems.length, desc: 'Items to review', style: 'text-sakura-dark dark:text-white' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-sakura/5 dark:bg-black/20 border border-sakura/20 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center">
            <span className="mb-label mb-2 text-sakura-dark/60 dark:text-white/60">{t(stat.label)}</span>
            <div className={`text-4xl mb-mono mb-2 font-semibold ${stat.style}`}>
              {stat.value}
            </div>
            {stat.desc && <span className="text-[12px] text-sakura-dark/60 dark:text-white/60">{t(stat.desc)}</span>}
          </div>
        ))}
      </div>

      <div className="text-sakura-dark/60 dark:text-white/60 text-[12px] tracking-widest uppercase mb-12 h-6 flex items-center justify-center font-medium">
        {isSavingXP ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-sakura/40 dark:border-white/40 border-t-sakura dark:border-t-white rounded-full animate-spin"></div>
            {t("Syncing Profile...")}
          </span>
        ) : xpSaved ? (
          <span className="text-sakura-dark dark:text-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {t("Progress Saved")}
          </span>
        ) : (
          <span>{t("Session Finished")}</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <button 
          onClick={() => engineState.navigateBack()}
          disabled={isSavingXP}
          className={`px-8 py-3 rounded text-[13px] font-bold transition-all duration-300 disabled:opacity-50 w-full sm:w-auto bg-sakura dark:bg-white text-white dark:text-black hover:opacity-80`}
        >
          {t("Return to Dashboard")}
        </button>
      </div>

      {/* Post-Session Review Mode */}
      {failedItems.length > 0 && (
        <div className="text-left w-full mx-auto bg-sakura/5 dark:bg-black/20 border border-sakura/20 dark:border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-6 border-b border-sakura/20 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-sakura-dark/60 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <h3 className="text-lg font-semibold text-sakura-dark dark:text-white">{t("Review Mistakes")}</h3>
            </div>
            {failedItems.filter(item => !addedToSRS.has(item.parent_id || item.id)).length > 0 && (
              <button 
                onClick={handleSelectAll}
                className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded border transition-all duration-300 bg-sakura/10 dark:bg-white/10 text-sakura dark:text-white border-sakura/40 dark:border-white/20 hover:border-sakura dark:hover:border-white/50"
              >
                {selectedForSRS.size === failedItems.filter(item => !addedToSRS.has(item.parent_id || item.id)).length ? t("Deselect All") : t("Select All")}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {failedItems.map((item, i) => {
              const itemId = item.parent_id || item.id;
              const isAdded = addedToSRS.has(itemId);
              const isSelected = selectedForSRS.has(itemId);
              return (
              <div 
                 key={i} 
                 onClick={() => handleToggleSelect(item)}
                 className={`flex p-5 rounded-xl border transition-colors cursor-pointer ${isAdded ? 'bg-sakura/5 dark:bg-white/5 border-sakura/20 dark:border-white/10 opacity-70' : isSelected ? 'bg-sakura/10 dark:bg-white/10 border-sakura dark:border-white' : 'bg-white dark:bg-black/40 border-sakura/20 dark:border-white/10 hover:border-sakura/40 dark:hover:border-white/30'}`}
              >
                <div className="mr-4 mt-1">
                   <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAdded ? 'border-sakura-dark/20 dark:border-white/20 bg-transparent' : isSelected ? 'border-sakura dark:border-white bg-sakura dark:bg-white text-white dark:text-black' : 'border-sakura-dark/40 dark:border-white/40 bg-transparent'}`}>
                      {(isSelected || isAdded) && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                   </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-sakura-dark/80 dark:text-white/80 px-2 py-1 bg-sakura/10 dark:bg-white/10 rounded">
                                {item.type ? item.type.replace(/_/g, ' ') : (item._source || 'Kanji')}
                            </span>
                            {item.target && <span className="text-[10px] text-sakura-dark/60 dark:text-white/60 bg-sakura/5 dark:bg-black/20 border border-sakura/20 dark:border-white/10 px-2 py-1 rounded">{item.target}</span>}
                        </div>
                        {isAdded && (
                           <span className="text-[10px] uppercase tracking-widest font-bold text-sakura-dark/60 dark:text-white/60 flex items-center gap-1">
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                               {t("Added")}
                           </span>
                        )}
                    </div>
                    
                    <div className="text-[15px] font-medium mb-4 text-sakura-dark dark:text-white leading-relaxed">
                  {item.kanji ? item.kanji : item.passage ? (
                     <div className="text-[13px] font-normal text-sakura-dark/80 dark:text-white/80 mb-3 border-l-2 border-sakura/30 dark:border-white/20 pl-4">{item.passage}<br/><br/><span className="text-[15px] text-sakura-dark dark:text-white font-medium">{item.text}</span></div>
                  ) : item.text}
                </div>
                
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 bg-sakura/5 dark:bg-black/60 border border-sakura/20 dark:border-white/10 p-3 rounded w-full">
                        <span className="text-[11px] uppercase tracking-widest font-bold text-sakura-dark/60 dark:text-white/60">{t("Correct Answer:")}</span>
                        <span className="text-sakura-dark dark:text-white font-medium text-[14px]">
                            {item.kanji ? (
                                <span>{item.reading?.join(', ')} <span className="text-sakura/40 dark:text-white/40 mx-2">|</span> {item.meaning?.join(', ')}</span>
                            ) : item.answer}
                        </span>
                    </div>
                </div>
                </div>
              </div>
              );
            })}
          </div>
          
          {selectedForSRS.size > 0 && (
             <div className="mt-6 pt-6 border-t border-sakura/20 dark:border-white/10 flex justify-end">
                <button 
                  onClick={handleAddSelectedToSRS}
                  className="px-6 py-3 rounded text-[13px] font-bold transition-all duration-300 bg-sakura dark:bg-white text-white dark:text-black hover:opacity-80 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  {t("Add")} {selectedForSRS.size} {t("to SRS")}
                </button>
             </div>
          )}
        </div>
      )}

      {/* Level Up Modal */}
      {leveledUpTo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#000000]/90 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center justify-center p-16 animate-slide-up transform transition-all relative">
            <span className="text-[#7a7a7a] tracking-widest font-medium uppercase text-[12px] mb-4">{t("Milestone Unlocked")}</span>
            <h2 className="text-4xl font-semibold mb-12 text-[#e5e5e5]">{t("Level Up!")}</h2>
            
            <div className="w-32 h-32 mb-12 rounded-full border border-[#5a5a5a] flex items-center justify-center bg-[#111111] relative">
              <span className="text-5xl font-semibold mb-mono text-[#e5e5e5]">{leveledUpTo}</span>
            </div>

            <button 
              onClick={() => setLeveledUpTo(null)}
              className="px-8 py-3 bg-[#e5e5e5] text-black font-medium rounded text-[13px] hover:bg-white transition-all duration-300 relative z-10"
            >
              {t("Continue Journey")}
            </button>
          </div>
        </div>
      )}
      {/* Badge Unlocked Modal */}
      {unlockedBadges && unlockedBadges.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#000000]/90 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center justify-center p-8 md:p-16 animate-slide-up transform transition-all relative">
            <span className="text-[#7a7a7a] tracking-widest font-medium uppercase text-[12px] mb-4">{t("Achievement Unlocked")}</span>
            <h2 className="text-3xl font-semibold mb-12 text-[#e5e5e5] text-center">New Badge{unlockedBadges.length > 1 ? 's' : ''}!</h2>
            
            <div className="flex gap-4 mb-12 flex-wrap justify-center">
              {unlockedBadges.map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 bg-[#111111] border border-[#3a3a3a] p-6 rounded-xl">
                    <div className="w-16 h-16 rounded-full border border-[#5a5a5a] flex items-center justify-center bg-[#1a1a1a] text-3xl">
                      {badge.badge_icon}
                    </div>
                    <span className="text-[14px] font-medium text-[#e5e5e5]">{badge.badge_name}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setUnlockedBadges([])}
              className="px-8 py-3 bg-[#e5e5e5] text-black font-medium rounded text-[13px] hover:bg-white transition-all duration-300 relative z-10"
            >
              {t("Awesome")}
            </button>
          </div>
        </div>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
