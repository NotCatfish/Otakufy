"use client";
import React, { useRef, useEffect } from 'react';
import { useTransitionContext } from '@/context/TransitionContext';

export default function AnimatedLogo({ children, className = "" }) {
  const ref = useRef(null);
  const transitionContext = useTransitionContext();
  const contextDisableUiAnim = transitionContext ? transitionContext.disableUiAnim : false;

  useEffect(() => {
    const el = ref.current;
    if (!el || contextDisableUiAnim) return;

    let offset = 0;
    let animId;

    const animate = () => {
      offset -= 0.5; // pixels per frame — controls speed
      el.style.backgroundPosition = `${offset}px center`;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [contextDisableUiAnim]);

  return (
    <span
      ref={ref}
      className={`logo-rainbow-gradient ${className}`}
    >
      {children}
    </span>
  );
}
