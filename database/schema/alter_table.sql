ALTER TABLE products
DROP COLUMN category;

ALTER TABLE products
ADD COLUMN category_id INTEGER NOT NULL REFERENCES categories(id);

