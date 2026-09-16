CREATE INDEX IF NOT EXISTS products_category_id_idx
    ON products (category_id);

CREATE INDEX IF NOT EXISTS stock_in_documents_reference_idx
    ON stock_in_documents (stock_in_reference, created_at DESC);

CREATE INDEX IF NOT EXISTS mealdb_meals_category_idx
    ON mealdb.meals (category);

CREATE INDEX IF NOT EXISTS mealdb_ingredients_meal_id_idx
    ON mealdb.ingredients (meal_id);