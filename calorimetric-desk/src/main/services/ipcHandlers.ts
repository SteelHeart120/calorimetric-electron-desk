import { ipcMain, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { 
  getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, Recipe
} from './recetasService';
import { 
  getAllPacientes, getPacienteById, createPaciente, updatePaciente, deletePaciente
} from './pacientesService';
import { 
  getAllIngredientes, getIngredienteById, createIngrediente, updateIngrediente, deleteIngrediente,
  getAllTiposIngrediente
} from './ingredientesService';
import {
  createMenu,
  deleteMenuByPaciente,
  getAllMenuTiempos,
  getMenuById,
  listMenusByPaciente,
  saveMenuItems,
  CreateMenuData,
  SaveMenuItemsData
} from './menuService';
import { exportMenuToWord } from './exportMenuService';

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

  ipcMain.handle('pacientes:create', async (_, nombre: string, ingredientesEvitarIds?: number[]) => {
    try {
      return createPaciente(nombre, ingredientesEvitarIds);
    } catch (error) {
      console.error('Error creating paciente:', error);
      throw error;
    }
  });

  ipcMain.handle('pacientes:update', async (_, id: number, nombre: string, ingredientesEvitarIds?: number[]) => {
    try {
      return updatePaciente(id, nombre, ingredientesEvitarIds);
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

  // Ingredientes handlers
  ipcMain.handle('ingredientes:getAll', async () => {
    try {
      return getAllIngredientes();
    } catch (error) {
      console.error('Error getting ingredientes:', error);
      throw error;
    }
  });

  ipcMain.handle('ingredientes:getById', async (_, id: number) => {
    try {
      return getIngredienteById(id);
    } catch (error) {
      console.error('Error getting ingrediente:', error);
      throw error;
    }
  });

  ipcMain.handle('ingredientes:create', async (_, nombre: string, tipo_id?: number) => {
    try {
      return createIngrediente(nombre, tipo_id);
    } catch (error) {
      console.error('Error creating ingrediente:', error);
      throw error;
    }
  });

  ipcMain.handle('ingredientes:update', async (_, id: number, nombre: string, tipo_id?: number) => {
    try {
      return updateIngrediente(id, nombre, tipo_id);
    } catch (error) {
      console.error('Error updating ingrediente:', error);
      throw error;
    }
  });

  ipcMain.handle('ingredientes:delete', async (_, id: number) => {
    try {
      return deleteIngrediente(id);
    } catch (error) {
      console.error('Error deleting ingrediente:', error);
      throw error;
    }
  });

  ipcMain.handle('tipos-ingrediente:getAll', async () => {
    try {
      return getAllTiposIngrediente();
    } catch (error) {
      console.error('Error getting tipos ingrediente:', error);
      throw error;
    }
  });

  ipcMain.handle('save-recipe-image', async (_, buffer: ArrayBuffer, fileName: string) => {
    try {
      const userDataPath = app.getPath('userData');
      const recetasDir = path.join(userDataPath, 'assets', 'images', 'recetas');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(recetasDir)) {
        fs.mkdirSync(recetasDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const ext = path.extname(fileName);
      const uniqueFileName = `${timestamp}${ext}`;
      const filePath = path.join(recetasDir, uniqueFileName);
      
      // Write file
      fs.writeFileSync(filePath, Buffer.from(buffer));
      
      // Return the relative path to store in database
      return `assets/images/recetas/${uniqueFileName}`;
    } catch (error) {
      console.error('Error saving recipe image:', error);
      throw error;
    }
  });

  // Menu handlers
  ipcMain.handle('menu:create', async (_, data: CreateMenuData) => {
    try {
      return createMenu(data);
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  });

  ipcMain.handle('menu:listByPaciente', async (_, idPaciente: number) => {
    try {
      return listMenusByPaciente(idPaciente);
    } catch (error) {
      console.error('Error listing menus:', error);
      throw error;
    }
  });

  ipcMain.handle('menu:getById', async (_, menuId: number) => {
    try {
      return getMenuById(menuId);
    } catch (error) {
      console.error('Error getting menu by id:', error);
      throw error;
    }
  });

  ipcMain.handle('menu:saveItems', async (_, data: SaveMenuItemsData) => {
    try {
      return saveMenuItems(data);
    } catch (error) {
      console.error('Error saving menu items:', error);
      throw error;
    }
  });

  ipcMain.handle('menu-tiempos:getAll', async () => {
    try {
      return getAllMenuTiempos();
    } catch (error) {
      console.error('Error getting MenuTiempos:', error);
      throw error;
    }
  });

  ipcMain.handle('menu:delete', async (_, idPaciente: number) => {
    try {
      return deleteMenuByPaciente(idPaciente);
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error;
    }
  });

  ipcMain.handle('menu:exportToWord', async (_, menuTables: any[], menuNombre: string) => {
    try {
      return await exportMenuToWord(menuTables, menuNombre);
    } catch (error) {
      console.error('Error exporting menu to Word:', error);
      throw error;
    }
  });
}
