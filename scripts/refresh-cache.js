// Single-run, same logic, lighter logging. The YAML while true; 
// sleep 120 calls this repeatedly.

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

function openDb() {
  // Schema already exists from init — just open the file
  return new Database(DB_PATH);
}

async function main() {
  console.log(`[refresh] ${new Date().toISOString()} Starting refresh...`);

  const db         = openDb();
  const categories = await fetchCategories();

  // Upsert categories
  const catStmt = db.prepare(`
    INSERT INTO categories (id, name, description, thumbnail)
    VALUES (@id, @name, @description, @thumbnail)
    ON CONFLICT(id) DO UPDATE
    SET name=excluded.name, description=excluded.description, thumbnail=excluded.thumbnail
  `);
  db.transaction((rows) => { for (const r of rows) catStmt.run(r); })(categories);

  for (const c of categories) {
    await pool.query(`
      INSERT INTO mealdb.categories (id, name, description, thumbnail)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT(id) DO UPDATE
      SET name=EXCLUDED.name, description=EXCLUDED.description, thumbnail=EXCLUDED.thumbnail
    `, [c.id, c.name, c.description, c.thumbnail]);
  }

  // Upsert meals + ingredients
  let totalMeals = 0;

  for (const cat of categories) {
    const summaries = await fetchMealsByCategory(cat.name);

    for (const s of summaries) {
      const detail = await fetchMealDetail(s.idMeal);
      if (!detail) continue;

      const { meal, ingredients } = detail;

      db.prepare(`
        INSERT INTO meals (id, name, category, area, instructions, thumbnail)
        VALUES (@id,@name,@category,@area,@instructions,@thumbnail)
        ON CONFLICT(id) DO UPDATE
        SET name=excluded.name, category=excluded.category, area=excluded.area,
            instructions=excluded.instructions, thumbnail=excluded.thumbnail
      `).run(meal);

      const ingStmt = db.prepare(`
        INSERT INTO ingredients (meal_id, meal_name, name, measure)
        VALUES (@meal_id,@meal_name,@name,@measure)
        ON CONFLICT(meal_id, name) DO UPDATE
        SET measure=excluded.measure, meal_name=excluded.meal_name
      `);
      db.transaction((rows) => { for (const r of rows) ingStmt.run(r); })(
        ingredients.map((i) => ({ meal_id: meal.id, meal_name: meal.name, ...i }))
      );

      await pool.query(`
        INSERT INTO mealdb.meals (id, name, category, area, instructions, thumbnail)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT(id) DO UPDATE
        SET name=EXCLUDED.name, category=EXCLUDED.category, area=EXCLUDED.area,
            instructions=EXCLUDED.instructions, thumbnail=EXCLUDED.thumbnail
      `, [meal.id, meal.name, meal.category, meal.area, meal.instructions, meal.thumbnail]);

      for (const ing of ingredients) {
        await pool.query(`
          INSERT INTO mealdb.ingredients (meal_id, meal_name, name, measure)
          VALUES ($1,$2,$3,$4)
          ON CONFLICT(meal_id, name) DO UPDATE
          SET measure=EXCLUDED.measure, meal_name=EXCLUDED.meal_name
        `, [meal.id, meal.name, ing.name, ing.measure]);
      }

      totalMeals++;
    }
  }

  console.log(`[refresh] ${new Date().toISOString()} Done — ${categories.length} categories, ${totalMeals} meals`);

  db.close();
  await pool.end();
}

main().catch((err) => {
  console.error('[refresh] Error:', err.message);
  process.exit(1);
});