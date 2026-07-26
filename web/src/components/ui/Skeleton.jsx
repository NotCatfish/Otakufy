"use client";

import React from 'react';

export function Skeleton({ className = "", width, height }) {
  const style = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`skeleton-shimmer inline-block ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div className="mb-card p-6 space-y-4">
      <Skeleton height={24} width="60%" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height={16} width={i === rows - 1 ? "40%" : "90%"} />
        ))}
      </div>
    </div>
  );
}

export function RowSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="mb-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 w-2/3">
            <Skeleton width={36} height={36} className="rounded-full shrink-0" />
            <div className="space-y-1.5 w-full">
              <Skeleton width="45%" height={16} />
              <Skeleton width="25%" height={12} />
            </div>
          </div>
          <Skeleton width={60} height={20} />
        </div>
      ))}
    </div>
  );
}
