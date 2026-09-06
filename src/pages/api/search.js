// src/pages/api/search.js
// GET /api/search?q=chicken&limit=8&mode=autocomplete
//
// mode=autocomplete  → dropdown, prefix search, default limit 8
// mode=full          → full results, phrase+fallback, default limit 50

import getDb from '@/lib/db';
import {
  buildFtsQuery,
  searchIngredients,
  searchMeals,
  searchCategories,
} from '@/lib/searchUtils';

const DEFAULT_LIMITS = { autocomplete: 8, full: 50 };

// Distribute limit across tables
// Ingredients biggest slice — primary search domain
function distributeLimits(total) {
  return {
    ingredients: Math.ceil(total * 0.45),
    meals:       Math.ceil(total * 0.40),
    categories:  Math.ceil(total * 0.15),
  };
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawQuery = (req.query.q ?? '').trim();
  const mode     = req.query.mode === 'full' ? 'full' : 'autocomplete';
  const maxLimit = mode === 'full' ? 100 : 20;
  const limit    = Math.min(
    parseInt(req.query.limit ?? String(DEFAULT_LIMITS[mode]), 10),
    maxLimit,
  );

  // Too short — return empty immediately
  if (!rawQuery || rawQuery.length < 2) {
    return res.status(200).json({ results: [], query: rawQuery, total: 0 });
  }

  const ftsQuery = buildFtsQuery(rawQuery, mode);
  if (!ftsQuery) {
    return res.status(200).json({ results: [], query: rawQuery, total: 0 });
  }

  try {
    const db     = getDb();
    const limits = distributeLimits(limit);

    const ingredients = searchIngredients(db, ftsQuery, limits.ingredients);
    const meals       = searchMeals(db, ftsQuery, limits.meals);
    const categories  = searchCategories(db, ftsQuery, limits.categories);

    // Merge and re-sort by BM25 score (ascending = more relevant)
    const merged = [...ingredients, ...meals, ...categories]
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);

    res.setHeader('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');

    return res.status(200).json({
      results: merged,
      query:   rawQuery,
      total:   merged.length,
    });

  } catch (err) {
    console.error('[/api/search] error:', err);
    const msg       = err instanceof Error ? err.message : String(err);
    const isFtsBug  = msg.toLowerCase().includes('fts5') || msg.toLowerCase().includes('match');

    return res.status(isFtsBug ? 400 : 500).json({
      results: [],
      query:   rawQuery,
      total:   0,
      error:   isFtsBug
        ? 'Invalid search query — try different keywords'
        : 'Search temporarily unavailable',
    });
  }
}



// old code ...
// // src/pages/api/search.js
// // GET /api/search?q=chicken&limit=8&mode=autocomplete
// //
// // mode=autocomplete  → dropdown, prefix search, limit default 8
// // mode=full          → full results page, phrase+fallback search, limit default 50

// import getDb from '@/lib/db';
// import { buildFtsQuery, searchIngredients, searchMeals, searchSuppliers } from '@/lib/searchUtils';

// const DEFAULT_LIMITS = {
//   autocomplete: 8,
//   full: 50,
// };

// // Distribute total limit across the three tables.
// // Ingredients get the biggest slice since that's the primary domain.
// function distributeLimits(total) {
//   return {
//     ingredients: Math.ceil(total * 0.50),
//     meals: Math.ceil(total * 0.35),
//     suppliers: Math.ceil(total * 0.15),
//   };
// }

// export default function handler(req, res) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const rawQuery = (req.query.q ?? '').trim();
//   const mode = req.query.mode === 'full' ? 'full' : 'autocomplete';
//   const maxLimit = mode === 'full' ? 100 : 20;
//   const limit = Math.min(
//     parseInt(req.query.limit ?? String(DEFAULT_LIMITS[mode]), 10),
//     maxLimit
//   );

//   // ── Guard: too short ────────────────────────────────────────────────────────
//   if (!rawQuery || rawQuery.length < 2) {
//     return res.status(200).json({ results: [], query: rawQuery, total: 0 });
//   }

//   // ── Build FTS5 query string ─────────────────────────────────────────────────
//   const ftsQuery = buildFtsQuery(rawQuery, mode);
//   if (!ftsQuery) {
//     return res.status(200).json({ results: [], query: rawQuery, total: 0 });
//   }

//   // ── Run searches ────────────────────────────────────────────────────────────
//   try {
//     const db = getDb();
//     const limits = distributeLimits(limit);

//     const ingredients = searchIngredients(db, ftsQuery, limits.ingredients);
//     const meals = searchMeals(db, ftsQuery, limits.meals);
//     const suppliers = searchSuppliers(db, ftsQuery, limits.suppliers);

//     // Merge all results, re-sort by BM25 score (ascending = more relevant),
//     // then trim to the requested limit
//     const merged = [...ingredients, ...meals, ...suppliers]
//       .sort((a, b) => a.score - b.score)
//       .slice(0, limit);

//     // Cache for 30s on the client — autocomplete results change slowly
//     res.setHeader('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');

//     return res.status(200).json({
//       results: merged,
//       query: rawQuery,
//       total: merged.length,
//     });

//   } catch (err) {
//     console.error('[/api/search] error:', err);

//     const message = err instanceof Error ? err.message : String(err);
//     const isFtsError =
//       message.toLowerCase().includes('fts5') ||
//       message.toLowerCase().includes('match');

//     return res.status(isFtsError ? 400 : 500).json({
//       results: [],
//       query: rawQuery,
//       total: 0,
//       error: isFtsError
//         ? 'Invalid search query — try different keywords'
//         : 'Search temporarily unavailable',
//     });
//   }
// }