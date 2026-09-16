INSERT INTO categories (name, description)
VALUES
    ('Vegetables', 'Fresh vegetables'),
    ('Meat', 'Meat and poultry'),
    ('Dairy', 'Milk, cheese, dairy products'),
    ('Grocery', 'Dry grocery items'),
    ('Beverages', 'Drinks and liquids')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    updated_at = NOW();