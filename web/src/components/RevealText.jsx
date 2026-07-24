"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTransitionContext } from '@/context/TransitionContext';

export default function RevealText({ text = "", baseDelay = 0, charDelay = 0.035, className = "", disabled = false, forceAnimate = false }) {
  const transitionContext = useTransitionContext();
  const rawIsExiting = transitionContext ? transitionContext.isExiting : false;
  const hasSeenIntro = transitionContext ? transitionContext.hasSeenIntro : false;
  const contextDisableUiAnim = transitionContext ? transitionContext.disableUiAnim : false;

  const [isExiting, setIsExiting] = useState(false);
  const mountedDuringExitRef = useRef(rawIsExiting);
  
  useEffect(() => {
    if (mountedDuringExitRef.current && rawIsExiting) {
      // Ignore exit animation if the component just mounted while exiting is true
    } else {
      setIsExiting(rawIsExiting);
      mountedDuringExitRef.current = false;
    }
  }, [rawIsExiting]);

  const skipEntrance = useRef(forceAnimate ? false : hasSeenIntro);
  const prevText = useRef(text);

  if (typeof text !== 'string') return <span className={className}>{text}</span>;
  if (disabled || contextDisableUiAnim) return <span className={className}>{text}</span>;
  
  if (prevText.current !== text) {
    skipEntrance.current = true;
    prevText.current = text;
  }
  
  const chars = text.split('');
  
  // The exit animation happens at roughly 0.5x the delay to compress the wait time.
  const SPEED_FACTOR = 0.4;
  
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {chars.map((char, index) => {
        const entranceDelay = baseDelay + (index * charDelay);
        const exitDelay = ((chars.length - index - 1) * charDelay * 0.5);
        
        const isExitingClasses = 'opacity-100 animate-blur-hide';
        const entranceClasses = skipEntrance.current ? 'opacity-100' : 'opacity-0 animate-blur-reveal';
        const spanClass = isExiting ? isExitingClasses : entranceClasses;
        
        const style = (skipEntrance.current && !isExiting) ? {} : { 
          animationDelay: `${isExiting ? exitDelay : entranceDelay}s`,
          animationFillMode: 'forwards'
        };

        return (
          <span
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
