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

export interface SaveMenuData {
  idPaciente: number;
  items: MenuItemData[];
}

export interface ElectronAPI {
  onSaveMenu: (callback: () => void) => void;
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
    save: (data: SaveMenuData) => Promise<void>;
    getByPaciente: (idPaciente: number) => Promise<any[]>;
    delete: (idPaciente: number) => Promise<void>;
  };
  saveRecipeImage: (buffer: ArrayBuffer, fileName: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
