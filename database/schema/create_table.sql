CREATE DATABASE IF NOT EXISTS restaurant_inventory;

-- 1. Create the mealdb schema
CREATE SCHEMA IF NOT EXISTS mealdb;

-- 2. TheMealDB categories (separate from your public.categories)
CREATE TABLE IF NOT EXISTS mealdb.categories (
    id          TEXT PRIMARY KEY,         -- TheMealDB uses "1", "2" etc as strings
    name        TEXT NOT NULL,
    description TEXT,
    thumbnail   TEXT
);

-- 3. Meals
CREATE TABLE IF NOT EXISTS mealdb.meals (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    category     TEXT,
    area         TEXT,
    instructions TEXT,
    thumbnail    TEXT
);

-- 4. Ingredients
CREATE TABLE IF NOT EXISTS mealdb.ingredients (
    id        SERIAL PRIMARY KEY,
    meal_id   TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    name      TEXT NOT NULL,
    measure   TEXT,
    UNIQUE(meal_id, name)
);