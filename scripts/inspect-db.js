// scripts/inspect-db.js
// Run this first to see your exact table columns:
//   node scripts/inspect-db.js

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'data', 'inventory.db'), {
  readonly: true,
  fileMustExist: true,
});

const tables = ['categories', 'ingredients', 'meals'];

tables.forEach((table) => {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all();
    console.log(`\n── ${table} ──────────────────────`);
    info.forEach((col) => {
      console.log(`  ${col.cid}  ${col.name.padEnd(20)} ${col.type}`);
    });

    const count = db.prepare(`SELECT COUNT(*) as n FROM ${table}`).get();
    console.log(`  → ${count.n} rows`);

    // Show one sample row
    const sample = db.prepare(`SELECT * FROM ${table} LIMIT 1`).get();
    console.log(`  → sample:`, sample);
  } catch (err) {
    console.log(`  ✗ ${table}: ${err.message}`);
  }
});

db.close();