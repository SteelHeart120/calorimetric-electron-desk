import { getDatabase } from './database';

export interface RecipeIngredient {
  nombre: string;
  tipo?: string;
  color?: string;
}

export interface Recipe {
  id: number;
  nombre: string;
  tipo: string;
  tiempo_preparacion: string;
  calorias: number;
  imagen: string;
  link?: string;
  ingredientes: RecipeIngredient[];
}

export function getAllRecipes(): Recipe[] {
  const database = getDatabase();
  const recipes = database.prepare(`
    SELECT r.id, r.nombre, t.Nombre as tipo, r.tiempo_preparacion, r.calorias, r.imagen, r.link
    FROM Recetas r
    JOIN Tiempos t ON r.TiempoId = t.id
  `).all() as any[];

  return recipes.map(recipe => ({ ...recipe, ingredientes: getRecipeIngredients(recipe.id) }));
}

export function getRecipeById(id: number): Recipe | null {
  const database = getDatabase();
  const recipe = database.prepare(`
    SELECT r.id, r.nombre, t.Nombre as tipo, r.tiempo_preparacion, r.calorias, r.imagen, r.link
    FROM Recetas r
    JOIN Tiempos t ON r.TiempoId = t.id
    WHERE r.id = ?
  `).get(id) as any;

  if (!recipe) return null;
  return { ...recipe, ingredientes: getRecipeIngredients(recipe.id) };
}

function getRecipeIngredients(recipeId: number): RecipeIngredient[] {
  const database = getDatabase();
  const ingredients = database.prepare(`
    SELECT i.nombre, ti.nombre as tipo, ti.color
    FROM RecetaIngredientes ri
    JOIN Ingredientes i ON ri.IngredienteId = i.id
    LEFT JOIN TipoIngrediente ti ON i.tipo_id = ti.id
    WHERE ri.RecetaId = ?
    ORDER BY ri.id ASC
  `).all(recipeId) as any[];
  return ingredients;
}

export function createRecipe(recipe: Omit<Recipe, 'id'>): number {
  const database = getDatabase();
  
  let tiempoId = database.prepare('SELECT id FROM Tiempos WHERE Nombre = ?').get(recipe.tipo) as any;
  if (!tiempoId) {
    const result = database.prepare('INSERT INTO Tiempos (Nombre) VALUES (?)').run(recipe.tipo);
    tiempoId = { id: result.lastInsertRowid };
  }

  const result = database.prepare(`
    INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen, link)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(recipe.nombre, tiempoId.id, recipe.tiempo_preparacion, recipe.calorias, recipe.imagen, recipe.link || null);

  const recipeId = Number(result.lastInsertRowid);

  for (const ingredient of recipe.ingredientes) {
    const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.nombre;
    let ingredientRecord = database.prepare('SELECT id FROM Ingredientes WHERE nombre = ?').get(ingredientName) as any;
    if (!ingredientRecord) {
      const ingResult = database.prepare('INSERT INTO Ingredientes (nombre) VALUES (?)').run(ingredientName);
      ingredientRecord = { id: ingResult.lastInsertRowid };
    }
    database.prepare('INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (?, ?)').run(recipeId, ingredientRecord.id);
  }

  return recipeId;
}

export function updateRecipe(id: number, recipe: Partial<Recipe>): boolean {
  const database = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (recipe.nombre !== undefined) { updates.push('nombre = ?'); values.push(recipe.nombre); }
  if (recipe.tiempo_preparacion !== undefined) { updates.push('tiempo_preparacion = ?'); values.push(recipe.tiempo_preparacion); }
  if (recipe.calorias !== undefined) { updates.push('calorias = ?'); values.push(recipe.calorias); }
  if (recipe.imagen !== undefined) { updates.push('imagen = ?'); values.push(recipe.imagen); }
  if (recipe.link !== undefined) { updates.push('link = ?'); values.push(recipe.link); }

  if (recipe.tipo !== undefined) {
    let tiempoId = database.prepare('SELECT id FROM Tiempos WHERE Nombre = ?').get(recipe.tipo) as any;
    if (!tiempoId) {
      const result = database.prepare('INSERT INTO Tiempos (Nombre) VALUES (?)').run(recipe.tipo);
      tiempoId = { id: result.lastInsertRowid };
    }
    updates.push('TiempoId = ?');
    values.push(tiempoId.id);
  }

  if (updates.length > 0) {
    values.push(id);
    database.prepare(`UPDATE Recetas SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  if (recipe.ingredientes) {
    database.prepare('DELETE FROM RecetaIngredientes WHERE RecetaId = ?').run(id);
    for (const ingredient of recipe.ingredientes) {
      const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.nombre;
      let ingredientRecord = database.prepare('SELECT id FROM Ingredientes WHERE nombre = ?').get(ingredientName) as any;
      if (!ingredientRecord) {
        const ingResult = database.prepare('INSERT INTO Ingredientes (nombre) VALUES (?)').run(ingredientName);
        ingredientRecord = { id: ingResult.lastInsertRowid };
      }
      database.prepare('INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (?, ?)').run(id, ingredientRecord.id);
    }
  }

  return true;
}

export function deleteRecipe(id: number): boolean {
  const database = getDatabase();
  const result = database.prepare('DELETE FROM Recetas WHERE id = ?').run(id);
  return result.changes > 0;
}
