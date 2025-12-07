import { ipcMain } from 'electron';
import { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, Recipe } from './database';

export function registerIpcHandlers() {
  ipcMain.handle('recipes:getAll', async () => {
    try {
      return getAllRecipes();
    } catch (error) {
      console.error('Error getting recipes:', error);
      throw error;
    }
  });

  ipcMain.handle('recipes:getById', async (_, id: number) => {
    try {
      return getRecipeById(id);
    } catch (error) {
      console.error('Error getting recipe:', error);
      throw error;
    }
  });

  ipcMain.handle('recipes:create', async (_, recipe: Omit<Recipe, 'id'>) => {
    try {
      return createRecipe(recipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  });

  ipcMain.handle('recipes:update', async (_, id: number, recipe: Partial<Recipe>) => {
    try {
      return updateRecipe(id, recipe);
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  });

  ipcMain.handle('recipes:delete', async (_, id: number) => {
    try {
      return deleteRecipe(id);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  });
}
