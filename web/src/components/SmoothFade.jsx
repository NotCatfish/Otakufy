"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTransitionContext } from '@/context/TransitionContext';

export default function SmoothFade({ children, delay = 0, className = "", as: Component = "div", disabled = false, forceAnimate = false, ...props }) {
  const transitionContext = useTransitionContext();
  const rawIsExiting = transitionContext ? transitionContext.isExiting : false;
  const rawHasSeenIntro = transitionContext ? transitionContext.hasSeenIntro : false;
  const contextDisableUiAnim = transitionContext ? transitionContext.disableUiAnim : false;
  
  // Capture whether we should skip the intro exactly once on mount
  const skipIntroRef = useRef(forceAnimate ? false : rawHasSeenIntro);
  const [isExiting, setIsExiting] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const mountedDuringExitRef = useRef(rawIsExiting);
  
  useEffect(() => {
    if (mountedDuringExitRef.current && rawIsExiting) {
      // Ignore exit animation if the component just mounted while exiting is true
    } else {
      setIsExiting(rawIsExiting);
      mountedDuringExitRef.current = false;
      // Reset animation finished if we start exiting
      if (rawIsExiting) setAnimationFinished(false);
    }
  }, [rawIsExiting]);

  if ((disabled && !isExiting) || contextDisableUiAnim) {
    return <Component suppressHydrationWarning className={className} {...props}>{children}</Component>;
  }
  
  // If we should skip intro, or if the animation naturally finished, just hold the final state
  // This removes the animation class and the transform context, fixing backdrop-filter bugs.
  const isFinalState = skipIntroRef.current || animationFinished;
  
  return (
    <Component 
      suppressHydrationWarning
      className={`${isExiting ? 'opacity-0 translate-y-5 blur-[8px] transition-all duration-1000 ease-in-out' : (isFinalState ? 'opacity-100' : 'opacity-0 animate-gentle-fade-up')} ${className}`}
      style={{
        [isExiting ? 'transitionDelay' : 'animationDelay']: `${isExiting ? 0 : delay}s`,
        ...(isExiting ? {} : { animationFillMode: 'forwards' })
      }}
      onAnimationEnd={(e) => {
        if (!isExiting && e.animationName === 'gentle-fade-up') {
          setAnimationFinished(true);
        }
        if (props.onAnimationEnd) props.onAnimationEnd(e);
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
