"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize hasSeenIntro synchronously on the client to prevent hydration flashes
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      const normalizedPath = pathname.startsWith('/practice') ? '/practice' : pathname;
      const visited = JSON.parse(sessionStorage.getItem('otakufy_visited_paths') || '[]');
      return visited.includes(normalizedPath);
    }
    return false;
  });

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
    // Group all practice paths under a single key so viewing one practice intro skips it for all other practice categories
    const normalizedPath = pathname.startsWith('/practice') ? '/practice' : pathname;
    
    // Check if we've seen it this session
    const visited = JSON.parse(sessionStorage.getItem('otakufy_visited_paths') || '[]');
    if (visited.includes(normalizedPath)) {
      setHasSeenIntro(true);
    } else {
      setHasSeenIntro(false);
      
      // Immediately add to visited paths to prevent replay if user navigates quickly
      const currentVisited = JSON.parse(sessionStorage.getItem('otakufy_visited_paths') || '[]');
      if (!currentVisited.includes(normalizedPath)) {
        currentVisited.push(normalizedPath);
        sessionStorage.setItem('otakufy_visited_paths', JSON.stringify(currentVisited));
      }

      // Wait for initial entrance animations to finish, then skip them for future navigations
      const timer = setTimeout(() => {
        setHasSeenIntro(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

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
