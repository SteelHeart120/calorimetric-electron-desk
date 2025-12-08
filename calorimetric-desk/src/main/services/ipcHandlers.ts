import { ipcMain } from 'electron';
import { 
  getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, Recipe
} from './recetasService';
import { 
  getAllPacientes, getPacienteById, createPaciente, updatePaciente, deletePaciente
} from './pacientesService';

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

  // Pacientes handlers
  ipcMain.handle('pacientes:getAll', async () => {
    try {
      return getAllPacientes();
    } catch (error) {
      console.error('Error getting pacientes:', error);
      throw error;
    }
  });

  ipcMain.handle('pacientes:getById', async (_, id: number) => {
    try {
      return getPacienteById(id);
    } catch (error) {
      console.error('Error getting paciente:', error);
      throw error;
    }
  });

  ipcMain.handle('pacientes:create', async (_, nombre: string) => {
    try {
      return createPaciente(nombre);
    } catch (error) {
      console.error('Error creating paciente:', error);
      throw error;
    }
  });

  ipcMain.handle('pacientes:update', async (_, id: number, nombre: string) => {
    try {
      return updatePaciente(id, nombre);
    } catch (error) {
      console.error('Error updating paciente:', error);
      throw error;
    }
  });

  ipcMain.handle('pacientes:delete', async (_, id: number) => {
    try {
      return deletePaciente(id);
    } catch (error) {
      console.error('Error deleting paciente:', error);
      throw error;
    }
  });
}
