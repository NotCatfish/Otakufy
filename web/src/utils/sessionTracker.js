// Helper to safely parse and store session paths in memory to avoid repetitive parsing
let visitedPathsCache = null;

export function getVisitedPaths() {
  if (typeof window === 'undefined') return [];
  if (visitedPathsCache === null) {
    try {
      visitedPathsCache = JSON.parse(sessionStorage.getItem('otakufy_visited_paths') || '[]');
    } catch (e) {
      visitedPathsCache = [];
    }
  }
  return visitedPathsCache;
}

export function hasVisited(key) {
  if (!key || typeof window === 'undefined') return false;
  const paths = getVisitedPaths();
  return paths.includes(key);
}

export function markVisited(key) {
  if (!key || typeof window === 'undefined') return;
  const paths = getVisitedPaths();
  if (!paths.includes(key)) {
    paths.push(key);
    try {
      sessionStorage.setItem('otakufy_visited_paths', JSON.stringify(paths));
    } catch (e) {
      console.error('Failed to save to sessionStorage', e);
    }
  }
}
