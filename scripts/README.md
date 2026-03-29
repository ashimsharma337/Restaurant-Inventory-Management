# TheMealDB free endpoints:
```text
GET https://www.themealdb.com/api/json/v1/1/categories.php
  → returns meal categories (Beef, Chicken, Seafood, Vegetarian...)

GET https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood
  → returns all meals under a category

GET https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772
  → returns full meal detail including up to 20 ingredients
```

# What we're storing (maps naturally to a restaurant inventory app):
```text
categories  → your menu sections  (Seafood, Chicken, Dessert...)
meals       → your menu items     (name, category, instructions, thumbnail)
ingredients → your inventory      (extracted from meal details)
```

# Flow: 
```text 
init-cache.js
  1. fetch all categories from TheMealDB
  2. for each category → fetch all meals
  3. for each meal → fetch full detail + extract ingredients
  4. write everything into SQLite (3 tables)
  5. upsert all 3 tables into Postgres
  6. exit

refresh-cache.js  (called by sidecar every 2 min)
  → same fetch → same upsert (idempotent)
  → single run, exits when done
```