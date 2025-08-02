import { useCallback } from 'react';

const CACHE_KEY = 'internshipSearchCache';

export function useSessionInternshipCache() {
  // Save search state and results to sessionStorage
  const saveCache = useCallback((data) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }));
    } catch (e) {
      // Ignore quota errors
    }
  }, []);

  // Load cache from sessionStorage
  const loadCache = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }, []);

  // Clear cache (e.g. on logout)
  const clearCache = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
  }, []);

  return { saveCache, loadCache, clearCache };
}
