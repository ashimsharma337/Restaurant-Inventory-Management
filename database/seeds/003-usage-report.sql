WITH week_start AS (
    SELECT DATE_TRUNC('week', NOW()) AS value
),
seed_rows(product_name, quantity_used, hour_offset) AS (
    VALUES
        ('Tomatoes', 3.250::NUMERIC, 0),
        ('Tomatoes', 2.500::NUMERIC, 1),
        ('Olive Oil', 0.500::NUMERIC, 2),
        ('Olive Oil', 0.750::NUMERIC, 3)
),
resolved_rows AS (
    SELECT
        products.id AS product_id,
        seed_rows.quantity_used,
        week_start.value + INTERVAL '9 hours'
            + seed_rows.hour_offset * INTERVAL '1 hour' AS used_at
    FROM seed_rows
    JOIN products ON products.name = seed_rows.product_name
    CROSS JOIN week_start
)
INSERT INTO stock_usage (product_id, quantity_used, used_at)
SELECT resolved_rows.product_id, resolved_rows.quantity_used, resolved_rows.used_at
FROM resolved_rows
WHERE NOT EXISTS (
    SELECT 1
    FROM stock_usage
    WHERE stock_usage.product_id = resolved_rows.product_id
      AND stock_usage.quantity_used = resolved_rows.quantity_used
      AND stock_usage.used_at = resolved_rows.used_at
);