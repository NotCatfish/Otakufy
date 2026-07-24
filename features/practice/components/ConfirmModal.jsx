import React from 'react';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--background)]/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-[var(--card-bg)] border border-[var(--strong-border)] rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-fade-in-up">
        <h3 className="text-xl font-light text-[var(--foreground)] mb-6 text-center tracking-wide">{message}</h3>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-lg transition-all duration-300 font-medium tracking-wide"
          >
            Confirm
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-3 bg-[var(--surface)] text-[var(--muted-text)] hover:bg-[var(--foreground)] hover:text-[var(--background)] border border-[var(--strong-border)] rounded-lg transition-all duration-300 font-medium tracking-wide"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
