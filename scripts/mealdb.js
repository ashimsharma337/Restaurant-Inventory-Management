const BASE = 'https://www.themealdb.com/api/json/v1/1';

// Fetch all categories
async function fetchCategories() {
  const res  = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories.map((c) => ({
    id:          c.idCategory,
    name:        c.strCategory,
    description: c.strCategoryDescription,
    thumbnail:   c.strCategoryThumb,
  }));
}

// Fetch all meals under a category (summary only — no ingredients yet)
async function fetchMealsByCategory(category) {
  const res  = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  const data = await res.json();
  if (!data.meals) return [];
  return data.meals; // [{ idMeal, strMeal, strMealThumb }]
}

// Fetch full meal detail + extract ingredients
async function fetchMealDetail(mealId) {
  const res  = await fetch(`${BASE}/lookup.php?i=${mealId}`);
  const data = await res.json();
  if (!data.meals || !data.meals[0]) return null;

  const m = data.meals[0];

  // TheMealDB stores ingredients as strIngredient1..20 + strMeasure1..20
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name    = m[`strIngredient${i}`];
    const measure = m[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: (measure || '').trim() });
    }
  }

  return {
    meal: {
      id:           m.idMeal,
      name:         m.strMeal,
      category:     m.strCategory,
      area:         m.strArea,
      instructions: m.strInstructions,
      thumbnail:    m.strMealThumb,
    },
    ingredients,
  };
}

module.exports = { fetchCategories, fetchMealsByCategory, fetchMealDetail };