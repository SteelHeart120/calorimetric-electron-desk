export interface Recipe {
  id: number;
  nombre: string;
  tipo: string;
  tiempo_preparacion: string;
  calorias: number;
  imagen: string;
  ingredientes: string[];
}

export interface ElectronAPI {
  onSaveMenu: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
  recipes: {
    getAll: () => Promise<Recipe[]>;
    getById: (id: number) => Promise<Recipe | null>;
    create: (recipe: Omit<Recipe, 'id'>) => Promise<number>;
    update: (id: number, recipe: Partial<Recipe>) => Promise<boolean>;
    delete: (id: number) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
