"use client";
import React, { useState } from 'react';
import { useTransitionContext } from '@/context/TransitionContext';

export default function SmoothFade({ children, delay = 0, className = "", as: Component = "div", disabled = false, forceAnimate = false, ...props }) {
  const transitionContext = useTransitionContext();
  const contextDisableUiAnim = transitionContext ? transitionContext.disableUiAnim : false;
  
  const [animationFinished, setAnimationFinished] = useState(false);
  
  if (disabled || contextDisableUiAnim) {
    return <Component suppressHydrationWarning className={className} {...props}>{children}</Component>;
  }
  
  return (
    <Component 
      suppressHydrationWarning
      className={`${animationFinished ? 'opacity-100' : 'opacity-0 animate-gentle-fade-up'} ${className}`}
      style={animationFinished ? {} : {
        animationDelay: `${delay}s`,
        animationFillMode: 'forwards'
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === 'gentle-fade-up') {
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
