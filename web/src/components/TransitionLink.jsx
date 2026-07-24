"use client";

import React from 'react';
import Link from 'next/link';
import { useTransitionContext } from '@/context/TransitionContext';
import { useRouter } from 'next/navigation';

export default function TransitionLink({ href, children, className, exitDurationMs = 2500, ...props }) {
  const { navigateWithTransition } = useTransitionContext();
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    
    // If no context (not wrapped), just route normally
    if (!navigateWithTransition) {
      router.push(href);
      return;
    }
    
    navigateWithTransition(href, exitDurationMs);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
