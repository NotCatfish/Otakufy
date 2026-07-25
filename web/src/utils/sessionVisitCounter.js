/**
 * Session-based visit counter with synchronous in-memory cache.
 * 
 * Uses sessionStorage as persistent backing store, but all reads
 * go through an in-memory Map for zero-latency access during render.
 */

const STORAGE_KEY = 'otakufy_visit_counts';

// In-memory cache — populated once from sessionStorage on first access
let cache = null;

function ensureCache() {
  if (cache !== null) return;
  cache = new Map();
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      for (const [key, count] of Object.entries(parsed)) {
        cache.set(key, count);
      }
    }
  } catch (e) {
    // Silently ignore corrupted storage
  }
}

function persistCache() {
  if (typeof window === 'undefined' || !cache) return;
  try {
    const obj = Object.fromEntries(cache);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    // Storage full or blocked — non-critical
  }
}

/**
 * Returns the current visit count for a page key (0 if never visited).
 * Synchronous — safe to call during render.
 */
export function getVisitCount(pageKey) {
  if (!pageKey) return 0;
  ensureCache();
  return cache.get(pageKey) || 0;
}

/**
 * Increments the visit count for a page key by 1.
 * Call this in useEffect (after render) so the current render
 * still sees the pre-increment value.
 */
export function incrementVisit(pageKey) {
  if (!pageKey) return;
  ensureCache();
  const current = cache.get(pageKey) || 0;
  cache.set(pageKey, current + 1);
  persistCache();
}

/**
 * Returns true if this page has NOT been visited yet in this session.
 * Synchronous — safe to call during render.
 */
export function shouldAnimate(pageKey) {
  return getVisitCount(pageKey) === 0;
}
