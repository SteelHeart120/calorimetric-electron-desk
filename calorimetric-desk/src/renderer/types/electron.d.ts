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

export interface Paciente {
  id: number;
  nombre: string;
  created_at: string;
  ingredientesEvitar?: IngredienteEvitar[];
}

export interface IngredienteEvitar {
  id: number;
  nombre: string;
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

export interface MenuItemData {
  codigo: string;
  cantidad: string;
  nombre: string;
  color: string;
  tiempoName: string;
  recipeTitle?: string;
}

export interface MenuHeader {
  id: number;
  idPaciente: number;
  nombre: string;
  tiempo1: string;
  tiempo2: string;
  tiempo3: string;
  tiempo4: string;
  tiempo5: string;
  created_at: string;
}

export interface CreateMenuData {
  idPaciente: number;
  nombre: string;
  tiempos: [string, string, string, string, string];
}

export interface SaveMenuItemsData {
  menuId: number;
  items: MenuItemData[];
}

export interface MenuTiempo {
  id: number;
  Nombre: string;
}

export interface ElectronAPI {
  onSaveMenu: (callback: () => void) => void;
  onExportMenu: (callback: () => void) => void;
  onShowAddPatient: (callback: () => void) => void;
  onShowAddRecipe: (callback: () => void) => void;
  onShowAddIngrediente: (callback: () => void) => void;
  onShowIngredientesList: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
  recipes: {
    getAll: () => Promise<Recipe[]>;
    getById: (id: number) => Promise<Recipe | null>;
    create: (recipe: Omit<Recipe, 'id'>) => Promise<number>;
    update: (id: number, recipe: Partial<Recipe>) => Promise<boolean>;
    delete: (id: number) => Promise<boolean>;
  };
  pacientes: {
    getAll: () => Promise<Paciente[]>;
    getById: (id: number) => Promise<Paciente | null>;
    create: (nombre: string, ingredientesEvitarIds?: number[]) => Promise<number>;
    update: (id: number, nombre: string, ingredientesEvitarIds?: number[]) => Promise<boolean>;
    delete: (id: number) => Promise<boolean>;
  };
  ingredientes: {
    getAll: () => Promise<Ingrediente[]>;
    getById: (id: number) => Promise<Ingrediente | undefined>;
    create: (nombre: string, tipo_id?: number) => Promise<Ingrediente>;
    update: (id: number, nombre: string, tipo_id?: number) => Promise<void>;
    delete: (id: number) => Promise<void>;
  };
  tiposIngrediente: {
    getAll: () => Promise<TipoIngrediente[]>;
  };
  menu: {
    create: (data: CreateMenuData) => Promise<MenuHeader>;
    listByPaciente: (idPaciente: number) => Promise<MenuHeader[]>;
    getById: (menuId: number) => Promise<{ menu: MenuHeader; items: any[] }>;
    saveItems: (data: SaveMenuItemsData) => Promise<void>;
    delete: (idPaciente: number) => Promise<void>;
    exportToWord: (menuTables: any[], menuNombre: string) => Promise<void>;
  };
  menuTiempos: {
    getAll: () => Promise<MenuTiempo[]>;
  };
  saveRecipeImage: (buffer: ArrayBuffer, fileName: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
