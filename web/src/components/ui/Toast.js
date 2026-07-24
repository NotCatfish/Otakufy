"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message || !visible) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  const borders = {
    success: "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-50",
    error: "border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-50",
    info: "border-sky-500/30 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-50"
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-toast max-w-md w-full px-4">
      <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-2xl backdrop-blur-xl ${borders[type] || borders.info}`}>
        <div className="flex items-start gap-3">
          {icons[type] || icons.info}
          <p className="text-[14px] font-medium leading-snug">{message}</p>
        </div>
        <button 
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="opacity-40 hover:opacity-100 transition-opacity p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
