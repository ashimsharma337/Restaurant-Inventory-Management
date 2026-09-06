// src/lib/searchUtils.js
// FTS5 query building + per-table search functions.
// Server-side only — imported by src/pages/api/search.js

// ─── Query sanitiser ──────────────────────────────────────────────────────────
//
// mode=autocomplete  →  prefix on every token:  "chick* brea*"
// mode=full          →  phrase + AND fallback + last-token prefix

export function buildFtsQuery(raw, mode = 'autocomplete') {
  const cleaned = raw
    .replace(/['"^()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;

  const tokens = cleaned.split(' ').filter(Boolean);
  if (tokens.length === 0) return null;

  if (mode === 'autocomplete') {
    return tokens.map((t) => `${t}*`).join(' ');
  }

  if (tokens.length === 1) {
    return `${tokens[0]} OR ${tokens[0]}*`;
  }

  const phrase     = `"${tokens.join(' ')}"`;
  const andClause  = tokens.join(' AND ');
  const prefixLast = `${tokens[tokens.length - 1]}*`;
  return `${phrase} OR (${andClause}) OR ${prefixLast}`;
}

// ─── ingredients ─────────────────────────────────────────────────────────────
// Schema: id (INTEGER PK = rowid), meal_id, meal_name, name, measure
// FTS cols: name (col 0, 10x), meal_name (col 1, 2x), measure (col 2, 1x)

export function searchIngredients(db, ftsQuery, limit) {
  const stmt = db.prepare(`
    SELECT
      i.id,
      i.name,
      i.meal_name,
      i.measure,
      bm25(ingredients_fts, 10.0, 2.0, 1.0)            AS score,
      highlight(ingredients_fts, 0, '<mark>', '</mark>') AS name_hl
    FROM ingredients_fts
    JOIN ingredients i ON i.id = ingredients_fts.rowid
    WHERE ingredients_fts MATCH ?
    ORDER BY score
    LIMIT ?
  `);

  return stmt.all(ftsQuery, limit).map((r) => ({
    id:       r.id,
    name:     r.name,
    type:     'ingredient',
    subtitle: r.meal_name ? `used in ${r.meal_name}` : (r.measure || 'Ingredient'),
    score:    r.score,
    nameHl:   r.name_hl,
  }));
}

// ─── meals ────────────────────────────────────────────────────────────────────
// Schema: id (TEXT PK), name, category, area, instructions, thumbnail
// TEXT PK → use SQLite implicit rowid for FTS join
// FTS cols: name (col 0, 10x), category (col 1, 2x), area (col 2, 2x)

export function searchMeals(db, ftsQuery, limit) {
  const stmt = db.prepare(`
    SELECT
      m.id,
      m.name,
      m.category,
      m.area,
      bm25(meals_fts, 10.0, 2.0, 2.0)                  AS score,
      highlight(meals_fts, 0, '<mark>', '</mark>')       AS name_hl
    FROM meals_fts
    JOIN meals m ON m.rowid = meals_fts.rowid
    WHERE meals_fts MATCH ?
    ORDER BY score
    LIMIT ?
  `);

  return stmt.all(ftsQuery, limit).map((r) => ({
    id:       r.id,
    name:     r.name,
    type:     'meal',
    subtitle: [r.area, r.category].filter(Boolean).join(' · ') || 'Meal',
    score:    r.score,
    nameHl:   r.name_hl,
  }));
}

// ─── categories ───────────────────────────────────────────────────────────────
// Schema: id (TEXT PK), name, description, thumbnail
// TEXT PK → use SQLite implicit rowid for FTS join
// FTS cols: name (col 0, 10x), description (col 1, 1x)

export function searchCategories(db, ftsQuery, limit) {
  const stmt = db.prepare(`
    SELECT
      c.id,
      c.name,
      c.description,
      bm25(categories_fts, 10.0, 1.0)                   AS score,
      highlight(categories_fts, 0, '<mark>', '</mark>')  AS name_hl
    FROM categories_fts
    JOIN categories c ON c.rowid = categories_fts.rowid
    WHERE categories_fts MATCH ?
    ORDER BY score
    LIMIT ?
  `);

  return stmt.all(ftsQuery, limit).map((r) => ({
    id:       r.id,
    name:     r.name,
    type:     'category',
    subtitle: r.description
      ? r.description.slice(0, 60) + (r.description.length > 60 ? '...' : '')
      : 'Category',
    score:    r.score,
    nameHl:   r.name_hl,
  }));
}



// old code ...
// src/lib/searchUtils.js
// FTS5 query building + per-table search functions.
// Imported only by API routes (server-side only).

// ─── Query sanitiser ──────────────────────────────────────────────────────────
//
// FTS5's MATCH expression has its own syntax. Raw user input can contain
// characters that cause a parse error ( " ' ^ ( ) - ). We strip those,
// then build the right query shape depending on the mode.
//
// autocomplete  →  each token becomes a prefix:  "chick* brea*"
//   Used by the dropdown — fast, feels live.
//
// full          →  phrase + AND combo + last-token prefix
//   Used when the user hits Enter or the dashboard page loads with ?q=.
//   Tries to match the exact phrase first, falls back to all tokens present,
//   then a prefix on the last word.

// export function buildFtsQuery(raw, mode = 'autocomplete') {
//   const cleaned = raw
//     .replace(/['"^()\-]/g, ' ')
//     .replace(/\s+/g, ' ')
//     .trim();

//   if (!cleaned) return null;

//   const tokens = cleaned.split(' ').filter(Boolean);
//   if (tokens.length === 0) return null;

//   if (mode === 'autocomplete') {
//     // Simple prefix on every token — fastest path
//     return tokens.map((t) => `${t}*`).join(' ');
//   }

//   // Full search: phrase → all tokens AND → last token prefix
//   if (tokens.length === 1) {
//     return `${tokens[0]} OR ${tokens[0]}*`;
//   }

//   const phrase = `"${tokens.join(' ')}"`;
//   const andClause = tokens.join(' AND ');
//   const prefixLast = `${tokens[tokens.length - 1]}*`;
//   return `${phrase} OR (${andClause}) OR ${prefixLast}`;
// }

// // ─── Per-table search functions ───────────────────────────────────────────────
// // Each accepts a db instance, the sanitised ftsQuery string, and a row limit.
// // Returns a normalised array:  { id, name, type, subtitle, score, nameHl }

// export function searchIngredients(db, ftsQuery, limit) {
//   const stmt = db.prepare(`
//     SELECT
//       i.id,
//       i.name,
//       i.category,
//       bm25(ingredients_fts, 10.0, 1.0, 1.0)                   AS score,
//       highlight(ingredients_fts, 0, '<mark>', '</mark>')        AS name_hl
//     FROM ingredients_fts
//     JOIN ingredients i ON i.id = ingredients_fts.rowid
//     WHERE ingredients_fts MATCH ?
//     ORDER BY score
//     LIMIT ?
//   `);

//   return stmt.all(ftsQuery, limit).map((r) => ({
//     id: r.id,
//     name: r.name,
//     type: 'ingredient',
//     subtitle: r.category || 'Ingredient',
//     score: r.score,
//     nameHl: r.name_hl,
//   }));
// }

// export function searchMeals(db, ftsQuery, limit) {
//   const stmt = db.prepare(`
//     SELECT
//       m.id,
//       m.name,
//       m.area,
//       m.category,
//       bm25(meals_fts, 10.0, 2.0, 1.0, 0.5)                    AS score,
//       highlight(meals_fts, 0, '<mark>', '</mark>')              AS name_hl
//     FROM meals_fts
//     JOIN meals m ON m.id = meals_fts.rowid
//     WHERE meals_fts MATCH ?
//     ORDER BY score
//     LIMIT ?
//   `);

//   return stmt.all(ftsQuery, limit).map((r) => ({
//     id: r.id,
//     name: r.name,
//     type: 'meal',
//     subtitle: [r.area, r.category].filter(Boolean).join(' · ') || 'Meal',
//     score: r.score,
//     nameHl: r.name_hl,
//   }));
// }

// export function searchSuppliers(db, ftsQuery, limit) {
//   const stmt = db.prepare(`
//     SELECT
//       s.id,
//       s.name,
//       s.contact_info,
//       bm25(suppliers_fts, 10.0, 1.0)                           AS score,
//       highlight(suppliers_fts, 0, '<mark>', '</mark>')          AS name_hl
//     FROM suppliers_fts
//     JOIN suppliers s ON s.id = suppliers_fts.rowid
//     WHERE suppliers_fts MATCH ?
//     ORDER BY score
//     LIMIT ?
//   `);

//   return stmt.all(ftsQuery, limit).map((r) => ({
//     id: r.id,
//     name: r.name,
//     type: 'supplier',
//     subtitle: r.contact_info || 'Supplier',
//     score: r.score,
//     nameHl: r.name_hl,
//   }));
// }