import { useState, useEffect } from 'react';
import type { Recipe } from '../types/electron';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.electronAPI?.recipes.getAll();
      setRecipes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const createRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    try {
      const id = await window.electronAPI?.recipes.create(recipe);
      await fetchRecipes();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
      throw err;
    }
  };

  const updateRecipe = async (id: number, recipe: Partial<Recipe>) => {
    try {
      await window.electronAPI?.recipes.update(id, recipe);
      await fetchRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe');
      throw err;
    }
  };

  const deleteRecipe = async (id: number) => {
    try {
      await window.electronAPI?.recipes.delete(id);
      await fetchRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
      throw err;
    }
  };

  return {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    refresh: fetchRecipes,
  };
}
