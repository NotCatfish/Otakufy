"use client";

import React from 'react';
import Link from 'next/link';

export default function TransitionLink({ href, children, className, exitDurationMs, ...props }) {
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
