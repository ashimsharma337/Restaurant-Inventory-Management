const Database = require('better-sqlite3');
const { Pool }  = require('pg');
const { fetchCategories, fetchMealsByCategory, fetchMealDetail } = require('./mealdb');

const DB_PATH = '/data/inventory.db';

const pool = new Pool({
  host:     process.env.POSTGRES_HOST,
  port:     parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// ── SQLite setup ────────────────────────────────────────

function openDb() {
  const db = new Database(DB_PATH);

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

  console.log('[init] SQLite schema ready');
  return db;
}

// ── SQLite upserts ──────────────────────────────────────

function sqliteUpsertCategories(db, categories) {
  const stmt = db.prepare(`
    INSERT INTO categories (id, name, description, thumbnail)
    VALUES (@id, @name, @description, @thumbnail)
    ON CONFLICT(id) DO UPDATE
    SET name        = excluded.name,
        description = excluded.description,
        thumbnail   = excluded.thumbnail
  `);
  db.transaction((rows) => { for (const r of rows) stmt.run(r); })(categories);
  console.log(`[init] SQLite: upserted ${categories.length} categories`);
}

function sqliteUpsertMeal(db, meal) {
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

function sqliteUpsertIngredients(db, mealId, mealName, ingredients) {
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

// ── Postgres upserts (mealdb schema) ───────────────────

async function pgUpsertCategories(categories) {
  for (const c of categories) {
    await pool.query(`
      INSERT INTO mealdb.categories (id, name, description, thumbnail)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE
      SET name        = EXCLUDED.name,
          description = EXCLUDED.description,
          thumbnail   = EXCLUDED.thumbnail
    `, [c.id, c.name, c.description, c.thumbnail]);
  }
  console.log(`[init] Postgres: upserted ${categories.length} categories → mealdb.categories`);
}

async function pgUpsertMeal(meal) {
  await pool.query(`
    INSERT INTO mealdb.meals (id, name, category, area, instructions, thumbnail)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE
    SET name         = EXCLUDED.name,
        category     = EXCLUDED.category,
        area         = EXCLUDED.area,
        instructions = EXCLUDED.instructions,
        thumbnail    = EXCLUDED.thumbnail
  `, [meal.id, meal.name, meal.category, meal.area, meal.instructions, meal.thumbnail]);
}

async function pgUpsertIngredients(mealId, mealName, ingredients) {
  for (const ing of ingredients) {
    await pool.query(`
      INSERT INTO mealdb.ingredients (meal_id, meal_name, name, measure)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (meal_id, name) DO UPDATE
      SET measure   = EXCLUDED.measure,
          meal_name = EXCLUDED.meal_name
    `, [mealId, mealName, ing.name, ing.measure]);
  }
}

// ── main ────────────────────────────────────────────────

async function main() {
  console.log('[init] Starting init-cache...');

  const db         = openDb();
  const categories = await fetchCategories();

  // Categories
  sqliteUpsertCategories(db, categories);
  await pgUpsertCategories(categories);

  // Meals + ingredients per category
  let totalMeals       = 0;
  let totalIngredients = 0;

  for (const cat of categories) {
    console.log(`[init] Processing category: ${cat.name}`);
    const summaries = await fetchMealsByCategory(cat.name);

    for (const s of summaries) {
      const detail = await fetchMealDetail(s.idMeal);
      if (!detail) continue;

      const { meal, ingredients } = detail;

      sqliteUpsertMeal(db, meal);
      sqliteUpsertIngredients(db, meal.id, meal.name, ingredients);
      await pgUpsertMeal(meal);
      await pgUpsertIngredients(meal.id, meal.name, ingredients);

      totalMeals++;
      totalIngredients += ingredients.length;
    }
  }

  console.log(`[init] ✓ Categories : ${categories.length}`);
  console.log(`[init] ✓ Meals      : ${totalMeals}`);
  console.log(`[init] ✓ Ingredients: ${totalIngredients}`);

  db.close();
  await pool.end();
  console.log('[init] Done. Exiting.');
}

main().catch((err) => {
  console.error('[init] Fatal:', err.message);
  process.exit(1);
});