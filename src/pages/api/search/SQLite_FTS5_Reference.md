# SQLite FTS5 — Full-Text Search Reference
> Restaurant Inventory Management Application

---

## Table of Contents
1. [What Is FTS5?](#1-what-is-fts5)
2. [Why Do We Need It?](#2-why-do-we-need-it)
3. [How FTS5 Works Internally](#3-how-fts5-works-internally)
4. [FTS5 Query Syntax](#4-fts5-query-syntax)
5. [Content Tables vs. Contentless](#5-content-tables-vs-contentless)
6. [Implementation for Your App](#6-implementation-for-your-app)
7. [Real Application Queries](#7-real-application-queries)
8. [Node.js Integration](#8-nodejs-integration-better-sqlite3)
9. [Maintenance & Performance](#9-maintenance--performance)
10. [Quick Reference Cheat Sheet](#10-quick-reference-cheat-sheet)

---

## 1. What Is FTS5?

FTS5 (Full-Text Search version 5) is a **built-in SQLite extension** that enables fast, relevance-ranked, natural-language searching across text columns. It is the successor to FTS3/FTS4 and ships with SQLite since version 3.9.0 (2015).

FTS5 works by maintaining a special **virtual table** backed by an **inverted index** — a data structure that maps every unique token (word) to the list of rows and positions where it appears. This makes full-text lookups orders of magnitude faster than a `LIKE '%search%'` scan on a regular table.

> **Key insight:** A regular `LIKE` query must read every row to check if the pattern matches — O(n) per query. FTS5's inverted index locates matching rows directly — effectively O(1) for the lookup, plus ranking overhead.

### 1.1 Inverted Index — The Core Data Structure

Think of it like the index at the back of a textbook. Instead of reading every page to find where "tomato" appears, you jump directly to the index entry and get the list of page numbers.

| Concept | Description |
|---|---|
| **Token** | A single word or sub-word unit extracted from text (e.g. `tomato`, `sauce`) |
| **Inverted Index** | Maps token → list of `(rowid, column, position)` tuples |
| **Posting list** | The list of document locations for a given token |
| **Tokenizer** | The component that splits text into tokens (`unicode61` by default) |
| **Segment** | A sorted, on-disk chunk of the inverted index (merged over time) |

### 1.2 FTS5 Is a Virtual Table

You interact with FTS5 through a **virtual table** — a SQLite concept where the storage and query engine are provided by C code rather than SQLite's native B-tree. You create it with `USING fts5` and query it like any normal table, but matching happens via the inverted index.

```sql
-- FTS5 virtual table declaration
CREATE VIRTUAL TABLE ingredients_fts USING fts5(
    name,
    description,
    category,
    content='ingredients',   -- content table
    content_rowid='id'       -- rowid mapping
);
```

---

## 2. Why Do We Need It?

### 2.1 The Problem with LIKE

The most common naive approach to text search in SQLite is `WHERE name LIKE '%chicken%'`. This has severe limitations:

- **No index usage** — A leading wildcard (`'%chicken%'`) forces a full table scan. An index on `name` is useless.
- **No ranking** — All matches are equally "relevant". You cannot sort by how well something matches.
- **No stemming** — Searching for "chicken" will not match "chickens".
- **No phrase matching** — No built-in way to search for "chicken breast" as a phrase.
- **Performance degrades** — On a table with 50,000 ingredient records, every query scans all rows.

### 2.2 FTS5 Solves All of These

| Capability | LIKE | FTS5 |
|---|---|---|
| Index-backed lookup | ✗ Full scan | ✓ Inverted index |
| Relevance ranking | ✗ No ranking | ✓ BM25 built-in |
| Phrase matching | ✗ Manual & slow | ✓ `"chicken breast"` |
| Prefix matching | Only suffix-free | ✓ `chick*` works |
| Boolean operators | ✗ None | ✓ AND, OR, NOT |
| Column filtering | ✗ Per-column LIKE | ✓ `name:chicken` |
| Snippet / highlight | ✗ Manual | ✓ Built-in functions |
| Stemming / tokenizer | ✗ None | ✓ Pluggable |

### 2.3 FTS5 vs PostgreSQL Full-Text Search

Since your stack also includes PostgreSQL, it is worth knowing when to use each. Your app uses **SQLite as an embedded read cache** (via the initContainer pattern), so FTS5 is your search engine for the data loaded there.

| Dimension | SQLite FTS5 | PostgreSQL FTS |
|---|---|---|
| Deployment | Embedded — zero config | Requires pg server |
| Setup | One `CREATE VIRTUAL TABLE` | `tsvector` + GIN index + triggers |
| Ranking | BM25 via `bm25()` function | `ts_rank()`, `ts_rank_cd()` |
| Language support | Tokenizer-based | Dictionaries, unaccent |
| Best for | App-side cache, offline, mobile | Server-side authoritative data |
| Your use case | TheMealDB + inventory cache | Source of truth queries |

---

## 3. How FTS5 Works Internally

### 3.1 Tokenization

When you insert a row, FTS5 passes the text through a **tokenizer** to split it into tokens. The default tokenizer is `unicode61` — it lowercases text and splits on Unicode whitespace and punctuation.

```
Input:   "Fresh Chicken Breast (Boneless)"
Tokens:   fresh, chicken, breast, boneless

-- The tokenizer strips punctuation and lowercases.
-- "Boneless" and "boneless" produce the same token.
```

#### Available Tokenizers

| Tokenizer | Description |
|---|---|
| `unicode61` *(default)* | Unicode-aware word splitting. Lowercases. Best general-purpose choice. |
| `ascii` | ASCII-only splitting on whitespace/punctuation. Faster but no Unicode support. |
| `porter` | Porter stemmer — reduces words to root form: `running` → `run`. Stacks on `unicode61`. |
| `trigram` | Splits into 3-character n-grams. Enables LIKE-style substring search. SQLite ≥ 3.38. |

### 3.2 The Inverted Index (Shadow Tables)

After tokenization, FTS5 updates its internal inverted index. This index is stored in several **shadow tables** auto-created alongside your virtual table:

```sql
-- Shadow tables created automatically:
ingredients_fts_data     -- the B-tree segments of the inverted index
ingredients_fts_idx      -- top-level index for quick segment lookup
ingredients_fts_content  -- mirrored content (if not using external content)
ingredients_fts_docsize  -- document token counts (needed for BM25)
ingredients_fts_config   -- configuration key-value pairs
```

> **Important:** Never modify shadow tables directly. Always `INSERT / UPDATE / DELETE` through the virtual table itself.

### 3.3 BM25 Ranking

BM25 (Best Match 25) is the industry-standard relevance ranking algorithm, also used by Elasticsearch and Lucene. FTS5 exposes it via the `bm25()` auxiliary function.

The BM25 score for a document increases when:
- The query term appears more frequently in the document (term frequency — TF)
- The query term is rare across all documents (inverse document frequency — IDF)
- The document is short relative to the average document length

> **Note on `bm25()` sign:** FTS5's `bm25()` returns **negative** numbers — more negative means more relevant. Always use `ORDER BY bm25(fts_table)` (ascending) or negate it: `ORDER BY -bm25(fts_table) DESC`.

---

## 4. FTS5 Query Syntax

### 4.1 Basic Queries

```sql
-- Simple token match (all columns)
SELECT * FROM ingredients_fts WHERE ingredients_fts MATCH 'chicken';

-- Phrase match
SELECT * FROM ingredients_fts WHERE ingredients_fts MATCH '"chicken breast"';

-- Prefix match
SELECT * FROM ingredients_fts WHERE ingredients_fts MATCH 'chick*';

-- Column-scoped search
SELECT * FROM ingredients_fts WHERE ingredients_fts MATCH 'name:chicken';

-- Boolean AND (implicit — tokens separated by space)
SELECT * FROM ingredients_fts WHERE ingredients_fts MATCH 'chicken breast';

-- Boolean OR
SELECT * FROM ingredients_fts WHERE ingredients_fts MATCH 'chicken OR beef';

-- Boolean NOT
SELECT * FROM ingredients_fts WHERE ingredients_fts MATCH 'chicken NOT frozen';
```

### 4.2 Ranked Search with BM25

```sql
-- Return top 10 most relevant ingredients matching 'chicken'
SELECT
    i.id,
    i.name,
    i.category,
    i.unit_cost,
    bm25(ingredients_fts) AS relevance_score
FROM ingredients_fts
JOIN ingredients i ON i.id = ingredients_fts.rowid
WHERE ingredients_fts MATCH 'chicken'
ORDER BY bm25(ingredients_fts)   -- ascending = most relevant first
LIMIT 10;
```

### 4.3 Snippet and Highlight Functions

```sql
-- highlight() wraps matching tokens with custom markup
SELECT highlight(ingredients_fts, 0, '<b>', '</b>') AS highlighted_name
FROM ingredients_fts
WHERE ingredients_fts MATCH 'chicken';

-- snippet() extracts a short excerpt around the match
-- Args: (table, column_index, open_tag, close_tag, ellipsis, num_tokens)
SELECT snippet(ingredients_fts, 0, '[', ']', '...', 8) AS excerpt
FROM ingredients_fts
WHERE ingredients_fts MATCH '"chicken breast"';
```

---

## 5. Content Tables vs. Contentless

### 5.1 Three FTS5 Storage Modes

| Mode | How It Works | Trade-off |
|---|---|---|
| **Standard** *(default)* | FTS5 stores a copy of content in shadow tables | Doubles storage, but fully self-contained |
| **Content Table** (`content=`) | FTS5 stores only the index; reads content from your table at query time | No data duplication, but requires your table to exist |
| **Contentless** (`content=''`) | Only the inverted index — no content stored | Smallest; can only retrieve rowid, not text |

> **Recommendation for your app:** Use **content table mode** (`content='ingredients'`). You already have the data in your SQLite tables from the TheMealDB initContainer sync. FTS5 just maintains the index — no duplication.

### 5.2 Content Table Setup

```sql
-- Your real data table
CREATE TABLE IF NOT EXISTS ingredients (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    category    TEXT,
    unit_cost   REAL,
    unit        TEXT
);

-- FTS5 virtual table pointing at it
CREATE VIRTUAL TABLE IF NOT EXISTS ingredients_fts USING fts5(
    name,
    description,
    category,
    content='ingredients',
    content_rowid='id'
);
```

### 5.3 Keeping the Index in Sync — Triggers

With content table mode, FTS5 does **not** automatically update its index when you insert/update/delete in your real table. You must use **triggers** to propagate changes.

```sql
-- AFTER INSERT: add to FTS index
CREATE TRIGGER ingredients_ai AFTER INSERT ON ingredients BEGIN
    INSERT INTO ingredients_fts(rowid, name, description, category)
    VALUES (new.id, new.name, new.description, new.category);
END;

-- AFTER DELETE: remove from FTS index
CREATE TRIGGER ingredients_ad AFTER DELETE ON ingredients BEGIN
    INSERT INTO ingredients_fts(ingredients_fts, rowid, name, description, category)
    VALUES ('delete', old.id, old.name, old.description, old.category);
END;

-- AFTER UPDATE: delete old entry, insert new
CREATE TRIGGER ingredients_au AFTER UPDATE ON ingredients BEGIN
    INSERT INTO ingredients_fts(ingredients_fts, rowid, name, description, category)
    VALUES ('delete', old.id, old.name, old.description, old.category);
    INSERT INTO ingredients_fts(rowid, name, description, category)
    VALUES (new.id, new.name, new.description, new.category);
END;
```

---

## 6. Implementation for Your App

### 6.1 What to Index

| Table | Columns to Index | Rationale |
|---|---|---|
| `ingredients` | `name, description, category` | Core search target — find items by name or type |
| `meals` / `recipes` | `name, area, category, tags` | "Show me Italian chicken dishes" |
| `suppliers` | `name, contact_info, notes` | Find supplier by name or specialty |
| `menu_items` | `name, description` | Customer-facing search if applicable |

### 6.2 Full Schema — All FTS5 Tables

```sql
-- =====================================================
-- FTS5 Setup: Restaurant Inventory Management
-- =====================================================

-- 1. INGREDIENTS FTS
CREATE VIRTUAL TABLE IF NOT EXISTS ingredients_fts USING fts5(
    name,
    description,
    category,
    content='ingredients',
    content_rowid='id',
    tokenize='unicode61'
);

-- 2. MEALS FTS (TheMealDB data)
CREATE VIRTUAL TABLE IF NOT EXISTS meals_fts USING fts5(
    name,
    area,
    category,
    tags,
    content='meals',
    content_rowid='id',
    tokenize='unicode61'
);

-- 3. SUPPLIERS FTS
CREATE VIRTUAL TABLE IF NOT EXISTS suppliers_fts USING fts5(
    name,
    notes,
    content='suppliers',
    content_rowid='id',
    tokenize='unicode61'
);
```

### 6.3 Initial Population

After creating the FTS tables, do a **one-time bulk insert** to populate the index from existing data:

```sql
-- Populate from existing data (run once after table creation)
INSERT INTO ingredients_fts(rowid, name, description, category)
    SELECT id, name, description, category FROM ingredients;

INSERT INTO meals_fts(rowid, name, area, category, tags)
    SELECT id, name, area, category, tags FROM meals;

INSERT INTO suppliers_fts(rowid, name, notes)
    SELECT id, name, notes FROM suppliers;

-- Verify index is built
SELECT COUNT(*) FROM ingredients_fts;
```

### 6.4 All Sync Triggers

```sql
-- =====================================================
-- INGREDIENTS TRIGGERS
-- =====================================================
CREATE TRIGGER IF NOT EXISTS ingredients_ai
    AFTER INSERT ON ingredients BEGIN
    INSERT INTO ingredients_fts(rowid, name, description, category)
    VALUES (new.id, new.name, new.description, new.category);
END;

CREATE TRIGGER IF NOT EXISTS ingredients_ad
    AFTER DELETE ON ingredients BEGIN
    INSERT INTO ingredients_fts(ingredients_fts, rowid, name, description, category)
    VALUES ('delete', old.id, old.name, old.description, old.category);
END;

CREATE TRIGGER IF NOT EXISTS ingredients_au
    AFTER UPDATE ON ingredients BEGIN
    INSERT INTO ingredients_fts(ingredients_fts, rowid, name, description, category)
    VALUES ('delete', old.id, old.name, old.description, old.category);
    INSERT INTO ingredients_fts(rowid, name, description, category)
    VALUES (new.id, new.name, new.description, new.category);
END;

-- =====================================================
-- MEALS TRIGGERS
-- =====================================================
CREATE TRIGGER IF NOT EXISTS meals_ai
    AFTER INSERT ON meals BEGIN
    INSERT INTO meals_fts(rowid, name, area, category, tags)
    VALUES (new.id, new.name, new.area, new.category, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS meals_ad
    AFTER DELETE ON meals BEGIN
    INSERT INTO meals_fts(meals_fts, rowid, name, area, category, tags)
    VALUES ('delete', old.id, old.name, old.area, old.category, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS meals_au
    AFTER UPDATE ON meals BEGIN
    INSERT INTO meals_fts(meals_fts, rowid, name, area, category, tags)
    VALUES ('delete', old.id, old.name, old.area, old.category, old.tags);
    INSERT INTO meals_fts(rowid, name, area, category, tags)
    VALUES (new.id, new.name, new.area, new.category, new.tags);
END;
```

---

## 7. Real Application Queries

### 7.1 Universal Inventory Search

```sql
-- Search ingredients with relevance ranking + highlight
SELECT
    i.id,
    i.name,
    i.category,
    i.unit_cost,
    i.unit,
    i.stock_quantity,
    bm25(ingredients_fts) AS score,
    highlight(ingredients_fts, 0, '<mark>', '</mark>') AS highlighted_name
FROM ingredients_fts
JOIN ingredients i ON i.id = ingredients_fts.rowid
WHERE ingredients_fts MATCH :query
ORDER BY bm25(ingredients_fts)
LIMIT :limit OFFSET :offset;
```

### 7.2 Cross-Table Search

```sql
-- Search across both ingredients and meals in one result set
SELECT 'ingredient' AS type, i.id, i.name, i.category,
       bm25(ingredients_fts) AS score
FROM ingredients_fts
JOIN ingredients i ON i.id = ingredients_fts.rowid
WHERE ingredients_fts MATCH :query

UNION ALL

SELECT 'meal' AS type, m.id, m.name, m.category,
       bm25(meals_fts) AS score
FROM meals_fts
JOIN meals m ON m.id = meals_fts.rowid
WHERE meals_fts MATCH :query

ORDER BY score
LIMIT 20;
```

### 7.3 Column-Weighted Search

```sql
-- Weight name matches (col 0) 10x more heavily than category (col 2)
-- bm25(table, w0, w1, w2) — weights per column (default 1.0 each)
SELECT
    i.id,
    i.name,
    bm25(ingredients_fts, 10.0, 1.0, 1.0) AS weighted_score
FROM ingredients_fts
JOIN ingredients i ON i.id = ingredients_fts.rowid
WHERE ingredients_fts MATCH :query
ORDER BY weighted_score
LIMIT 10;
```

### 7.4 FTS + Filtered Join (Low-Stock Search)

```sql
-- Find low-stock ingredients that also match a search term
SELECT
    i.id,
    i.name,
    i.stock_quantity,
    i.reorder_threshold,
    bm25(ingredients_fts) AS score
FROM ingredients_fts
JOIN ingredients i ON i.id = ingredients_fts.rowid
WHERE ingredients_fts MATCH :query
  AND i.stock_quantity < i.reorder_threshold
ORDER BY i.stock_quantity ASC;
```

### 7.5 Autocomplete with Prefix Matching

```sql
-- Prefix search for live autocomplete (type 'chic' → 'chicken', 'chickpeas'...)
-- Append * to the user's partial input
SELECT DISTINCT i.name
FROM ingredients_fts
JOIN ingredients i ON i.id = ingredients_fts.rowid
WHERE ingredients_fts MATCH (? || '*')   -- e.g. 'chic*'
ORDER BY bm25(ingredients_fts)
LIMIT 8;
```

---

## 8. Node.js Integration (better-sqlite3)

```javascript
// lib/search/inventory-search.js
import Database from 'better-sqlite3';
import path from 'path';

let db;

function getDb() {
    if (!db) {
        db = new Database(path.join(process.cwd(), 'data/inventory.db'), {
            readonly: true,
        });
    }
    return db;
}

/**
 * Escape user input for FTS5 MATCH queries.
 * Strips special FTS chars, preserves * for prefix search.
 */
function escapeQuery(raw) {
    const cleaned = raw.replace(/["'^()]/g, ' ').trim();
    if (!cleaned) return null;
    return cleaned;
}

/**
 * Search ingredients with BM25 ranking.
 * @param {string} query  - User search string
 * @param {object} opts   - { limit, offset, lowStockOnly }
 */
export function searchIngredients(query, opts = {}) {
    const { limit = 20, offset = 0, lowStockOnly = false } = opts;
    const escaped = escapeQuery(query);
    if (!escaped) return [];

    const db = getDb();
    const lowStockClause = lowStockOnly
        ? 'AND i.stock_quantity < i.reorder_threshold'
        : '';

    const stmt = db.prepare(`
        SELECT
            i.id,
            i.name,
            i.category,
            i.unit_cost,
            i.unit,
            i.stock_quantity,
            bm25(ingredients_fts, 10.0, 1.0, 1.0) AS score,
            highlight(ingredients_fts, 0, '<mark>', '</mark>') AS name_hl
        FROM ingredients_fts
        JOIN ingredients i ON i.id = ingredients_fts.rowid
        WHERE ingredients_fts MATCH ?
        ${lowStockClause}
        ORDER BY score
        LIMIT ? OFFSET ?
    `);

    return stmt.all(escaped, limit, offset);
}

/**
 * Autocomplete suggestions for ingredient name.
 */
export function autocompleteIngredient(partial) {
    if (!partial || partial.length < 2) return [];
    const db = getDb();
    const stmt = db.prepare(`
        SELECT DISTINCT i.name
        FROM ingredients_fts
        JOIN ingredients i ON i.id = ingredients_fts.rowid
        WHERE ingredients_fts MATCH ?
        ORDER BY bm25(ingredients_fts)
        LIMIT 8
    `);
    return stmt.all(partial.trim() + '*').map(r => r.name);
}
```

---

## 9. Maintenance & Performance

### 9.1 Rebuilding the Index

Over time, the inverted index accumulates **segment fragmentation** from many inserts and deletes. Use the `rebuild` command periodically — ideal to run in your initContainer after every TheMealDB sync:

```sql
-- Full rebuild from scratch (expensive — run offline or in initContainer)
INSERT INTO ingredients_fts(ingredients_fts) VALUES ('rebuild');
INSERT INTO meals_fts(meals_fts) VALUES ('rebuild');

-- Merge segments without full rebuild (cheaper, run more frequently)
INSERT INTO ingredients_fts(ingredients_fts) VALUES ('optimize');
```

### 9.2 Integrity Check

```sql
-- Check that FTS index matches the content table
INSERT INTO ingredients_fts(ingredients_fts) VALUES ('integrity-check');
-- Returns an error if the index is corrupt or out of sync
```

### 9.3 Performance Tips

- **Use prepared statements** — Prepare your FTS queries once and reuse them (`db.prepare()` in better-sqlite3). Parsing the MATCH expression on every call adds overhead.
- **Always use LIMIT** — FTS5 stops after scoring enough results when combined with `LIMIT`.
- **Rebuild in initContainer** — Your initContainer is the perfect place to run `'rebuild'` after loading fresh TheMealDB data, before the main app starts.
- **Column weights for precision** — Weight `name` at `10.0` vs `description/category` at `1.0` so name matches always rank highest.
- **Trigram for substring search** — If you need `LIKE '%partial%'` style (not just prefix), use `tokenize='trigram'`. Requires SQLite ≥ 3.38.

### 9.4 Trigram Tokenizer for Substring Matching

```sql
-- Trigram tokenizer allows LIKE-style substring matching
-- (requires SQLite >= 3.38.0 — check: SELECT sqlite_version())
CREATE VIRTUAL TABLE IF NOT EXISTS ingredients_fts_trgm USING fts5(
    name,
    content='ingredients',
    content_rowid='id',
    tokenize='trigram'
);

-- Now substring queries work:
SELECT * FROM ingredients_fts_trgm WHERE ingredients_fts_trgm MATCH 'hicke';
-- Matches 'chicken', 'thickened sauce', etc.
```

---

## 10. Quick Reference Cheat Sheet

### DDL

| Operation | SQL |
|---|---|
| Create FTS table | `CREATE VIRTUAL TABLE t USING fts5(col, content='src', content_rowid='id');` |
| Bulk populate | `INSERT INTO t_fts(rowid, col) SELECT id, col FROM src;` |
| Rebuild index | `INSERT INTO t_fts(t_fts) VALUES ('rebuild');` |
| Optimize index | `INSERT INTO t_fts(t_fts) VALUES ('optimize');` |
| Integrity check | `INSERT INTO t_fts(t_fts) VALUES ('integrity-check');` |
| Delete entry | `INSERT INTO t_fts(t_fts, rowid, col) VALUES ('delete', id, val);` |
| Drop FTS table | `DROP TABLE t_fts;` *(also drops shadow tables)* |

### Query Syntax

| Pattern | Example |
|---|---|
| Simple token | `MATCH 'chicken'` |
| Phrase | `MATCH '"chicken breast"'` |
| Prefix | `MATCH 'chick*'` |
| Boolean AND (implicit) | `MATCH 'chicken sauce'` |
| Boolean OR | `MATCH 'chicken OR beef'` |
| Boolean NOT | `MATCH 'chicken NOT frozen'` |
| Column filter | `MATCH 'name:chicken'` |
| BM25 ranked | `ORDER BY bm25(t_fts)` |
| Weighted BM25 | `bm25(t_fts, 10.0, 1.0)` — 10x weight on col 0 |
| Highlight | `highlight(t_fts, 0, '<b>', '</b>')` |
| Snippet | `snippet(t_fts, 0, '[', ']', '...', 8)` |

### Tokenizer Summary

| Tokenizer | Best For | Declare As |
|---|---|---|
| `unicode61` *(default)* | General word-level search | `tokenize='unicode61'` |
| `porter` | Stemmed search (run/running/runs) | `tokenize='porter unicode61'` |
| `ascii` | Pure ASCII, faster | `tokenize='ascii'` |
| `trigram` | Substring / LIKE-style search | `tokenize='trigram'` |

---

> **Recommended setup for your app:** Use `tokenize='unicode61'` for `ingredients_fts` and `meals_fts`. Run `INSERT INTO ... VALUES ('rebuild')` in your initContainer after every TheMealDB sync. Use `bm25()` with column weights (`name = 10.0`) for best relevance. Add the three triggers per table to keep the index live.
