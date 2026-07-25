"use client";

import { useState, useEffect } from 'react';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import SmoothFade from '../../components/SmoothFade';
import RevealText from '../../components/RevealText';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import PageContainer from '../../components/PageContainer';
import { SETTINGS_KEYS, getSetting, saveSetting } from '@/features/profile/utils/settingsUtils';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '@/features/auth/frontend/supabaseClient';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [xpGoal, setXpGoal] = useState(500);
  const [showFurigana, setShowFurigana] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [showRomaji, setShowRomaji] = useState(false);
  const [disableUiAnim, setDisableUiAnim] = useState(false);
  const [disableParticles, setDisableParticles] = useState(false);

  useEffect(() => {
    // Load saved settings via centralized utility
    setXpGoal(getSetting(SETTINGS_KEYS.XP_GOAL, 500));
    setShowFurigana(getSetting(SETTINGS_KEYS.SHOW_FURIGANA, true));
    setAutoPlayAudio(getSetting(SETTINGS_KEYS.AUTO_AUDIO, false));
    setShowRomaji(getSetting(SETTINGS_KEYS.SHOW_ROMAJI, false));
    setDisableUiAnim(getSetting(SETTINGS_KEYS.DISABLE_UI_ANIMATIONS, false));
    setDisableParticles(getSetting(SETTINGS_KEYS.DISABLE_PARTICLES, false));
  }, []);

  const handleXpGoalChange = (val) => {
    setXpGoal(val);
    saveSetting(SETTINGS_KEYS.XP_GOAL, val);
  };

  const handleToggle = (key, value, setter) => {
    setter(value);
    saveSetting(key, value);
    if (key === SETTINGS_KEYS.DISABLE_UI_ANIMATIONS) {
        if (value) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
        window.dispatchEvent(new CustomEvent("ui-anim-control"));
    } else if (key === SETTINGS_KEYS.DISABLE_PARTICLES) {
        if (value) {
            window.dispatchEvent(new CustomEvent("sakura-control", { detail: { action: "fade_out" } }));
        } else {
            window.dispatchEvent(new CustomEvent("sakura-control", { detail: { action: "fade_in" } }));
        }
    }
  };

  return (
    <PageContainer maxWidth="max-w-[1440px]" className="font-medium text-white">
      <SmoothFade as="header" delay={0.1} className="mb-12 border-b border-[var(--strong-border)] pb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
          <RevealText text={t("Settings")} baseDelay={0.2} />
        </h1>
        <p className="text-[14px] text-white/50">{t("Customize your Otakufy experience.")}</p>
      </SmoothFade>

      <div className="space-y-8">
        
        {/* Daily XP Goal */}
        <SmoothFade delay={0.2} as="section" className="bg-[var(--surface)] border border-[var(--strong-border)] p-8 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-1 text-white">{t("Daily XP Goal")}</h3>
              <p className="text-[13px] text-white/30">{t("Set a personal daily target for your own motivation. (Your streak extends automatically just by playing!)")}</p>
            </div>
            
            {user ? (
            <div className="flex items-center gap-2 bg-[var(--surface)] p-1.5 rounded-xl border border-[var(--strong-border)]">
              {[100, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => handleXpGoalChange(val)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    xpGoal === val 
                    ? 'bg-white text-black' 
                    : 'hover:text-white text-white/50'
                  }`}
                >
                  {val} XP
                </button>
              ))}
            </div>
            ) : (
            <a href="/login" className="flex items-center gap-2 bg-[var(--surface)] p-2 px-4 rounded-xl border border-[var(--strong-border)] hover:border-white/30 transition-colors">
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span className="text-[13px] text-white/50 font-medium">{t("Login to set")}</span>
            </a>
            )}
          </div>
        </SmoothFade>

        {/* Global Preferences */}
        <SmoothFade delay={0.3} as="section" className="bg-[var(--surface)] border border-[var(--strong-border)] p-8 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6 text-white">{t("Global Preferences")}</h3>
          
          <div className="space-y-2">
            
            <div className="flex items-center justify-between py-4 border-b border-[var(--strong-border)]">
              <div>
                <div className="font-medium text-[15px] mb-1 text-white">{t("Application Theme")}</div>
                <div className="text-[13px] text-white/30">{t("Toggle between dark and light mode universally.")}</div>
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-[var(--strong-border)]">
              <div>
                <div className="font-medium text-[15px] mb-1 text-white">{t("Show Furigana (振り仮名)")}</div>
                <div className="text-[13px] text-white/30">{t("Display reading aids above kanji characters during practice.")}</div>
              </div>
              <ToggleSwitch 
                checked={showFurigana} 
                onChange={() => handleToggle(SETTINGS_KEYS.SHOW_FURIGANA, !showFurigana, setShowFurigana)} 
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-[var(--strong-border)]">
              <div>
                <div className="font-medium text-[15px] mb-1 text-white">{t("Show Romaji (ローマ字)")}</div>
                <div className="text-[13px] text-white/30">{t("Display english alphabet readings alongside Japanese text.")}</div>
              </div>
              <ToggleSwitch 
                checked={showRomaji} 
                onChange={() => handleToggle(SETTINGS_KEYS.SHOW_ROMAJI, !showRomaji, setShowRomaji)} 
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-[var(--strong-border)]">
              <div>
                <div className="font-medium text-[15px] mb-1 text-white">{t("Auto-Play Audio")}</div>
                <div className="text-[13px] text-white/30">{t("Automatically read sentences aloud when revealing answers.")}</div>
              </div>
              <ToggleSwitch 
                checked={autoPlayAudio} 
                onChange={() => handleToggle(SETTINGS_KEYS.AUTO_AUDIO, !autoPlayAudio, setAutoPlayAudio)} 
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-[var(--strong-border)]">
              <div>
                <div className="font-medium text-[15px] mb-1 text-white">{t("Disable UI Animations")}</div>
                <div className="text-[13px] text-white/30">{t("Turn off all interface animations and transitions.")}</div>
              </div>
              <ToggleSwitch 
                checked={disableUiAnim} 
                onChange={() => handleToggle(SETTINGS_KEYS.DISABLE_UI_ANIMATIONS, !disableUiAnim, setDisableUiAnim)} 
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-medium text-[15px] mb-1 text-white">{t("Disable Particle Animations")}</div>
                <div className="text-[13px] text-white/30">{t("Turn off seasonal background effects like falling cherry blossoms.")}</div>
              </div>
              <ToggleSwitch 
                checked={disableParticles} 
                onChange={() => handleToggle(SETTINGS_KEYS.DISABLE_PARTICLES, !disableParticles, setDisableParticles)} 
              />
            </div>

          </div>
        </SmoothFade>
      </div>
    </PageContainer>
  );
}
