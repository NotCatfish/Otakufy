"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [isExiting, setIsExiting] = useState(false);
  const [visitedPaths, setVisitedPaths] = useState(() => new Set());
  const [disableUiAnim, setDisableUiAnim] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const updateSetting = () => {
      setDisableUiAnim(localStorage.getItem('otakufy_disable_ui_anim') === 'true');
    };
    updateSetting();
    window.addEventListener("ui-anim-control", updateSetting);
    return () => window.removeEventListener("ui-anim-control", updateSetting);
  }, []);

  useEffect(() => {
    // Wait for initial entrance animations to finish, then skip them for future navigations to THIS path
    const timer = setTimeout(() => {
      setVisitedPaths(prev => {
        const next = new Set(prev);
        next.add(pathname);
        return next;
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, [pathname]);

  const hasSeenIntro = visitedPaths.has(pathname);

  // Reset exit state on mount of new route
  useEffect(() => {
    setIsExiting(false);
  }, [pathname]);

  const resetTransition = useCallback(() => setIsExiting(false), []);

  // Generic exit transition that resolves when complete
  const triggerExitTransition = useCallback((exitDurationMs = 1500) => {
    return new Promise((resolve) => {
      setIsExiting(true);
      const isAnimDisabled = localStorage.getItem('otakufy_disable_ui_anim') === 'true';
      setTimeout(() => {
        resolve();
      }, isAnimDisabled ? 0 : exitDurationMs);
    });
  }, []);

  const navigateWithTransition = useCallback(async (href, exitDurationMs = 1500) => {
    if (pathname === href) return;
    await triggerExitTransition(exitDurationMs);
    router.push(href);
  }, [pathname, router, triggerExitTransition]);

  return (
    <TransitionContext.Provider value={{ isExiting, hasSeenIntro, disableUiAnim, triggerExitTransition, resetTransition, navigateWithTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionContext() {
  return useContext(TransitionContext);
}
