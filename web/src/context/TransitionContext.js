"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SETTINGS_KEYS, getSetting } from '@/features/profile/utils/settingsUtils';

export const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [disableUiAnim, setDisableUiAnim] = useState(false);
  const [visitedPaths, setVisitedPaths] = useState([]);

  useEffect(() => {
    const updateSetting = () => {
      setDisableUiAnim(getSetting(SETTINGS_KEYS.DISABLE_UI_ANIMATIONS, false));
    };
    updateSetting();
    window.addEventListener("ui-anim-control", updateSetting);
    
    // Load visited paths
    const stored = JSON.parse(sessionStorage.getItem('otakufy_visited_paths') || '[]');
    setVisitedPaths(stored);
    
    return () => window.removeEventListener("ui-anim-control", updateSetting);
  }, []);

  const registerVisit = (path) => {
    setVisitedPaths(prev => {
      if (prev.includes(path)) return prev;
      const next = [...prev, path];
      sessionStorage.setItem('otakufy_visited_paths', JSON.stringify(next));
      return next;
    });
  };

  const hasVisited = (path) => {
    return visitedPaths.includes(path);
  };

  const hasSeenIntro = visitedPaths.includes('/');

  return (
    <TransitionContext.Provider value={{ disableUiAnim, hasVisited, registerVisit, hasSeenIntro }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionContext() {
  return useContext(TransitionContext);
}
