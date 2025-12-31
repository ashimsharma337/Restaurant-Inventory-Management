import pool from './db';

export async function testDbConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected at:', res.rows[0].now);
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
  }
}
