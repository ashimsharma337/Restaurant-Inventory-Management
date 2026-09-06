// src/hooks/useInventoryFilters.js
// Encapsulates all dashboard filter state as URL search params.
//
// Why URL params instead of useState?
//   - Filters are shareable / bookmarkable
//   - Browser back/forward works naturally
//   - The page can be server-rendered with the correct initial state
//   - No prop drilling — any component can read the URL
//
// Usage:
//   const { query, category, stockStatus, shelfZone, setFilter, clearAll } =
//     useInventoryFilters();

import { useRouter } from 'next/router';
import { useCallback } from 'react';

// The canonical param names used in the URL
export const FILTER_KEYS = {
  QUERY: 'q',
  CATEGORY: 'category',
  STOCK_STATUS: 'stock',
  SHELF_ZONE: 'zone',
  PAGE: 'page',
};

export function useInventoryFilters() {
  const router = useRouter();

  // Read current values — fall back to empty string / null when not set
  const query = router.query[FILTER_KEYS.QUERY] ?? '';
  const category = router.query[FILTER_KEYS.CATEGORY] ?? '';
  const stockStatus = router.query[FILTER_KEYS.STOCK_STATUS] ?? '';
  const shelfZone = router.query[FILTER_KEYS.SHELF_ZONE] ?? '';
  const page = parseInt(router.query[FILTER_KEYS.PAGE] ?? '1', 10);

  // ── setFilter ───────────────────────────────────────────────────────────────
  // Updates one filter key in the URL without touching the others.
  // Passing null / '' removes the key entirely (clean URLs).
  // Changing any filter resets pagination to page 1.
  const setFilter = useCallback(
    (key, value) => {
      const current = new URLSearchParams(
        // router.query can have array values for multi-params — flatten to string
        Object.fromEntries(
          Object.entries(router.query).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
        )
      );

      if (value === null || value === '' || value === undefined) {
        current.delete(key);
      } else {
        current.set(key, value);
      }

      // Reset to page 1 whenever a filter changes (not when page itself changes)
      if (key !== FILTER_KEYS.PAGE) {
        current.delete(FILTER_KEYS.PAGE);
      }

      router.push(
        { pathname: router.pathname, search: current.toString() },
        undefined,
        { shallow: true } // don't re-run getServerSideProps / getStaticProps
      );
    },
    [router]
  );

  // ── setQuery ─────────────────────────────────────────────────────────────────
  // Convenience wrapper — used by SearchInput
  const setQuery = useCallback(
    (value) => setFilter(FILTER_KEYS.QUERY, value),
    [setFilter]
  );

  // ── clearAll ─────────────────────────────────────────────────────────────────
  // Resets all filters to an empty URL
  const clearAll = useCallback(() => {
    router.push({ pathname: router.pathname, search: '' }, undefined, { shallow: true });
  }, [router]);

  // ── hasActiveFilters ──────────────────────────────────────────────────────────
  // Useful for showing a "Clear all" button only when something is active
  const hasActiveFilters = Boolean(query || category || stockStatus || shelfZone);

  return {
    // Current values
    query,
    category,
    stockStatus,
    shelfZone,
    page,
    hasActiveFilters,

    // Setters
    setQuery,
    setFilter,
    clearAll,

    // Expose keys so components don't hardcode strings
    FILTER_KEYS,
  };
}