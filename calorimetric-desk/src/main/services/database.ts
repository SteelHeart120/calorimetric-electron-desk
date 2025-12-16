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
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('AOAM', '#f51f1fff');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('AOAB', '#e44444ff');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('AOAMB', '#FF6363');
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

    // Check if MenuPaciente table exists
    const menuPacienteExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='MenuPaciente'"
    ).get();

    if (!menuPacienteExists) {
      console.log('Creating MenuPaciente table...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS MenuPaciente (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          idPaciente INTEGER NOT NULL,
          idTiempos INTEGER NOT NULL,
          idTipoIngrediente INTEGER,
          Codigo INTEGER,
          Cantidad TEXT,
          Nombre TEXT,
          RecipeTitle TEXT,
          FOREIGN KEY (idPaciente) REFERENCES Pacientes(id) ON DELETE CASCADE,
          FOREIGN KEY (idTiempos) REFERENCES Tiempos(id),
          FOREIGN KEY (idTipoIngrediente) REFERENCES TipoIngrediente(id)
        );
      `);
      console.log('MenuPaciente table created successfully');
    }

    // Check if RecipeTitle column exists in MenuPaciente
    const recipeTitleColumnExists = db.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('MenuPaciente') WHERE name='RecipeTitle'"
    ).get() as any;

    if (recipeTitleColumnExists.count === 0) {
      console.log('Adding RecipeTitle column to MenuPaciente table...');
      db.exec('ALTER TABLE MenuPaciente ADD COLUMN RecipeTitle TEXT');
      console.log('RecipeTitle column added successfully');
    }

    // Check if PacienteIngredientesEvitar table exists
    const pacienteIngredientesEvitarExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='PacienteIngredientesEvitar'"
    ).get();

    if (!pacienteIngredientesEvitarExists) {
      console.log('Creating PacienteIngredientesEvitar table...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS PacienteIngredientesEvitar (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          idPaciente INTEGER NOT NULL,
          idIngrediente INTEGER NOT NULL,
          FOREIGN KEY (idPaciente) REFERENCES Pacientes(id) ON DELETE CASCADE,
          FOREIGN KEY (idIngrediente) REFERENCES Ingredientes(id) ON DELETE CASCADE,
          UNIQUE(idPaciente, idIngrediente)
        );
      `);
      console.log('PacienteIngredientesEvitar table created successfully');
    }

    // --- New menu system tables / columns (2025-12) ---

    // Create MenuTiempos table (base tiempo names for menu configuration)
    const menuTiemposExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='MenuTiempos'"
    ).get();

    if (!menuTiemposExists) {
      console.log('Creating MenuTiempos table...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS MenuTiempos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          Nombre TEXT NOT NULL UNIQUE
        );
      `);
      console.log('MenuTiempos table created successfully');
    }

    // Seed MenuTiempos
    db.exec(`
      INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Hidratacion');
      INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Desayuno');
      INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Almuerzo');
      INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Comida');
      INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Cena');
      INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Post-entreno');
    `);

    // Create Menus table (menu header records)
    const menusExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='Menus'"
    ).get();

    if (!menusExists) {
      console.log('Creating Menus table...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS Menus (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          idPaciente INTEGER NOT NULL,
          nombre TEXT NOT NULL,
          tiempo1 TEXT NOT NULL,
          tiempo2 TEXT NOT NULL,
          tiempo3 TEXT NOT NULL,
          tiempo4 TEXT NOT NULL,
          tiempo5 TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (idPaciente) REFERENCES Pacientes(id) ON DELETE CASCADE
        );
      `);
      console.log('Menus table created successfully');
    }

    // Ensure MenuPaciente has MenuId + NombreTiempo columns
    const menuIdColumnExists = db.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('MenuPaciente') WHERE name='MenuId'"
    ).get() as any;

    if (menuIdColumnExists.count === 0) {
      console.log('Adding MenuId column to MenuPaciente table...');
      db.exec('ALTER TABLE MenuPaciente ADD COLUMN MenuId INTEGER');
      console.log('MenuId column added successfully');
    }

    const nombreTiempoColumnExists = db.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('MenuPaciente') WHERE name='NombreTiempo'"
    ).get() as any;

    if (nombreTiempoColumnExists.count === 0) {
      console.log('Adding NombreTiempo column to MenuPaciente table...');
      db.exec('ALTER TABLE MenuPaciente ADD COLUMN NombreTiempo TEXT');
      console.log('NombreTiempo column added successfully');
    }

    // Ensure Tiempos includes Hidratacion I-V (and keep inserts idempotent)
    db.exec(`
      INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion I');
      INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion II');
      INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion III');
      INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion IV');
      INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion V');
    `);

    // Backfill NombreTiempo from idTiempos if missing
    db.exec(`
      UPDATE MenuPaciente
      SET NombreTiempo = (SELECT Nombre FROM Tiempos WHERE Tiempos.id = MenuPaciente.idTiempos)
      WHERE (NombreTiempo IS NULL OR NombreTiempo = '');
    `);

    // Migrate legacy MenuPaciente rows (single menu per patient) into Menus + MenuId
    try {
      const legacyPatients = db.prepare(`
        SELECT DISTINCT idPaciente
        FROM MenuPaciente
        WHERE (MenuId IS NULL OR MenuId = '')
      `).all() as Array<{ idPaciente: number }>;

      const insertMenuStmt = db.prepare(`
        INSERT INTO Menus (idPaciente, nombre, tiempo1, tiempo2, tiempo3, tiempo4, tiempo5)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const updateMenuIdStmt = db.prepare(`
        UPDATE MenuPaciente
        SET MenuId = ?
        WHERE idPaciente = ? AND (MenuId IS NULL OR MenuId = '')
      `);

      for (const row of legacyPatients) {
        // Skip if this patient already has menus
        const existing = db.prepare('SELECT id FROM Menus WHERE idPaciente = ? LIMIT 1').get(row.idPaciente) as any;
        if (existing) continue;

        const info = insertMenuStmt.run(
          row.idPaciente,
          'Menú',
          'Desayuno',
          'Almuerzo',
          'Comida',
          'Post-entreno',
          'Cena'
        );

        const newMenuId = Number(info.lastInsertRowid);
        updateMenuIdStmt.run(newMenuId, row.idPaciente);
      }
    } catch (error) {
      console.warn('Legacy menu migration skipped/failed:', error);
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
    CREATE TABLE IF NOT EXISTS MenuTiempos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Nombre TEXT NOT NULL UNIQUE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idPaciente INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      tiempo1 TEXT NOT NULL,
      tiempo2 TEXT NOT NULL,
      tiempo3 TEXT NOT NULL,
      tiempo4 TEXT NOT NULL,
      tiempo5 TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (idPaciente) REFERENCES Pacientes(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS MenuPaciente (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      MenuId INTEGER,
      idPaciente INTEGER NOT NULL,
      idTiempos INTEGER NOT NULL,
      NombreTiempo TEXT,
      idTipoIngrediente INTEGER,
      Codigo INTEGER,
      Cantidad TEXT,
      Nombre TEXT,
      RecipeTitle TEXT,
      FOREIGN KEY (MenuId) REFERENCES Menus(id) ON DELETE CASCADE,
      FOREIGN KEY (idPaciente) REFERENCES Pacientes(id) ON DELETE CASCADE,
      FOREIGN KEY (idTiempos) REFERENCES Tiempos(id),
      FOREIGN KEY (idTipoIngrediente) REFERENCES TipoIngrediente(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS PacienteIngredientesEvitar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idPaciente INTEGER NOT NULL,
      idIngrediente INTEGER NOT NULL,
      FOREIGN KEY (idPaciente) REFERENCES Pacientes(id) ON DELETE CASCADE,
      FOREIGN KEY (idIngrediente) REFERENCES Ingredientes(id) ON DELETE CASCADE,
      UNIQUE(idPaciente, idIngrediente)
    );
  `);

  db.exec(`
    INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Hidratacion');
    INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Desayuno');
    INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Almuerzo');
    INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Comida');
    INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Cena');
    INSERT OR IGNORE INTO MenuTiempos (Nombre) VALUES ('Post-entreno');

    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Desayuno I');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Desayuno II');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Desayuno III');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Desayuno IV');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Desayuno V');

    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion I');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion II');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion III');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion IV');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Hidratacion V');

    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Almuerzo I');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Almuerzo II');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Almuerzo III');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Almuerzo IV');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Almuerzo V');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Comida I');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Comida II');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Comida III');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Comida IV');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Comida V');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Post-entreno I');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Post-entreno II');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Post-entreno III');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Post-entreno IV');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Post-entreno V');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Cena I');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Cena II');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Cena III');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Cena IV');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Cena V');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Desayuno');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Comida');
    INSERT OR IGNORE INTO Tiempos (Nombre) VALUES ('Cena');
  `);

  // Seed TipoIngrediente with initial data
  db.exec(`
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('Lácteos', '#808080');
        INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('AOAM', '#f51f1fff');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('AOAB', '#e44444ff');
    INSERT OR IGNORE INTO TipoIngrediente (nombre, color) VALUES ('AOAMB', '#FF6363');
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
    aoam: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'AOAM'").get() as any)?.id,
    aoab: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'AOAB'").get() as any)?.id,
    aoamb: (db.prepare("SELECT id FROM TipoIngrediente WHERE nombre = 'AOAMB'").get() as any)?.id,
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
    
    // AOAM (Alimentos Origen Animal Muy Bajo en Grasa)
    { nombre: 'Pollo desmenuzado', tipo_id: tipos.aoam },
    { nombre: 'Pollo', tipo_id: tipos.aoam },
    { nombre: 'Pescado blanco', tipo_id: tipos.aoam },
    { nombre: 'Atún en agua', tipo_id: tipos.aoam },
    { nombre: 'Camarón', tipo_id: tipos.aoam },
    
    // AOAB (Alimentos Origen Animal Bajo en Grasa)
    { nombre: 'Huevos', tipo_id: tipos.aoab },
    { nombre: 'Huevo pochado', tipo_id: tipos.aoab },
    
    // AOAMB (Alimentos Origen Animal Moderado/Alto en Grasa)
    { nombre: 'Carne de res magra', tipo_id: tipos.aoamb },
    
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
