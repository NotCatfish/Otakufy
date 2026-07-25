"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useTransitionContext } from '@/context/TransitionContext';

export default function RevealText({ text = "", baseDelay = 0, charDelay = 0.035, className = "", disabled = false, forceAnimate = false }) {
  const transitionContext = useTransitionContext();
  const contextDisableUiAnim = transitionContext ? transitionContext.disableUiAnim : false;

  const [animationFinished, setAnimationFinished] = useState(false);
  const totalDuration = baseDelay + (text.length * charDelay) + 1.2; // 1.2s is the css animation duration

  useEffect(() => {
    if (disabled || contextDisableUiAnim) return;
    const timer = setTimeout(() => setAnimationFinished(true), totalDuration * 1000);
    return () => clearTimeout(timer);
  }, [disabled, contextDisableUiAnim, totalDuration]);

  if (typeof text !== 'string') return <span suppressHydrationWarning className={className}>{text}</span>;
  if (disabled || contextDisableUiAnim) return <span suppressHydrationWarning className={className}>{text}</span>;
  
  const chars = text.split('');
  
  return (
    <span suppressHydrationWarning className={`inline-flex flex-wrap ${className}`}>
      {chars.map((char, index) => {
        const entranceDelay = baseDelay + (index * charDelay);
        const spanClass = animationFinished ? 'opacity-100' : 'opacity-0 animate-blur-reveal';
        
        const style = animationFinished ? {} : { 
          animationDelay: `${entranceDelay}s`,
          animationFillMode: 'forwards'
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
