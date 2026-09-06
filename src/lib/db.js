// src/lib/db.js
// SQLite singleton — reuses the same connection across hot reloads in dev
// and across requests in production (single Node.js process).

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'inventory.db');

// In development, Next.js hot-reloads modules. We stash the db instance
// on globalThis so it survives reloads and we don't open a new connection
// on every file change.
const globalKey = '__better_sqlite3_db__';

function createConnection() {
  const db = new Database(DB_PATH, {
    // API route handlers only read — writes go through your data sync scripts
    readonly: false,
    fileMustExist: true,
  });

  // Performance pragmas — safe for a local SQLite used as a read cache
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('cache_size = -8000'); // 8 MB page cache

  return db;
}

function getDb() {
  if (process.env.NODE_ENV === 'development') {
    if (!globalThis[globalKey]) {
      globalThis[globalKey] = createConnection();
    }
    return globalThis[globalKey];
  }

  // Production: module-level singleton (module is cached for process lifetime)
  if (!getDb._instance) {
    getDb._instance = createConnection();
  }
  return getDb._instance;
}

export default getDb;