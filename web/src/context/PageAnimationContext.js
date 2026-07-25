"use client";

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { shouldAnimate, incrementVisit } from '@/utils/sessionVisitCounter';

const PageAnimationContext = createContext(false);

/**
 * Wraps a page/section and provides a single "skip animation" boolean
 * to all SmoothFade/RevealText children via context.
 * 
 * On first visit (count === 0): skipAnimation = false → animations play
 * On revisit (count >= 1): skipAnimation = true → content renders instantly
 * 
 * incrementVisit runs in useEffect (after paint) so the CURRENT
 * render always sees the pre-increment value.
 */
export function PageAnimationGate({ pageKey, children }) {
  const pathname = usePathname();
  
  // Re-evaluate on mount or when navigation occurs
  const skipAnimation = useMemo(() => {
    return !shouldAnimate(pageKey);
  }, [pageKey, pathname]);

  // Mark as visited AFTER render so first visit still animates
  useEffect(() => {
    if (pageKey) {
      incrementVisit(pageKey);
    }
  }, [pageKey, pathname]);

  return (
    <PageAnimationContext.Provider value={skipAnimation}>
      {children}
    </PageAnimationContext.Provider>
  );
}

/**
 * Returns true if entrance animations should be skipped for the current page.
 * Returns false if no PageAnimationGate is present (default: animate).
 */
export function useSkipPageAnimation() {
  return useContext(PageAnimationContext);
}
