/**
 * @file src/preload/preload.ts
 * @description Entry point for the Preload script.
 * This script runs in the renderer process before the web page is loaded.
 * It has access to Node.js APIs and can expose them to the renderer via contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';

export interface Recipe {
  id: number;
  nombre: string;
  tipo: string;
  tiempo_preparacion: string;
  calorias: number;
  imagen: string;
  link?: string;
  ingredientes: string[];
}

export interface Paciente {
  id: number;
  nombre: string;
  created_at: string;
}

export interface Ingrediente {
  id: number;
  nombre: string;
  tipo_id?: number;
  tipo?: string;
  color?: string;
}

export interface TipoIngrediente {
  id: number;
  nombre: string;
  color: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  onSaveMenu: (callback: () => void) => {
    ipcRenderer.on('save-menu', callback);
  },
  onExportMenu: (callback: () => void) => {
    ipcRenderer.on('export-menu', callback);
  },
  onShowAddPatient: (callback: () => void) => {
    ipcRenderer.on('show-add-patient', callback);
  },
  onShowAddRecipe: (callback: () => void) => {
    ipcRenderer.on('show-add-recipe', callback);
  },
  onShowAddIngrediente: (callback: () => void) => {
    ipcRenderer.on('show-add-ingrediente', callback);
  },
  onShowIngredientesList: (callback: () => void) => {
    ipcRenderer.on('show-ingredientes-list', callback);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  recipes: {
    getAll: () => ipcRenderer.invoke('recipes:getAll'),
    getById: (id: number) => ipcRenderer.invoke('recipes:getById', id),
    create: (recipe: Omit<Recipe, 'id'>) => ipcRenderer.invoke('recipes:create', recipe),
    update: (id: number, recipe: Partial<Recipe>) => ipcRenderer.invoke('recipes:update', id, recipe),
    delete: (id: number) => ipcRenderer.invoke('recipes:delete', id),
  },
  pacientes: {
    getAll: () => ipcRenderer.invoke('pacientes:getAll'),
    getById: (id: number) => ipcRenderer.invoke('pacientes:getById', id),
    create: (nombre: string, ingredientesEvitarIds?: number[]) => ipcRenderer.invoke('pacientes:create', nombre, ingredientesEvitarIds),
    update: (id: number, nombre: string, ingredientesEvitarIds?: number[]) => ipcRenderer.invoke('pacientes:update', id, nombre, ingredientesEvitarIds),
    delete: (id: number) => ipcRenderer.invoke('pacientes:delete', id),
  },
  ingredientes: {
    getAll: () => ipcRenderer.invoke('ingredientes:getAll'),
    getById: (id: number) => ipcRenderer.invoke('ingredientes:getById', id),
    create: (nombre: string, tipo_id?: number) => ipcRenderer.invoke('ingredientes:create', nombre, tipo_id),
    update: (id: number, nombre: string, tipo_id?: number) => ipcRenderer.invoke('ingredientes:update', id, nombre, tipo_id),
    delete: (id: number) => ipcRenderer.invoke('ingredientes:delete', id),
  },
  tiposIngrediente: {
    getAll: () => ipcRenderer.invoke('tipos-ingrediente:getAll'),
  },
  menu: {
    create: (data: any) => ipcRenderer.invoke('menu:create', data),
    listByPaciente: (idPaciente: number) => ipcRenderer.invoke('menu:listByPaciente', idPaciente),
    getById: (menuId: number) => ipcRenderer.invoke('menu:getById', menuId),
    saveItems: (data: any) => ipcRenderer.invoke('menu:saveItems', data),
    delete: (idPaciente: number) => ipcRenderer.invoke('menu:delete', idPaciente),
    exportToWord: (menuTables: any[], menuNombre: string) => ipcRenderer.invoke('menu:exportToWord', menuTables, menuNombre),
  },
  menuTiempos: {
    getAll: () => ipcRenderer.invoke('menu-tiempos:getAll'),
  },
  saveRecipeImage: (buffer: ArrayBuffer, fileName: string) => ipcRenderer.invoke('save-recipe-image', buffer, fileName),
});

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
