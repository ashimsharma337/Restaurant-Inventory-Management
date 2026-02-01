import { query } from "../../utility/db";

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
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        category_id: row.category_id,
        quantity: row.quantity,
        unit: row.unit,
        price: row.price,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: row.category_id ? { id: row.category_id, name: row.category_name } : null,
      }));
    } catch (err) {
      console.error("PRODUCTS RESOLVER ERROR:", err);
      throw err;
      }
    },

    product: async (_, { id }) => {
      const { rows } = await query(`
        SELECT p.*, c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [id]);
      
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
        category: row.category_id ? { id: row.category_id, name: row.category_name } : null,
      };
    },

    categories: async () => {
      const { rows } = await query("SELECT * FROM categories ORDER BY name");
      return rows;
    },
  },

  Product: {
    createdAt: (parent) => parent.created_at,
    updatedAt: (parent) => parent.updated_at,
    stockValue: (parent) => parent.price * parent.quantity,
    categoryId: (parent) => parent.category_id,

    category: (parent) => parent.category
  },

  Category: {
    createdAt: (parent) => parent.created_at,
    updatedAt: (parent) => parent.updated_at,
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
        [name, categoryId, quantity, unit, price]
      );

      const row = rows[0];
      // Fetch category data
      const categoryResult = row.category_id ? await query(
        `SELECT id, name FROM categories WHERE id = $1`,
        [row.category_id]
      ) : null;

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
        category: categoryResult?.rows?.[0] ? { id: categoryResult.rows[0].id, name: categoryResult.rows[0].name } : null,
      };
    },

    updateProduct: async (_, { id, input }) => {
      const fields = [];
      const values = [];
      let index = 1;

      for (const key in input) {
        fields.push(`${key} = $${index}`);
        values.push(input[key]);
        index++;
      }

      values.push(id);

      const { rows } = await query(
        `
        UPDATE products
        SET ${fields.join(", ")}, updated_at = NOW()
        WHERE id = $${index}
        RETURNING *
        `,
        values
      );

      const row = rows[0];
      // Fetch category data
      const categoryResult = row.category_id ? await query(
        `SELECT id, name FROM categories WHERE id = $1`,
        [row.category_id]
      ) : null;

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
        category: categoryResult?.rows?.[0] ? { id: categoryResult.rows[0].id, name: categoryResult.rows[0].name } : null,
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
        [name, description]
      );
      return rows[0];
    },
  },
};
