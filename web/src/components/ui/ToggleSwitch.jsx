import React from 'react';

export default function ToggleSwitch({ checked, onChange, className = '' }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-white' : 'bg-[var(--card-border)]'} ${className}`}
    >
      <div className={`absolute top-1 left-1 bg-[var(--surface)] w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </button>
  );
}
