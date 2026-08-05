"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTransitionContext } from '@/context/TransitionContext';
import { useSkipPageAnimation } from '@/context/PageAnimationContext';

export default function RevealText({ text = "", baseDelay = 0, charDelay = 0.035, className = "", disabled = false, forceAnimate = false, ignoreExit = false }) {
  const transitionContext = useTransitionContext();
  const rawIsExiting = transitionContext ? transitionContext.isExiting : false;
  const contextDisableUiAnim = transitionContext ? transitionContext.disableUiAnim : false;

  const [isExiting, setIsExiting] = useState(false);
  const mountedDuringExitRef = useRef(rawIsExiting);
  
  useEffect(() => {
    if (ignoreExit) return;
    if (mountedDuringExitRef.current && rawIsExiting) {
      // Ignore exit animation if the component just mounted while exiting is true
    } else {
      setIsExiting(rawIsExiting);
      mountedDuringExitRef.current = false;
    }
  }, [rawIsExiting, ignoreExit]);

  const skipPageAnim = useSkipPageAnimation();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  // Skip entrance if context says so, or if we've already mounted (e.g., text changed due to language switch)
  const shouldSkipEntrance = (!forceAnimate && (skipPageAnim || hasMountedRef.current));
  
  const prevText = useRef(text);

  if (typeof text !== 'string') return <span suppressHydrationWarning className={className}>{text}</span>;
  if ((disabled && !isExiting) || contextDisableUiAnim) return <span suppressHydrationWarning className={className}>{text}</span>;
  
  if (prevText.current !== text) {
    prevText.current = text;
  }
  
  const chars = text.split('');
  
  // The exit animation happens at roughly 0.5x the delay to compress the wait time.
  const SPEED_FACTOR = 0.4;
  
  return (
    <span suppressHydrationWarning className={`inline-flex flex-wrap ${className}`}>
      {chars.map((char, index) => {
        const entranceDelay = baseDelay + (index * charDelay);
        const exitDelay = ((chars.length - index - 1) * charDelay * 0.5);
        
        const isExitingClasses = 'opacity-0 transition-opacity duration-[800ms] ease-in-out';
        const entranceClasses = shouldSkipEntrance ? 'opacity-100' : 'opacity-0 animate-blur-reveal';
        const spanClass = isExiting ? isExitingClasses : entranceClasses;
        
        const style = (shouldSkipEntrance && !isExiting) ? {} : { 
          [isExiting ? 'transitionDelay' : 'animationDelay']: `${isExiting ? exitDelay : entranceDelay}s`,
          ...(isExiting ? {} : { animationFillMode: 'forwards' })
        };

        return (
          <span
            suppressHydrationWarning
            key={`${text}-${index}`}
            className={`inline-block ${spanClass}`}
            style={style}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
}
