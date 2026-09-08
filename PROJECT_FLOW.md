# Restaurant Inventory Management – Project Flow and Architecture

This document explains the current state of the project, how the app flows from the browser to the database, which components and libraries are used, and what still needs to be implemented for a more complete production-ready system.

---

## 1. Project overview

This app is a restaurant inventory management system built with Next.js, React, GraphQL, Material UI, and SQLite/PostgreSQL integration. It combines:

- a frontend dashboard for managing product inventory
- a GraphQL API for CRUD operations on inventory data
- a local SQLite search cache for ingredient/meal/category lookup
- seed scripts that pull data from TheMealDB
- Docker and Kubernetes deployment files for environment setup

The project is clearly in an active development stage, with the main structure already in place but with some pieces still incomplete or experimental.

---

## 2. Tech stack

### Frontend
- Next.js 16 (Pages Router)
- React 19
- Material UI (MUI)
- MUI X Data Grid
- Emotion for styling support
- Sass + Tailwind CSS for styling

### Backend / API
- Apollo Server
- Apollo Client
- GraphQL
- Node.js server endpoints inside Next.js API routes

### Data layer
- PostgreSQL for structured app data
- SQLite for local cached search/indexing data
- better-sqlite3 for SQLite access
- pg for PostgreSQL access

### External data source
- TheMealDB API

### Dev and deployment tools
- Docker Compose
- Kubernetes YAML manifests
- ESLint

---

## 3. High-level app flow

```mermaid
flowchart TD
    A[User opens browser] --> B[Next.js frontend]
    B --> C[Landing page]
    B --> D[Dashboard page]

    D --> E[Inventory dashboard UI]
    E --> F[GraphQL client queries]
    F --> G[GraphQL API /api/graphql]
    G --> H[PostgreSQL inventory tables]

    D --> I[Search input / autocomplete]
    I --> J[/api/search]
    J --> K[SQLite FTS5 database]

    L[TheMealDB API] --> M[Seed / refresh scripts]
    M --> K
    M --> H

    N[Docker / Kubernetes] --> B
    N --> H
    N --> K
```

### End-to-end flow in plain English

1. The browser loads the Next.js app.
2. The landing page shows marketing/home content.
3. The dashboard loads inventory data from GraphQL.
4. The GraphQL API reads from PostgreSQL tables such as products and categories.
5. The grid table displays inventory rows and supports edit/delete actions.
6. The search box uses a separate API route and queries the SQLite FTS5 database.
7. The SQLite database is populated by seed scripts from TheMealDB.
8. The project can optionally sync that cached dataset to PostgreSQL for container and deployment flows.

---

## 4. Main application pages and routes

### Public landing page
- Path: `/`
- File: `src/pages/index.js`
- Purpose: landing or home marketing page
- Uses:
  - `Layout`
  - `HeroSection`
  - `Features`

### Dashboard home
- Path: `/dashboard`
- File: `src/pages/dashboard/index.js`
- Purpose: overview dashboard entry page

### Product dashboard page
- Path: `/dashboard/products`
- File: `src/pages/dashboard/products.js`
- Purpose: inventory table screen for product management

### GraphQL endpoint
- Path: `/api/graphql`
- File: `src/pages/api/graphql.js`
- Purpose: exposes GraphQL schema and resolvers

### Health check
- Path: `/api/health`
- File: `src/pages/api/health.js`
- Purpose: quick status endpoint

### Search API
- Path: `/api/search`
- File: `src/pages/api/search.js`
- Purpose: autocomplete and full-text search against SQLite FTS5 data

---

## 5. Core frontend components

### Layout and landing UI
These components define the public-facing shell:

- `src/components/layout/Layout.js`
  - wraps all pages
  - renders navbar, page content, and footer

- `src/components/layout/Navbar.js`
  - top navigation bar

- `src/components/layout/Footer.js`
  - footer for landing pages

- `src/components/landing/HeroSection.js`
  - main intro section

- `src/components/landing/Features.js`
  - marketing/feature blocks

### Dashboard shell
- `src/components/dashboard/InventoryDashboard.js`
  - main dashboard layout
  - includes sidebar, header, table, and floating action button

- `src/components/sidebar/Sidebar.js`
  - left navigation panel

- `src/components/dashboard/Header.js`
  - top bar with title and search input

- `src/components/dashboard/FAB.js`
  - floating action button for quick actions

### Search and filters
- `src/components/dashboard/SearchInput.js`
  - searchable input with debouncing and suggestion dropdown

- `src/hooks/useInventoryFilters.js`
  - manages filters using URL query parameters
  - keeps search state bookmarkable

### Product table and forms
- `src/components/dashboard/tables/ProductsTable.js`
  - main table displaying products using MUI DataGrid
  - supports edit and delete actions

- `src/components/dashboard/forms/ProductForm.js`
  - reusable form used to create or submit product data

- `src/components/dashboard/modals/AddProductModal.js`
  - modal for adding a new product

- `src/components/dashboard/modals/EditProductModal.js`
  - modal for editing an existing product

---

## 6. Data and API flow

### GraphQL schema
File: `src/graphql/server/schema.js`

The schema defines the application model:

- `Product`
  - id
  - name
  - categoryId
  - category
  - quantity
  - unit
  - price
  - status
  - stockValue
  - createdAt
  - updatedAt

- `Category`
  - id
  - name
  - description
  - createdAt
  - updatedAt

Queries:
- `products`
- `product(id)`
- `categories`

Mutations:
- `createProduct`
- `updateProduct`
- `deleteProduct`
- `createCategory`

### GraphQL resolvers
File: `src/graphql/server/resolver.js`

These resolvers connect GraphQL operations to PostgreSQL queries using a shared DB helper.

Flow:
1. GraphQL request arrives at `/api/graphql`
2. Resolver executes SQL against PostgreSQL
3. Rows are transformed into GraphQL-friendly objects
4. Response is sent back to the frontend React app

### Client-side GraphQL usage
File: `src/graphql/client/queries.js`

This file contains GraphQL documents for:
- get all products
- create product
- update product
- delete product
- get categories

The frontend uses Apollo Client to fetch and mutate data.

---

## 7. Inventory hooks and state management

### `useInventory`
File: `src/hooks/useInventory.js`

Purpose:
- reads product data using `useQuery`
- exposes `products`, `loading`, `error`, `refetch`

This is a lean hook for loading data into dashboard components.

### `useInventoryFilters`
File: `src/hooks/useInventoryFilters.js`

Purpose:
- keeps search and filter state inside the URL
- allows filters to be shareable and browser-friendly
- supports query/category/status/zone/page params

This is a good pattern for dashboards, but it looks like a partial implementation that may still need full integration into the product table logic.

---

## 8. Search system flow

The search system is one of the more important features in this project.

### Files involved
- `src/pages/api/search.js`
- `src/lib/db.js`
- `src/lib/searchUtils.js`
- `scripts/setup-fts.js`
- `scripts/seed-local.js`

### Search architecture
- SQLite is used as a local read-optimized cache.
- SQLite FTS5 is used for full-text indexing.
- Search results are generated from ingredient, meal, and category tables.
- Query strings are sanitized and transformed into valid FTS5 MATCH expressions.
- Results are sorted by BM25 relevance score.

### Request flow
1. User types in `SearchInput`.
2. Debounce logic waits before making request.
3. Frontend calls `/api/search?q=...&mode=autocomplete`.
4. API uses `better-sqlite3` connection.
5. `searchUtils` builds an FTS5 query.
6. SQLite runs the search and returns ranked results.
7. Data is returned as JSON with `name`, `subtitle`, `type`, and score information.

### Search result types
- ingredient
- meal
- category

---

## 9. Database architecture

### PostgreSQL side
The project has SQL schema files in `database/schema/`.

Main schema file:
- `database/schema/create_table.sql`

This includes:
- `mealdb.categories`
- `mealdb.meals`
- `mealdb.ingredients`

This is connected to the TheMealDB cache concept, not necessarily the app-specific inventory table yet.

### Inventory data model
The GraphQL schema expects inventory records like:
- product name
- category id
- quantity
- unit
- price
- status

But the repository still shows a mix between a generic kitchen inventory app and a meal/ingredient cache model. That means the project is still in transition between:

- product-based restaurant inventory tracking
- meal ingredient metadata search and sync

### SQLite cache
The local SQLite database is stored in `data/inventory.db` and is expected to exist before the app runs.

This database is meant to support fast search and cached reading, especially for ingredients and meals.

---

## 10. Seed and refresh scripts

The project includes scripts in the `scripts/` directory that pull data from TheMealDB and prepare cache resources.

### Important scripts
- `scripts/seed-local.js`
  - fetches categories, meals, ingredients
  - populates SQLite database

- `scripts/setup-fts.js`
  - creates FTS5 virtual tables and indexes

- `scripts/init-cache.js`
  - initializes SQLite + PostgreSQL cache structure

- `scripts/refresh-cache.js`
  - refreshes cached data periodically

- `scripts/inspect-db.js`
  - helps inspect SQLite contents for debugging

### Why this matters
This project is using TheMealDB as a source of menu/ingredient reference data, which is useful for a restaurant app but not a fully complete inventory system by itself. The data model and product inventory logic should eventually be aligned so the app stores real restaurant stock records instead of only cached recipe metadata.

---

## 11. Deployment setup

### Docker Compose
Files:
- `docker-compose.yml`
- `Dockerfile`

This project has containers for:
- app service
- PostgreSQL database
- pgAdmin

This supports local development and team testing with a more realistic environment.

### Kubernetes
Files in `k8s/` include:
- namespace
- config map
- app deployment
- PostgreSQL deployment
- service definitions
- persistent volumes
- HPA config
- scheduled refresh job

This means the app was designed with scalability and deployment automation in mind, even though the main app is still under development.

---

## 12. What is already implemented

The project already contains a strong foundation for a product inventory app:

- landing page and app shell
- dashboard UI with sidebar and header
- inventory table with product rows
- add/edit/delete modal flows
- Apollo GraphQL setup
- PostgreSQL-backed CRUD resolvers
- search engine with SQLite + FTS5
- Docker and Kubernetes setup
- seed script and data refresh flow

---

## 13. What still needs to be implemented or improved

This is the most important part to understand before continuing development.

### 1. Product data model alignment
The code combines a general inventory model with meal/ingredient metadata. These two ideas need to be clearly separated or integrated thoughtfully.

Needed:
- one final inventory schema for products, categories, suppliers, stock movement, reorder alarms
- clean mapping between app entities and cached meal data

### 2. Missing production validation
- no real automated test suite yet
- no strong end-to-end validation of inventory workflows
- no user authentication/authorization layer yet

### 3. Better forms and validation
- product form is present but still basic
- status and category updates may not be fully consistent across the app
- validation for negative numbers, empty categories, and duplicate inventory items is not yet robust

### 4. Search integration completion
Search works at the API layer, but the dashboard flow may still need deeper UI integration and more refined filter behavior.

Needed:
- product filter by category
- stock status filters
- inventory search tuning
- stronger UI feedback for empty states and errors

### 5. Data synchronization improvement
The project has a concept of syncing cache data to PostgreSQL, but the inventory app and mealdb cache may still need a clearer synchronization policy.

Needed:
- explicit source-of-truth decision
- data freshness strategy
- conflict handling for updates

### 6. Security and environment hardening
- environment variables should be reviewed
- production secrets must be separated from dev values
- database access and deployment configs need final review

### 7. Deployment readiness
Kubernetes and Docker files are present, but they should be checked against the actual production deployment target before use in a real environment.

---

## 14. Recommended implementation roadmap

### Phase 1: stabilize the core app
- define final inventory schema
- confirm which DB is source of truth
- validate product CRUD flow end-to-end

### Phase 2: complete UI/UX
- connect filters and search to real product data
- improve product table actions
- add stock alerts, status badges, and reports

### Phase 3: complete backend quality
- add validation
- add transaction handling
- add error logging and monitoring
- secure APIs

### Phase 4: production readiness
- add tests
- implement auth and roles
- harden deployment environment
- verify Docker/Kubernetes flows with real data

---

## 15. Summary

This project is a promising restaurant inventory management app with a strong architectural base:

- Next.js frontend
- GraphQL API layer
- PostgreSQL-backed inventory logic
- SQLite FTS5 search engine
- TheMealDB data seeding and cache refresh system
- Docker and Kubernetes deployment support

The app is not finished yet, but the foundational pieces are already there. The biggest next step is to align the inventory model, validate the end-to-end workflow, and complete the missing product-level features and production readiness work.

---

## 16. Quick start assumptions

For local development, the app expects:

- Node.js >= 20.9
- npm install
- SQLite database present in `data/inventory.db`
- seed and index setup completed before app use

Typical setup flow:

```bash
npm install
node scripts/seed-local.js
node scripts/setup-fts.js
npm run dev
```

This project is a good example of a system that already contains many building blocks of a real application, but still needs consolidation and final product hardening.
