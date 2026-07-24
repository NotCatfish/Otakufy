import React from 'react';
import SmoothFade from './SmoothFade';

export default function PageContainer({ children, maxWidth = "max-w-[1440px]", className = "", disableGlobalFade = false }) {
  return (
    <div className="min-h-[calc(100vh-73px)] w-full antialiased drop-shadow-none dark:bg-transparent">
      <SmoothFade id="content-bounds" disabled={disableGlobalFade} className={`${maxWidth} w-[95%] mx-auto py-12 ${className}`}>
        {children}
      </SmoothFade>
    </div>
  );
}
