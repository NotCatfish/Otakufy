import React from 'react';

export default function SaveProgressModal({ 
  showSaveModal, 
  setShowSaveModal, 
  saveName, 
  setSaveName, 
  saves, 
  saveAndQuit, 
  tLocal 
}) {
  if (!showSaveModal) return null;

  return (
    <div data-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center w-full max-w-sm">
        <h3 className="text-2xl font-light mb-2 text-white">{tLocal("Save Progress")}</h3>
        <p className="text-white/40 text-sm mb-8 text-center">{tLocal("Select a slot to save your current session")}</p>
        
        <input 
          type="text" 
          placeholder={tLocal("Session Name (Optional)")} 
          value={saveName} 
          onChange={(e) => setSaveName(e.target.value)}
          maxLength={20}
          className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-center mb-8 font-light text-white focus:outline-none focus:border-white transition-colors"
        />
        
        <div className="w-full flex flex-col gap-4 mb-8">
            {[0, 1].map((index) => {
                const save = saves[index];
                return (
                    <button 
                        key={index}
                        onClick={() => saveAndQuit(index)}
                        className={`w-full py-4 px-6 rounded-lg border flex justify-between items-center transition-all ${
                            save ? 'border-white/40 hover:border-white text-white' : 'border-white/10 hover:border-white/30 text-white/50'
                        }`}
                    >
                        <span className="font-light tracking-widest uppercase text-sm">{tLocal("Slot ")}{index + 1}</span>
                        <span className="text-xs opacity-70">{save ? tLocal('(Overwrite)') : tLocal('(Empty)')}</span>
                    </button>
                );
            })}
        </div>
        
        <button 
            onClick={() => setShowSaveModal(false)}
            className="min-h-[44px] px-6 text-sm font-light uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center"
        >
            {tLocal("Cancel")}
        </button>
      </div>
    </div>
  );
}
