import { query } from '@/utility/db';

export const resolvers = {
  Query: {
    products: async () => {
      const { rows } = await query(
        `SELECT * FROM products ORDER BY created_at DESC`
      );
      return rows;
    },

    product: async (_, { id }) => {
      const { rows } = await query(
        `SELECT * FROM products WHERE id = $1`,
        [id]
      );
      return rows[0];
    },
  },

  Mutation: {
    createProduct: async (_, { input }) => {
      const { name, category, quantity, unit, price } = input;

      const { rows } = await query(
        `
        INSERT INTO products (name, category, quantity, unit, price, status)
        VALUES ($1, $2, $3, $4, $5, 'In Stock')
        RETURNING *
        `,
        [name, category, quantity, unit, price]
      );

      return rows[0];
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
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${index}
        RETURNING *
        `,
        values
      );

      return rows[0];
    },

    deleteProduct: async (_, { id }) => {
      await query(`DELETE FROM products WHERE id = $1`, [id]);
      return true;
    },
  },
};


