// scripts/setup-fts.js
// Creates FTS5 virtual tables, sync triggers, and populates the index
// from existing data in categories, meals, and ingredients tables.
//
// Safe to re-run — everything is CREATE IF NOT EXISTS / DROP IF EXISTS.
//
// Usage (run AFTER seed-local.js):
//   node scripts/setup-fts.js

const Database = require('better-sqlite3');
const path     = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'inventory.db');

const db = new Database(DB_PATH, { fileMustExist: true });
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

console.log('[fts] Setting up FTS5 on:', DB_PATH);

// ── Helper to log row counts ──────────────────────────────────────────────────
function count(table) {
  return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DROP existing FTS tables (safe re-run)
//    Dropping a virtual table also drops its shadow tables automatically.
// ─────────────────────────────────────────────────────────────────────────────
console.log('[fts] Dropping old FTS tables if they exist...');
db.exec(`
  DROP TABLE IF EXISTS ingredients_fts;
  DROP TABLE IF EXISTS meals_fts;
  DROP TABLE IF EXISTS categories_fts;
`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. CREATE FTS5 virtual tables
//
// Schema reminder:
//   ingredients → id, meal_id, meal_name, name, measure
//   meals       → id, name, category, area, instructions, thumbnail
//   categories  → id, name, description, thumbnail
//
// We index only text columns that are useful to search.
// instructions is excluded from meals — too noisy for search.
// thumbnail URLs are excluded everywhere — not searchable.
//
// content=     points FTS5 at your real table (no data duplication)
// content_rowid= maps FTS rowid to your table's PK
//
// Note: ingredients.id is INTEGER (autoincrement) — perfect for rowid.
//       meals.id and categories.id are TEXT — SQLite rowids are always
//       INTEGER, so we use the implicit rowid (SQLite assigns one even
//       to TEXT-PK tables). We join on rowid in queries.
// ─────────────────────────────────────────────────────────────────────────────
console.log('[fts] Creating FTS5 virtual tables...');
db.exec(`
  -- Ingredients FTS
  -- Columns: name (weight 10x), meal_name (weight 2x), measure (weight 1x)
  CREATE VIRTUAL TABLE ingredients_fts USING fts5(
    name,
    meal_name,
    measure,
    content='ingredients',
    content_rowid='id',
    tokenize='unicode61'
  );

  -- Meals FTS
  -- Columns: name (weight 10x), category (weight 2x), area (weight 2x)
  CREATE VIRTUAL TABLE meals_fts USING fts5(
    name,
    category,
    area,
    content='meals',
    content_rowid='rowid',
    tokenize='unicode61'
  );

  -- Categories FTS
  -- Columns: name (weight 10x), description (weight 1x)
  CREATE VIRTUAL TABLE categories_fts USING fts5(
    name,
    description,
    content='categories',
    content_rowid='rowid',
    tokenize='unicode61'
  );
`);
console.log('[fts] ✓ Virtual tables created');

// ─────────────────────────────────────────────────────────────────────────────
// 3. POPULATE FTS index from existing data (one-time bulk insert)
// ─────────────────────────────────────────────────────────────────────────────
console.log('[fts] Populating FTS index from existing data...');
db.exec(`
  -- ingredients: id is INTEGER PK so it's also the rowid
  INSERT INTO ingredients_fts (rowid, name, meal_name, measure)
    SELECT id, name, meal_name, measure FROM ingredients;

  -- meals: TEXT PK so use SQLite's implicit rowid
  INSERT INTO meals_fts (rowid, name, category, area)
    SELECT rowid, name, category, area FROM meals;

  -- categories: TEXT PK so use SQLite's implicit rowid
  INSERT INTO categories_fts (rowid, name, description)
    SELECT rowid, name, description FROM categories;
`);

console.log(`[fts] ✓ Indexed ${count('ingredients_fts')} ingredients`);
console.log(`[fts] ✓ Indexed ${count('meals_fts')} meals`);
console.log(`[fts] ✓ Indexed ${count('categories_fts')} categories`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. SYNC TRIGGERS
//    Keep the FTS index up to date whenever the real tables change.
//    Pattern: AI (after insert), AD (after delete), AU (after update).
// ─────────────────────────────────────────────────────────────────────────────
console.log('[fts] Creating sync triggers...');
db.exec(`
  -- ── INGREDIENTS triggers ────────────────────────────────────────────────────
  DROP TRIGGER IF EXISTS ingredients_ai;
  DROP TRIGGER IF EXISTS ingredients_ad;
  DROP TRIGGER IF EXISTS ingredients_au;

  CREATE TRIGGER ingredients_ai AFTER INSERT ON ingredients BEGIN
    INSERT INTO ingredients_fts (rowid, name, meal_name, measure)
    VALUES (new.id, new.name, new.meal_name, new.measure);
  END;

  CREATE TRIGGER ingredients_ad AFTER DELETE ON ingredients BEGIN
    INSERT INTO ingredients_fts (ingredients_fts, rowid, name, meal_name, measure)
    VALUES ('delete', old.id, old.name, old.meal_name, old.measure);
  END;

  CREATE TRIGGER ingredients_au AFTER UPDATE ON ingredients BEGIN
    INSERT INTO ingredients_fts (ingredients_fts, rowid, name, meal_name, measure)
    VALUES ('delete', old.id, old.name, old.meal_name, old.measure);
    INSERT INTO ingredients_fts (rowid, name, meal_name, measure)
    VALUES (new.id, new.name, new.meal_name, new.measure);
  END;

  -- ── MEALS triggers ──────────────────────────────────────────────────────────
  DROP TRIGGER IF EXISTS meals_ai;
  DROP TRIGGER IF EXISTS meals_ad;
  DROP TRIGGER IF EXISTS meals_au;

  CREATE TRIGGER meals_ai AFTER INSERT ON meals BEGIN
    INSERT INTO meals_fts (rowid, name, category, area)
    VALUES (new.rowid, new.name, new.category, new.area);
  END;

  CREATE TRIGGER meals_ad AFTER DELETE ON meals BEGIN
    INSERT INTO meals_fts (meals_fts, rowid, name, category, area)
    VALUES ('delete', old.rowid, old.name, old.category, old.area);
  END;

  CREATE TRIGGER meals_au AFTER UPDATE ON meals BEGIN
    INSERT INTO meals_fts (meals_fts, rowid, name, category, area)
    VALUES ('delete', old.rowid, old.name, old.category, old.area);
    INSERT INTO meals_fts (rowid, name, category, area)
    VALUES (new.rowid, new.name, new.category, new.area);
  END;

  -- ── CATEGORIES triggers ─────────────────────────────────────────────────────
  DROP TRIGGER IF EXISTS categories_ai;
  DROP TRIGGER IF EXISTS categories_ad;
  DROP TRIGGER IF EXISTS categories_au;

  CREATE TRIGGER categories_ai AFTER INSERT ON categories BEGIN
    INSERT INTO categories_fts (rowid, name, description)
    VALUES (new.rowid, new.name, new.description);
  END;

  CREATE TRIGGER categories_ad AFTER DELETE ON categories BEGIN
    INSERT INTO categories_fts (categories_fts, rowid, name, description)
    VALUES ('delete', old.rowid, old.name, old.description);
  END;

  CREATE TRIGGER categories_au AFTER UPDATE ON categories BEGIN
    INSERT INTO categories_fts (categories_fts, rowid, name, description)
    VALUES ('delete', old.rowid, old.name, old.description);
    INSERT INTO categories_fts (rowid, name, description)
    VALUES (new.rowid, new.name, new.description);
  END;
`);
console.log('[fts] ✓ Sync triggers created (9 total)');

// ─────────────────────────────────────────────────────────────────────────────
// 5. INTEGRITY CHECK — verifies index matches content tables
// ─────────────────────────────────────────────────────────────────────────────
console.log('[fts] Running integrity checks...');
try {
  db.exec(`INSERT INTO ingredients_fts (ingredients_fts) VALUES ('integrity-check')`);
  db.exec(`INSERT INTO meals_fts (meals_fts) VALUES ('integrity-check')`);
  db.exec(`INSERT INTO categories_fts (categories_fts) VALUES ('integrity-check')`);
  console.log('[fts] ✓ All integrity checks passed');
} catch (err) {
  console.error('[fts] ✗ Integrity check failed:', err.message);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SMOKE TEST — run a quick MATCH query to confirm everything works
// ─────────────────────────────────────────────────────────────────────────────
console.log('[fts] Running smoke tests...');

const ingTest = db.prepare(`
  SELECT i.name, i.meal_name, bm25(ingredients_fts, 10.0, 2.0, 1.0) AS score
  FROM ingredients_fts
  JOIN ingredients i ON i.id = ingredients_fts.rowid
  WHERE ingredients_fts MATCH 'chicken*'
  ORDER BY score
  LIMIT 3
`).all();

const mealTest = db.prepare(`
  SELECT m.name, m.area, bm25(meals_fts, 10.0, 2.0, 2.0) AS score
  FROM meals_fts
  JOIN meals m ON m.rowid = meals_fts.rowid
  WHERE meals_fts MATCH 'chicken*'
  ORDER BY score
  LIMIT 3
`).all();

console.log('[fts] Ingredients matching "chicken":');
ingTest.forEach((r) => console.log(`  → ${r.name} (in ${r.meal_name})`));

console.log('[fts] Meals matching "chicken":');
mealTest.forEach((r) => console.log(`  → ${r.name} (${r.area})`));

if (ingTest.length === 0 && mealTest.length === 0) {
  console.warn('[fts] ⚠ No results for smoke test — data may be empty');
} else {
  console.log('[fts] ✓ Smoke tests passed');
}

db.close();
console.log('');
console.log('[fts] ✓ FTS5 setup complete. You can now run: npm run dev');