import React from 'react';
import { useLanguage } from '../../../web/src/context/LanguageContext';

export default function PasswordChecklist({ password = '' }) {
  const { t } = useLanguage();
  if (!password) return null;

  const requirements = [
    { label: t('At least 8 characters'), met: password.length >= 8 },
    { label: t('Contains a lowercase letter (a-z)'), met: /[a-z]/.test(password) },
    { label: t('Contains an uppercase letter (A-Z)'), met: /[A-Z]/.test(password) },
    { label: t('Contains a number (0-9)'), met: /\d/.test(password) },
    { label: t('Contains a symbol (!@#$%^&*...)'), met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-3 p-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl space-y-2 text-xs shadow-inner animate-fade-in">
      <div className="text-[11px] font-semibold tracking-wider uppercase text-white/50 mb-1.5">
        {t("Password Requirements")}
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2.5 font-medium transition-colors duration-200 ${
              req.met ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border ${
              req.met ? 'border-emerald-400/40 bg-emerald-950/40' : 'border-red-400/40 bg-red-950/40'
            }`}>
              {req.met ? '✓' : '✕'}
            </span>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function isPasswordValid(password = '') {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
