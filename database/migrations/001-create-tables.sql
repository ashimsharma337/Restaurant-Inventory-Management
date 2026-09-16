CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_in_documents (
    id BIGSERIAL PRIMARY KEY,
    stock_in_reference TEXT NOT NULL,
    original_name TEXT NOT NULL,
    object_key TEXT NOT NULL UNIQUE,
    content_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SCHEMA IF NOT EXISTS mealdb;

CREATE TABLE IF NOT EXISTS mealdb.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT
);

CREATE TABLE IF NOT EXISTS mealdb.meals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    area TEXT,
    instructions TEXT,
    thumbnail TEXT
);

CREATE TABLE IF NOT EXISTS mealdb.ingredients (
    id SERIAL PRIMARY KEY,
    meal_id TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    name TEXT NOT NULL,
    measure TEXT,
    UNIQUE(meal_id, name)
);