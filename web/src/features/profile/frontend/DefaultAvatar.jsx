"use client";

import React from 'react';

// Discord-style pastel palette for default avatars
const AVATAR_COLORS = [
  '#5865F2', // Blurple
  '#EB459E', // Fuchsia
  '#57F287', // Green
  '#FEE75C', // Yellow
  '#ED4245', // Red
  '#3BA55D', // Dark Green
  '#FAA61A', // Orange
  '#9B59B6', // Purple
];

function getColorFromSeed(seed) {
  let hash = 0;
  const str = String(seed || '');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function DefaultAvatar({ src, avatarUrl, name, seed, size = 32, className = '', imgClassName = 'w-full h-full object-cover rounded-full' }) {
  const [imgError, setImgError] = React.useState(false);
  const imageUrl = (!imgError && (src || avatarUrl)) || null;
  const imgRef = React.useRef(null);

  const [prevSrcUrl, setPrevSrcUrl] = React.useState(src || avatarUrl);
  if ((src || avatarUrl) !== prevSrcUrl) {
    setPrevSrcUrl(src || avatarUrl);
    setImgError(false);
  }

  React.useEffect(() => {
    // Fix for SSR: if the image failed to load before React hydrated,
    // the synthetic onError event is lost. We manually check it here.
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth === 0) {
      setImgError(true);
    }
  }, [imageUrl]);

  if (imageUrl) {
    return (
      <img
        ref={imgRef}
        src={imageUrl}
        alt={name || "Avatar"}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={imgClassName}
      />
    );
  }

  const initial = (name || seed || 'U').charAt(0).toUpperCase();
  const bgColor = getColorFromSeed(seed || name);

  return (
    <div
      className={`flex items-center justify-center rounded-full select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        backgroundColor: bgColor,
        color: '#ffffff',
        fontSize: size * 0.42,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
      aria-label={`Default avatar for ${name || 'user'}`}
    >
      {initial}
    </div>
  );
}
