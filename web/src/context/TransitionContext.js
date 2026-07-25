"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [disableUiAnim, setDisableUiAnim] = useState(false);

  useEffect(() => {
    const updateSetting = () => {
      setDisableUiAnim(localStorage.getItem('otakufy_disable_ui_anim') === 'true');
    };
    updateSetting();
    window.addEventListener("ui-anim-control", updateSetting);
    return () => window.removeEventListener("ui-anim-control", updateSetting);
  }, []);

  return (
    <TransitionContext.Provider value={{ disableUiAnim }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionContext() {
  return useContext(TransitionContext);
}
