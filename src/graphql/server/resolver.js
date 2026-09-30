import pool, { query } from "../../utility/db";

export const resolvers = {
  Query: {
    products: async () => {
      try {
        const { rows } = await query(`
        SELECT p.*, c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `);
        return rows.map((row) => ({
          id: row.id,
          name: row.name,
          category_id: row.category_id,
          quantity: row.quantity,
          unit: row.unit,
          price: row.price,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          category: row.category_id
            ? { id: row.category_id, name: row.category_name }
            : null,
        }));
      } catch (err) {
        console.error("PRODUCTS RESOLVER ERROR:", err);
        throw err;
      }
    },

    product: async (_, { id }) => {
      const { rows } = await query(
        `
        SELECT p.*, c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `,
        [id],
      );

      const row = rows[0];
      return {
        id: row.id,
        name: row.name,
        category_id: row.category_id,
        quantity: row.quantity,
        unit: row.unit,
        price: row.price,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: row.category_id
          ? { id: row.category_id, name: row.category_name }
          : null,
      };
    },

    categories: async () => {
      const { rows } = await query("SELECT * FROM categories ORDER BY name");
      return rows;
    },

    usageReport: async (_, { startDate, endDate }) => {
      const { rows } = await query(
        `
        SELECT p.id AS product_id, p.name, c.name AS category,
               SUM(su.quantity_used) AS quantity_used, p.unit
        FROM stock_usage su
        JOIN products p ON p.id = su.product_id
        JOIN categories c ON c.id = p.category_id
        WHERE su.used_at >= $1::TIMESTAMPTZ
          AND su.used_at < $2::TIMESTAMPTZ
        GROUP BY p.id, p.name, c.name, p.unit
        ORDER BY SUM(su.quantity_used) DESC, p.name
        `,
        [startDate, endDate],
      );
      return rows;
    },
  },

  Product: {
    createdAt: (parent) => parent.created_at,
    updatedAt: (parent) => parent.updated_at,
    stockValue: (parent) => parent.price * parent.quantity,
    categoryId: (parent) => parent.category_id,

    category: (parent) => parent.category,
  },

  Category: {
    createdAt: (parent) => parent.created_at,
    updatedAt: (parent) => parent.updated_at,
  },

  UsageReportRow: {
    productId: (parent) => parent.product_id,
    quantityUsed: (parent) => Number(parent.quantity_used),
  },

  UsageEntry: {
    productId: (parent) => parent.product_id,
    quantityUsed: (parent) => Number(parent.quantity_used),
    usedAt: (parent) => parent.used_at,
  },

  Mutation: {
    createProduct: async (_, { input }) => {
      const { name, categoryId, quantity, unit, price } = input;

      const { rows } = await query(
        `
        INSERT INTO products (name, category_id, quantity, unit, price, status)
        VALUES ($1, $2, $3, $4, $5, 'In Stock')
        RETURNING *
        `,
        [name, categoryId, quantity, unit, price],
      );

      const row = rows[0];
      // Fetch category data
      const categoryResult = row.category_id
        ? await query(`SELECT id, name FROM categories WHERE id = $1`, [
            row.category_id,
          ])
        : null;

      return {
        id: row.id,
        name: row.name,
        category_id: row.category_id,
        quantity: row.quantity,
        unit: row.unit,
        price: row.price,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: categoryResult?.rows?.[0]
          ? { id: categoryResult.rows[0].id, name: categoryResult.rows[0].name }
          : null,
      };
    },

    updateProduct: async (_, { id, input }) => {
      const columnMap = {
        name: "name",
        categoryId: "category_id",
        quantity: "quantity",
        unit: "unit",
        price: "price",
        status: "status",
      };
      const fields = [];
      const values = [];
      let index = 1;

      for (const [key, value] of Object.entries(input)) {
        const column = columnMap[key];
        if (!column || value === undefined) continue;

        fields.push(`${column} = $${index}`);
        values.push(value);
        index++;
      }

      if (fields.length === 0) {
        throw new Error("At least one product field is required for update");
      }

      values.push(id);

      const { rows } = await query(
        `
        UPDATE products
        SET ${fields.join(", ")}, updated_at = NOW()
        WHERE id = $${index}
        RETURNING *
        `,
        values,
      );

      const row = rows[0];
      // Fetch category data
      const categoryResult = row.category_id
        ? await query(`SELECT id, name FROM categories WHERE id = $1`, [
            row.category_id,
          ])
        : null;

      return {
        id: row.id,
        name: row.name,
        category_id: row.category_id,
        quantity: row.quantity,
        unit: row.unit,
        price: row.price,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: categoryResult?.rows?.[0]
          ? { id: categoryResult.rows[0].id, name: categoryResult.rows[0].name }
          : null,
      };
    },

    deleteProduct: async (_, { id }) => {
      await query(`DELETE FROM products WHERE id = $1`, [id]);
      return true;
    },

    createCategory: async (_, { name, description }) => {
      const { rows } = await query(
        `INSERT INTO categories (name, description)
         VALUES ($1, $2)
         RETURNING *`,
        [name, description],
      );
      return rows[0];
    },

    recordUsage: async (_, { input }) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const updatedProduct = await client.query(
          `
          UPDATE products
          SET quantity = quantity - $1, updated_at = NOW()
          WHERE id = $2 AND quantity >= $1
          RETURNING id
          `,
          [input.quantityUsed, input.productId],
        );

        if (updatedProduct.rowCount === 0) {
          throw new Error("Product not found or usage exceeds available stock");
        }

        const { rows } = await client.query(
          `
          INSERT INTO stock_usage (product_id, quantity_used)
          VALUES ($1, $2)
          RETURNING id, product_id, quantity_used, used_at
          `,
          [input.productId, input.quantityUsed],
        );
        await client.query("COMMIT");
        return rows[0];
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  },
};
