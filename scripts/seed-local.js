// scripts/seed-local.js
// Creates data/inventory.db locally by fetching from TheMealDB.
// Mirrors exactly what the initContainer does, but writes to ./data/
// instead of /data/ so you can run npm run dev without Kubernetes.
//
// Usage:
//   node scripts/seed-local.js
//
// Only needs to run once (or whenever you want fresh data).
// The FTS5 setup (scripts/setup-fts.js) must be run after this.

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

// ── Point at local data/ folder ──────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH  = path.join(DATA_DIR, 'inventory.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('[seed] Created data/ directory');
}

// ── TheMealDB fetch helpers ───────────────────────────────────────────────────
// Inline versions so this script has no dependency on your initContainer's
// mealdb.js module (which may use different relative paths).

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

async function fetchCategories() {
  const res  = await fetch(`${MEALDB_BASE}/categories.php`);
  const json = await res.json();
  return (json.categories || []).map((c) => ({
    id:          c.idCategory,
    name:        c.strCategory,
    description: c.strCategoryDescription,
    thumbnail:   c.strCategoryThumb,
  }));
}

async function fetchMealsByCategory(category) {
  const res  = await fetch(`${MEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`);
  const json = await res.json();
  return json.meals || [];
}

async function fetchMealDetail(mealId) {
  const res  = await fetch(`${MEALDB_BASE}/lookup.php?i=${mealId}`);
  const json = await res.json();
  const m    = (json.meals || [])[0];
  if (!m) return null;

  const meal = {
    id:           m.idMeal,
    name:         m.strMeal,
    category:     m.strCategory,
    area:         m.strArea,
    instructions: m.strInstructions,
    thumbnail:    m.strMealThumb,
  };

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name    = (m[`strIngredient${i}`] || '').trim();
    const measure = (m[`strMeasure${i}`]    || '').trim();
    if (name) ingredients.push({ name, measure });
  }

  return { meal, ingredients };
}

// ── SQLite setup ──────────────────────────────────────────────────────────────

function openDb() {
  const db = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      thumbnail   TEXT
    );

    CREATE TABLE IF NOT EXISTS meals (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      category     TEXT,
      area         TEXT,
      instructions TEXT,
      thumbnail    TEXT
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id   TEXT NOT NULL,
      meal_name TEXT NOT NULL,
      name      TEXT NOT NULL,
      measure   TEXT,
      UNIQUE(meal_id, name)
    );
  `);

  console.log('[seed] SQLite schema ready →', DB_PATH);
  return db;
}

// ── Upserts (identical logic to your initContainer) ───────────────────────────

function upsertCategories(db, categories) {
  const stmt = db.prepare(`
    INSERT INTO categories (id, name, description, thumbnail)
    VALUES (@id, @name, @description, @thumbnail)
    ON CONFLICT(id) DO UPDATE
    SET name        = excluded.name,
        description = excluded.description,
        thumbnail   = excluded.thumbnail
  `);
  db.transaction((rows) => { for (const r of rows) stmt.run(r); })(categories);
  console.log(`[seed] Upserted ${categories.length} categories`);
}

function upsertMeal(db, meal) {
  db.prepare(`
    INSERT INTO meals (id, name, category, area, instructions, thumbnail)
    VALUES (@id, @name, @category, @area, @instructions, @thumbnail)
    ON CONFLICT(id) DO UPDATE
    SET name         = excluded.name,
        category     = excluded.category,
        area         = excluded.area,
        instructions = excluded.instructions,
        thumbnail    = excluded.thumbnail
  `).run(meal);
}

function upsertIngredients(db, mealId, mealName, ingredients) {
  const stmt = db.prepare(`
    INSERT INTO ingredients (meal_id, meal_name, name, measure)
    VALUES (@meal_id, @meal_name, @name, @measure)
    ON CONFLICT(meal_id, name) DO UPDATE
    SET measure   = excluded.measure,
        meal_name = excluded.meal_name
  `);
  db.transaction((rows) => { for (const r of rows) stmt.run(r); })(
    ingredients.map((i) => ({ meal_id: mealId, meal_name: mealName, ...i }))
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[seed] Starting local seed...');
  const db = openDb();

  const categories = await fetchCategories();
  upsertCategories(db, categories);

  let totalMeals       = 0;
  let totalIngredients = 0;

  for (const cat of categories) {
    console.log(`[seed] Processing: ${cat.name}`);
    const summaries = await fetchMealsByCategory(cat.name);

    for (const s of summaries) {
      const detail = await fetchMealDetail(s.idMeal);
      if (!detail) continue;

      const { meal, ingredients } = detail;
      upsertMeal(db, meal);
      upsertIngredients(db, meal.id, meal.name, ingredients);

      totalMeals++;
      totalIngredients += ingredients.length;
    }
  }

  console.log('');
  console.log('[seed] ✓ Done!');
  console.log(`[seed]   Categories : ${categories.length}`);
  console.log(`[seed]   Meals      : ${totalMeals}`);
  console.log(`[seed]   Ingredients: ${totalIngredients}`);
  console.log(`[seed]   DB path    : ${DB_PATH}`);
  console.log('');
  console.log('[seed] Now run: node scripts/setup-fts.js');

  db.close();
}

main().catch((err) => {
  console.error('[seed] Fatal:', err.message);
  process.exit(1);
});