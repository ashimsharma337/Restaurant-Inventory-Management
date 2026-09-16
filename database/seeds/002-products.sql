INSERT INTO products (name, category_id, quantity, unit, price, status)
SELECT seed.name, categories.id, seed.quantity, seed.unit, seed.price, seed.status
FROM (
    VALUES
        ('Tomatoes', 'Vegetables', 50, 'kg', 2.50::NUMERIC, 'In Stock'),
        ('Olive Oil', 'Grocery', 10, 'liters', 12.00::NUMERIC, 'Low Stock')
) AS seed(name, category_name, quantity, unit, price, status)
JOIN categories ON categories.name = seed.category_name
WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE products.name = seed.name
);