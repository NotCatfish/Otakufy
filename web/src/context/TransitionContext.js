"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [sessionUpdated, setSessionUpdated] = useState(0);

  const normalizedPath = pathname.startsWith('/practice') ? '/practice' : pathname;

  const hasSeenIntro = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const visited = JSON.parse(sessionStorage.getItem('otakufy_visited_paths') || '[]');
      return visited.includes(normalizedPath);
    }
    return false;
  }, [pathname, sessionUpdated, normalizedPath]);

  const [disableUiAnim, setDisableUiAnim] = useState(false);

  useEffect(() => {
    const updateSetting = () => {
      setDisableUiAnim(localStorage.getItem('otakufy_disable_ui_anim') === 'true');
    };
    updateSetting();
    window.addEventListener("ui-anim-control", updateSetting);
    return () => window.removeEventListener("ui-anim-control", updateSetting);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const visited = JSON.parse(sessionStorage.getItem('otakufy_visited_paths') || '[]');
    if (!visited.includes(normalizedPath)) {
      // Immediately add to visited paths to prevent replay if user navigates quickly
      visited.push(normalizedPath);
      sessionStorage.setItem('otakufy_visited_paths', JSON.stringify(visited));

      // Wait for initial entrance animations to finish, then trigger a re-evaluation so future states know it's seen
      // 5000ms ensures all staggered animations on the dashboard and setup pages finish before state flips
      const timer = setTimeout(() => {
        setSessionUpdated(prev => prev + 1);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pathname, normalizedPath]);

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
