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
  } else {
    // Add missing columns to existing tables
    if (!pacientesExists) {
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

    // Check if link column exists in Recetas
    const linkColumnExists = db.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('Recetas') WHERE name='link'"
    ).get() as any;

    if (linkColumnExists.count === 0) {
      console.log('Adding link column to Recetas table...');
      db.exec('ALTER TABLE Recetas ADD COLUMN link TEXT');
      console.log('Link column added successfully');
    }

    // Check if TipoIngrediente table exists
    const tipoIngredienteExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='TipoIngrediente'"
    ).get();

    if (!tipoIngredienteExists) {
      console.log('Creating TipoIngrediente table...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS TipoIngrediente (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL
        );
      `);
      
      // Seed initial tipos
      db.exec(`
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Lácteos', '#808080');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Animales', '#FF6363');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Leguminosas', '#A52A2A');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Verduras', '#008000');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Cereales', '#FF8C00');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Frutas', '#8A2BE2');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Lípidos', '#FFFF00');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Líp+proteína', '#CD661D');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Azúcares', '#00BFFF');
      `);
      console.log('TipoIngrediente table created successfully');
    }

    // Check if tipo_id column exists in Ingredientes
    const tipoIdColumnExists = db.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('Ingredientes') WHERE name='tipo_id'"
    ).get() as any;

    if (tipoIdColumnExists.count === 0) {
      console.log('Adding tipo_id column to Ingredientes table...');
      db.exec('ALTER TABLE Ingredientes ADD COLUMN tipo_id INTEGER REFERENCES TipoIngrediente(id)');
      console.log('tipo_id column added successfully');
    }
  }
}

function createTables() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS TipoIngrediente (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Tiempos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Nombre TEXT NOT NULL UNIQUE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Ingredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      tipo_id INTEGER,
      FOREIGN KEY (tipo_id) REFERENCES TipoIngrediente(id)
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
      link TEXT,
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

  // Seed TipoIngrediente with initial data
  db.exec(`
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Lácteos', '#808080');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Animales', '#FF6363');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Leguminosas', '#A52A2A');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Verduras', '#008000');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Cereales', '#FF8C00');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Frutas', '#8A2BE2');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Lípidos', '#FFFF00');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Líp+proteína', '#CD661D');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Azúcares', '#00BFFF');
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

  // Get tipo IDs for reference
  const tipos = {
    lacteos: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Lácteos'").get() as any)?.id,
    animales: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Animales'").get() as any)?.id,
    leguminosas: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Leguminosas'").get() as any)?.id,
    verduras: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Verduras'").get() as any)?.id,
    cereales: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Cereales'").get() as any)?.id,
    frutas: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Frutas'").get() as any)?.id,
    lipidos: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Lípidos'").get() as any)?.id,
    lipProteina: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Líp+proteína'").get() as any)?.id,
    azucares: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'Azúcares'").get() as any)?.id,
  };

  // Comprehensive ingredient list with tipos
  const ingredientsList = [
    // Lácteos
    { nombre: 'Leche descremada', tipo_id: tipos.lacteos },
    { nombre: 'Yogurt natural', tipo_id: tipos.lacteos },
    { nombre: 'Queso fresco', tipo_id: tipos.lacteos },
    { nombre: 'Queso panela', tipo_id: tipos.lacteos },
    { nombre: 'Crema light', tipo_id: tipos.lacteos },
    
    // Animales
    { nombre: 'Pollo desmenuzado', tipo_id: tipos.animales },
    { nombre: 'Pollo', tipo_id: tipos.animales },
    { nombre: 'Pescado blanco', tipo_id: tipos.animales },
    { nombre: 'Atún en agua', tipo_id: tipos.animales },
    { nombre: 'Camarón', tipo_id: tipos.animales },
    { nombre: 'Huevos', tipo_id: tipos.animales },
    { nombre: 'Huevo pochado', tipo_id: tipos.animales },
    { nombre: 'Carne de res magra', tipo_id: tipos.animales },
    
    // Leguminosas
    { nombre: 'Frijoles negros', tipo_id: tipos.leguminosas },
    { nombre: 'Frijoles refritos', tipo_id: tipos.leguminosas },
    { nombre: 'Lentejas', tipo_id: tipos.leguminosas },
    { nombre: 'Garbanzos', tipo_id: tipos.leguminosas },
    { nombre: 'Frijoles pintos', tipo_id: tipos.leguminosas },
    
    // Verduras
    { nombre: 'Espinacas', tipo_id: tipos.verduras },
    { nombre: 'Tomate', tipo_id: tipos.verduras },
    { nombre: 'Tomate cherry', tipo_id: tipos.verduras },
    { nombre: 'Cebolla', tipo_id: tipos.verduras },
    { nombre: 'Cebolla morada', tipo_id: tipos.verduras },
    { nombre: 'Ajo', tipo_id: tipos.verduras },
    { nombre: 'Nopales', tipo_id: tipos.verduras },
    { nombre: 'Col morada', tipo_id: tipos.verduras },
    { nombre: 'Lechuga', tipo_id: tipos.verduras },
    { nombre: 'Pepino', tipo_id: tipos.verduras },
    { nombre: 'Calabaza', tipo_id: tipos.verduras },
    { nombre: 'Rábanos', tipo_id: tipos.verduras },
    { nombre: 'Chile serrano', tipo_id: tipos.verduras },
    { nombre: 'Chile poblano', tipo_id: tipos.verduras },
    { nombre: 'Chile chipotle', tipo_id: tipos.verduras },
    { nombre: 'Cilantro', tipo_id: tipos.verduras },
    { nombre: 'Tomatillos', tipo_id: tipos.verduras },
    { nombre: 'Zanahoria', tipo_id: tipos.verduras },
    { nombre: 'Brócoli', tipo_id: tipos.verduras },
    { nombre: 'Pimiento', tipo_id: tipos.verduras },
    
    // Cereales
    { nombre: 'Quinoa', tipo_id: tipos.cereales },
    { nombre: 'Tortillas de maíz', tipo_id: tipos.cereales },
    { nombre: 'Tortillas horneadas', tipo_id: tipos.cereales },
    { nombre: 'Tortilla integral', tipo_id: tipos.cereales },
    { nombre: 'Pan integral', tipo_id: tipos.cereales },
    { nombre: 'Tostadas horneadas', tipo_id: tipos.cereales },
    { nombre: 'Arroz integral', tipo_id: tipos.cereales },
    { nombre: 'Avena', tipo_id: tipos.cereales },
    { nombre: 'Maíz pozolero', tipo_id: tipos.cereales },
    { nombre: 'Pasta integral', tipo_id: tipos.cereales },
    
    // Frutas
    { nombre: 'Aguacate', tipo_id: tipos.frutas },
    { nombre: 'Limón', tipo_id: tipos.frutas },
    { nombre: 'Mango', tipo_id: tipos.frutas },
    { nombre: 'Jícama', tipo_id: tipos.frutas },
    { nombre: 'Plátano', tipo_id: tipos.frutas },
    { nombre: 'Manzana', tipo_id: tipos.frutas },
    { nombre: 'Papaya', tipo_id: tipos.frutas },
    { nombre: 'Fresa', tipo_id: tipos.frutas },
    { nombre: 'Piña', tipo_id: tipos.frutas },
    { nombre: 'Naranja', tipo_id: tipos.frutas },
    
    // Lípidos
    { nombre: 'Aceite de oliva', tipo_id: tipos.lipidos },
    { nombre: 'Aceite de aguacate', tipo_id: tipos.lipidos },
    { nombre: 'Aceite vegetal', tipo_id: tipos.lipidos },
    
    // Líp+proteína
    { nombre: 'Pepitas', tipo_id: tipos.lipProteina },
    { nombre: 'Nueces', tipo_id: tipos.lipProteina },
    { nombre: 'Almendras', tipo_id: tipos.lipProteina },
    { nombre: 'Cacahuates', tipo_id: tipos.lipProteina },
    { nombre: 'Semillas de chía', tipo_id: tipos.lipProteina },
    
    // Azúcares
    { nombre: 'Miel', tipo_id: tipos.azucares },
    { nombre: 'Azúcar mascabado', tipo_id: tipos.azucares },
    
    // Condimentos y especias (sin tipo específico)
    { nombre: 'Sal', tipo_id: null },
    { nombre: 'Pimienta', tipo_id: null },
    { nombre: 'Comino', tipo_id: null },
    { nombre: 'Orégano', tipo_id: null },
    { nombre: 'Nuez moscada', tipo_id: null },
    { nombre: 'Chile en polvo', tipo_id: null },
    { nombre: 'Salsa verde', tipo_id: null },
    { nombre: 'Salsa ranchera', tipo_id: null },
    { nombre: 'Salsa de yogurt', tipo_id: null },
    { nombre: 'Pico de gallo', tipo_id: null },
    { nombre: 'Caldo de pollo', tipo_id: null },
  ];

  const insertIngredient = db.prepare('INSERT OR IGNORE INTO Ingredientes (nombre, tipo_id) VALUES (?, ?)');
  for (const ing of ingredientsList) {
    insertIngredient.run(ing.nombre, ing.tipo_id);
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

  // Insert recipes directly to avoid circular dependency
  for (const recipe of recipes) {
    // Get or create tiempo
    let tiempoRecord = db.prepare('SELECT id FROM Tiempos WHERE Nombre = ?').get(recipe.tipo) as any;
    if (!tiempoRecord) {
      const result = db.prepare('INSERT INTO Tiempos (Nombre) VALUES (?)').run(recipe.tipo);
      tiempoRecord = { id: result.lastInsertRowid };
    }

    // Insert recipe
    const result = db.prepare(`
      INSERT INTO Recetas (nombre, TiempoId, tiempo_preparacion, calorias, imagen, link)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(recipe.nombre, tiempoRecord.id, recipe.tiempo, recipe.calorias, recipe.imagen, null);

    const recipeId = Number(result.lastInsertRowid);

    // Link ingredients
    for (const ingredientName of recipe.ingredientes) {
      const ingredient = db.prepare('SELECT id FROM Ingredientes WHERE nombre = ?').get(ingredientName) as any;
      if (ingredient) {
        db.prepare('INSERT INTO RecetaIngredientes (RecetaId, IngredienteId) VALUES (?, ?)').run(recipeId, ingredient.id);
      }
    }
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
