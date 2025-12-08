import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function initDatabase(): Database.Database {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'calorimetric.db');
  
  console.log('Database path:', dbPath);

  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  
  initializeSchema();
  
  return db;
}

function initializeSchema() {
  if (!db) return;

  const recetasExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='Recetas'"
  ).get();

  const pacientesExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='Pacientes'"
  ).get();

  if (!recetasExists) {
    console.log('Initializing database schema...');
    createTables();
    seedInitialData();
    console.log('Database initialized successfully');
  } else if (!pacientesExists) {
    console.log('Adding Pacientes table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS Pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Pacientes table added successfully');
  }
}

function createTables() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS Tiempos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Nombre TEXT NOT NULL UNIQUE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Ingredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Recetas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      TiempoId INTEGER NOT NULL,
      tiempo_preparacion TEXT,
      calorias INTEGER,
      imagen TEXT,
      FOREIGN KEY (TiempoId) REFERENCES Tiempos(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS RecetaIngredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      RecetaId INTEGER NOT NULL,
      IngredienteId INTEGER NOT NULL,
      FOREIGN KEY (RecetaId) REFERENCES Recetas(id) ON DELETE CASCADE,
      FOREIGN KEY (IngredienteId) REFERENCES Ingredientes(id) ON DELETE CASCADE,
      UNIQUE(RecetaId, IngredienteId)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Desayuno');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Comida');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Cena');
  `);
}

function seedInitialData() {
  if (!db) return;

  const recipeCount = db.prepare('SELECT COUNT(*) as count FROM Recetas').get() as any;
  if (recipeCount.count > 0) {
    console.log('Database already has data, skipping seed');
    return;
  }

  console.log('Seeding initial recipe data...');

  const ingredientsList = [
    'Quinoa', 'Aguacate', 'Huevo pochado', 'Espinacas', 'Tomate cherry', 'Limón',
    'Pescado blanco', 'Tortillas de maíz', 'Col morada', 'Cilantro', 'Salsa de yogurt',
    'Nopales', 'Tomate', 'Cebolla', 'Queso fresco', 'Chile serrano',
    'Tortillas horneadas', 'Salsa verde', 'Pollo desmenuzado', 'Crema light',
    'Camarón', 'Pepino', 'Cebolla morada', 'Frijoles negros', 'Ajo', 'Comino', 'Chile chipotle',
    'Pan integral', 'Frijoles refritos', 'Queso panela', 'Pico de gallo',
    'Pollo', 'Maíz pozolero', 'Tomatillos', 'Chile poblano', 'Lechuga', 'Rábanos', 'Orégano',
    'Jícama', 'Mango', 'Chile en polvo', 'Huevos', 'Tortilla integral', 'Salsa ranchera',
    'Atún en agua', 'Tostadas horneadas', 'Calabaza', 'Caldo de pollo', 'Leche descremada', 'Nuez moscada', 'Pepitas'
  ];

  const insertIngredient = db.prepare('INSERT OR IGNORE INTO Ingredientes (nombre) VALUES (?)');
  for (const ing of ingredientsList) {
    insertIngredient.run(ing);
  }

  const recipes = [
    { nombre: 'Bowl de Quinoa y Aguacate', tipo: 'Desayuno', tiempo: '15 min', calorias: 320, imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', ingredientes: ['Quinoa', 'Aguacate', 'Huevo pochado', 'Espinacas', 'Tomate cherry', 'Limón'] },
    { nombre: 'Tacos de Pescado con Col Morada', tipo: 'Comida', tiempo: '25 min', calorias: 380, imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', ingredientes: ['Pescado blanco', 'Tortillas de maíz', 'Col morada', 'Cilantro', 'Limón', 'Salsa de yogurt'] },
    { nombre: 'Ensalada de Nopales', tipo: 'Cena', tiempo: '20 min', calorias: 180, imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', ingredientes: ['Nopales', 'Tomate', 'Cebolla', 'Cilantro', 'Queso fresco', 'Limón', 'Chile serrano'] },
    { nombre: 'Chilaquiles Verdes con Pollo', tipo: 'Desayuno', tiempo: '30 min', calorias: 420, imagen: 'https://images.unsplash.com/photo-1599974715142-a5ec2f90e8cc?w=400&h=300&fit=crop', ingredientes: ['Tortillas horneadas', 'Salsa verde', 'Pollo desmenuzado', 'Crema light', 'Queso fresco', 'Cebolla'] },
    { nombre: 'Ceviche de Camarón', tipo: 'Comida', tiempo: '40 min', calorias: 210, imagen: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop', ingredientes: ['Camarón', 'Limón', 'Tomate', 'Pepino', 'Cebolla morada', 'Cilantro', 'Aguacate'] },
    { nombre: 'Sopa de Frijoles Negros', tipo: 'Cena', tiempo: '35 min', calorias: 280, imagen: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', ingredientes: ['Frijoles negros', 'Cebolla', 'Ajo', 'Comino', 'Chile chipotle', 'Cilantro', 'Aguacate'] },
    { nombre: 'Molletes Integrales', tipo: 'Desayuno', tiempo: '15 min', calorias: 310, imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', ingredientes: ['Pan integral', 'Frijoles refritos', 'Queso panela', 'Pico de gallo', 'Aguacate'] },
    { nombre: 'Pozole Verde Light', tipo: 'Comida', tiempo: '45 min', calorias: 350, imagen: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop', ingredientes: ['Pollo', 'Maíz pozolero', 'Tomatillos', 'Chile poblano', 'Lechuga', 'Rábanos', 'Orégano'] },
    { nombre: 'Ensalada de Jícama y Mango', tipo: 'Cena', tiempo: '10 min', calorias: 150, imagen: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop', ingredientes: ['Jícama', 'Mango', 'Pepino', 'Chile en polvo', 'Limón', 'Cilantro'] },
    { nombre: 'Huevos Rancheros Saludables', tipo: 'Desayuno', tiempo: '20 min', calorias: 290, imagen: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop', ingredientes: ['Huevos', 'Tortilla integral', 'Salsa ranchera', 'Frijoles negros', 'Aguacate', 'Cilantro'] },
    { nombre: 'Tostadas de Atún', tipo: 'Comida', tiempo: '15 min', calorias: 270, imagen: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=400&h=300&fit=crop', ingredientes: ['Atún en agua', 'Tostadas horneadas', 'Aguacate', 'Tomate', 'Cebolla', 'Limón', 'Lechuga'] },
    { nombre: 'Crema de Calabaza', tipo: 'Cena', tiempo: '30 min', calorias: 160, imagen: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop', ingredientes: ['Calabaza', 'Cebolla', 'Ajo', 'Caldo de pollo', 'Leche descremada', 'Nuez moscada', 'Pepitas'] }
  ];

  for (const recipe of recipes) {
    // Import from recetasService to avoid circular dependency
    const { createRecipe } = require('./recetasService');
    createRecipe({ nombre: recipe.nombre, tipo: recipe.tipo, tiempo_preparacion: recipe.tiempo, calorias: recipe.calorias, imagen: recipe.imagen, ingredientes: recipe.ingredientes });
  }

  console.log('Initial recipe data seeded successfully');
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
