ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'category'
    ) THEN
        UPDATE products AS p
        SET category_id = c.id
        FROM categories AS c
        WHERE p.category_id IS NULL
          AND c.name = p.category;

        ALTER TABLE products DROP COLUMN category;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'products'::regclass
          AND conname = 'products_category_id_fkey'
    ) THEN
        ALTER TABLE products
            ADD CONSTRAINT products_category_id_fkey
            FOREIGN KEY (category_id) REFERENCES categories(id);
    END IF;
END $$;

ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;