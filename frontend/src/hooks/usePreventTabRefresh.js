import { useEffect } from 'react';

/**
 * Hook to prevent page refresh when switching browser tabs
 * This addresses the issue where the application refreshes when the user switches tabs
 */
export function usePreventTabRefresh() {
  useEffect(() => {
    // Function to handle visibility change
    const handleVisibilityChange = (e) => {
      // Prevent default behavior when tab becomes visible again
      if (document.visibilityState === 'visible') {
        e.preventDefault();
      }
    };

    // Function to handle beforeunload
    const handleBeforeUnload = (e) => {
      // Check if this is triggered by a tab switch
      if (document.visibilityState === 'hidden') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
