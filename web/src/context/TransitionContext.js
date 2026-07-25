"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SETTINGS_KEYS, getSetting } from '@/features/profile/utils/settingsUtils';

export const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();



  const [disableUiAnim, setDisableUiAnim] = useState(false);

  useEffect(() => {
    setDisableUiAnim(getSetting(SETTINGS_KEYS.DISABLE_UI_ANIMATIONS, false));
  }, []);

  useEffect(() => {
    const updateSetting = () => {
      setDisableUiAnim(getSetting(SETTINGS_KEYS.DISABLE_UI_ANIMATIONS, false));
    };
    window.addEventListener("ui-anim-control", updateSetting);
    return () => window.removeEventListener("ui-anim-control", updateSetting);
  }, []);



  // Reset exit state on mount of new route
  useEffect(() => {
    setIsExiting(false);
  }, [pathname]);

  const resetTransition = useCallback(() => setIsExiting(false), []);

  // Generic exit transition that resolves when complete
  const triggerExitTransition = useCallback((exitDurationMs = 800) => {
    return new Promise((resolve) => {
      setIsExiting(true);
      const isAnimDisabled = getSetting(SETTINGS_KEYS.DISABLE_UI_ANIMATIONS, false);
      setTimeout(() => {
        setIsExiting(false);
        resolve();
      }, isAnimDisabled ? 0 : exitDurationMs);
    });
  }, []);

  const navigateWithTransition = useCallback(async (href, exitDurationMs = 800) => {
    if (pathname === href) return;
    await triggerExitTransition(exitDurationMs);
    router.push(href);
  }, [pathname, router, triggerExitTransition]);

  return (
    <TransitionContext.Provider value={{ isExiting, disableUiAnim, triggerExitTransition, resetTransition, navigateWithTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionContext() {
  return useContext(TransitionContext);
}
