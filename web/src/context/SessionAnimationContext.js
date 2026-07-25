"use client";
import React, { createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { markVisited } from '@/utils/sessionTracker';

const SessionAnimationContext = createContext(null);

export function useSessionAnimationKey() {
  const contextKey = useContext(SessionAnimationContext);
  const pathname = usePathname();
  // We don't default to pathname on the server because usePathname can trigger dynamic rendering
  return contextKey || pathname;
}

export function SessionAnimationTracker({ sessionKey, children }) {
  const currentKey = useSessionAnimationKey();
  const finalKey = sessionKey || currentKey;

  useEffect(() => {
    if (typeof window === 'undefined' || !finalKey) return;
    
    // Slight delay to ensure components mount and read their "unvisited" state first 
    // before we mark this key as visited.
    const timer = setTimeout(() => {
      markVisited(finalKey);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [finalKey]);

  return (
    <SessionAnimationContext.Provider value={finalKey}>
      {children}
    </SessionAnimationContext.Provider>
  );
}
