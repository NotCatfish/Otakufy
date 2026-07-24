/**
 * Simple in-memory rate limiter with LRU size bound and automatic cleanup.
 * Resets per server restart (good enough for serverless/edge — each instance has its own store).
 * Key: IP address or user identifier
 * Value: { count, resetAt }
 */
const store = new Map();

// Periodic sweep every 5 minutes to prevent memory leaks from one-off spoofed IPs
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now > value.resetAt) {
        store.delete(key);
      }
    }
  }, 300_000).unref?.();
}

/**
 * Check rate limit for a given key.
 * @param {string} key       - unique identifier (IP or user ID)
 * @param {number} limit     - max requests allowed in the window
 * @param {number} windowMs  - time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function rateLimit(key, limit = 10, windowMs = 60_000) {
  const now = Date.now();

  // Prevent memory exhaustion during DDoS/spoofed IP floods
  if (store.size > 5000) {
    // Delete the oldest 1000 entries instead of clearing completely
    const iterator = store.keys();
    for (let i = 0; i < 1000; i++) {
      const key = iterator.next().value;
      if (key !== undefined) {
        store.delete(key);
      }
    }
  }

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Get the best available IP from the request headers.
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-vercel-forwarded-for') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
