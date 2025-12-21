import { getDatabase } from './database';

export interface MenuItemData {
  codigo: string;
  cantidad: string;
  nombre: string;
  color: string;
  tiempoName: string; // The tiempo name (e.g., "Desayuno I", "Almuerzo II")
  recipeTitle?: string; // The recipe name if added
}

export interface MenuTiempo {
  id: number;
  Nombre: string;
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
  tiempos?: string; // JSON string
  created_at: string;
}

export interface CreateMenuData {
  idPaciente: number;
  nombre: string;
  tiempos: string[];
}

export interface SaveMenuItemsData {
  menuId: number;
  items: MenuItemData[];
}

function getOrCreateTiempoId(nombreTiempo: string): number {
  const db = getDatabase();
  // Ensure tiempo exists (idempotent)
  db.prepare("INSERT OR IGNORE INTO Tiempos (Nombre) VALUES (?)").run(nombreTiempo);
  const row = db.prepare('SELECT id FROM Tiempos WHERE Nombre = ?').get(nombreTiempo) as any;
  if (!row) throw new Error(`Tiempo not found and could not be created: ${nombreTiempo}`);
  return Number(row.id);
}

export function getAllMenuTiempos(): MenuTiempo[] {
  const db = getDatabase();
  return db.prepare('SELECT id, Nombre FROM MenuTiempos ORDER BY id ASC').all() as MenuTiempo[];
}

export function createMenu(data: CreateMenuData): MenuHeader {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO Menus (idPaciente, nombre, tiempo1, tiempo2, tiempo3, tiempo4, tiempo5, tiempos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    data.idPaciente,
    data.nombre,
    data.tiempos[0] || '',
    data.tiempos[1] || '',
    data.tiempos[2] || '',
    data.tiempos[3] || '',
    data.tiempos[4] || '',
    JSON.stringify(data.tiempos)
  );
  const id = Number(info.lastInsertRowid);
  return getMenuHeaderById(id);
}

export function listMenusByPaciente(idPaciente: number): MenuHeader[] {
  const db = getDatabase();
  return db
    .prepare(
      `
      SELECT id, idPaciente, nombre, tiempo1, tiempo2, tiempo3, tiempo4, tiempo5, tiempos, created_at
      FROM Menus
      WHERE idPaciente = ?
      ORDER BY datetime(created_at) DESC, id DESC
    `
    )
    .all(idPaciente) as MenuHeader[];
}

export function getMenuHeaderById(menuId: number): MenuHeader {
  const db = getDatabase();
  const menu = db
    .prepare(
      `
      SELECT id, idPaciente, nombre, tiempo1, tiempo2, tiempo3, tiempo4, tiempo5, tiempos, created_at
      FROM Menus
      WHERE id = ?
    `
    )
    .get(menuId) as MenuHeader | undefined;
  if (!menu) throw new Error(`Menu not found: ${menuId}`);
  return menu;
}

export function getMenuById(menuId: number): { menu: MenuHeader; items: any[] } {
  const db = getDatabase();
  const menu = getMenuHeaderById(menuId);

  const items = db
    .prepare(
      `
      SELECT 
        m.id,
        m.MenuId,
        m.idPaciente,
        m.Codigo,
        m.Cantidad,
        m.Nombre,
        m.RecipeTitle,
        r.link as RecipeLink,
        COALESCE(m.NombreTiempo, t.Nombre) as tiempoName,
        ti.nombre as tipoNombre,
        ti.color as tipoColor
      FROM MenuPaciente m
      JOIN Tiempos t ON m.idTiempos = t.id
      LEFT JOIN TipoIngrediente ti ON m.idTipoIngrediente = ti.id
      LEFT JOIN Recetas r ON m.RecipeTitle = r.nombre
      WHERE m.MenuId = ?
      ORDER BY t.id, m.id
    `
    )
    .all(menuId);

  return { menu, items };
}

export function saveMenuItems(data: SaveMenuItemsData): void {
  const db = getDatabase();
  const menu = getMenuHeaderById(data.menuId);

  try {
    db.prepare('BEGIN TRANSACTION').run();

    db.prepare('DELETE FROM MenuPaciente WHERE MenuId = ?').run(data.menuId);

    const insertStmt = db.prepare(`
      INSERT INTO MenuPaciente (MenuId, idPaciente, idTiempos, NombreTiempo, idTipoIngrediente, Codigo, Cantidad, Nombre, RecipeTitle)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of data.items) {
      if (!item.nombre.trim()) continue;

      const tiempoId = getOrCreateTiempoId(item.tiempoName);

      const tipoRecord = db.prepare('SELECT id FROM TipoIngrediente WHERE color = ?').get(item.color) as any;
      const tipoId = tipoRecord ? tipoRecord.id : null;

      const codigo = item.codigo ? parseFloat(item.codigo) : null;
      const cantidad = item.cantidad || null;

      insertStmt.run(
        data.menuId,
        menu.idPaciente,
        tiempoId,
        item.tiempoName,
        tipoId,
        codigo,
        cantidad,
        item.nombre,
        item.recipeTitle || null
      );
    }

    db.prepare('COMMIT').run();
    console.log(`Menu items saved successfully for menuId ${data.menuId}`);
  } catch (error) {
    db.prepare('ROLLBACK').run();
    console.error('Error saving menu items:', error);
    throw error;
  }
}

export function deleteMenuByPaciente(idPaciente: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM Menus WHERE idPaciente = ?').run(idPaciente);
  console.log(`Menus deleted for patient ${idPaciente}`);
}

export function deleteMenuById(menuId: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM Menus WHERE id = ?').run(menuId);
  console.log(`Menu deleted: ${menuId}`);
}
