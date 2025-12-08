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
  ingredientes: string[];
}

export interface Paciente {
  id: number;
  nombre: string;
  created_at: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  onSaveMenu: (callback: () => void) => {
    ipcRenderer.on('save-menu', callback);
  },
  onShowAddPatient: (callback: () => void) => {
    ipcRenderer.on('show-add-patient', callback);
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
    create: (nombre: string) => ipcRenderer.invoke('pacientes:create', nombre),
    update: (id: number, nombre: string) => ipcRenderer.invoke('pacientes:update', id, nombre),
    delete: (id: number) => ipcRenderer.invoke('pacientes:delete', id),
  }
});

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
