import { getDatabase } from './database';

export interface MenuItemData {
  codigo: string;
  cantidad: string;
  nombre: string;
  color: string;
  tiempoName: string; // The tiempo name (e.g., "Desayuno I", "Almuerzo II")
  recipeTitle?: string; // The recipe name if added
}

export interface SaveMenuData {
  idPaciente: number;
  items: MenuItemData[];
}

export function saveMenu(data: SaveMenuData): void {
  const db = getDatabase();
  
  try {
    // Start transaction
    db.prepare('BEGIN TRANSACTION').run();

    // Delete existing menu for this patient
    db.prepare('DELETE FROM MenuPaciente WHERE idPaciente = ?').run(data.idPaciente);

    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT INTO MenuPaciente (idPaciente, idTiempos, idTipoIngrediente, Codigo, Cantidad, Nombre, RecipeTitle)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert each menu item
    for (const item of data.items) {
      // Skip empty items
      if (!item.nombre.trim()) continue;

      // Get tiempo ID
      const tiempoRecord = db.prepare('SELECT id FROM Tiempos WHERE Nombre = ?').get(item.tiempoName) as any;
      if (!tiempoRecord) {
        console.warn(`Tiempo not found: ${item.tiempoName}`);
        continue;
      }

      // Get tipo ingrediente ID from color
      const tipoRecord = db.prepare('SELECT id FROM TipoIngrediente WHERE color = ?').get(item.color) as any;
      const tipoId = tipoRecord ? tipoRecord.id : null;

      // Parse codigo and cantidad
      const codigo = item.codigo ? parseInt(item.codigo, 10) : null;
      const cantidad = item.cantidad ? parseFloat(item.cantidad) : null;

      insertStmt.run(
        data.idPaciente,
        tiempoRecord.id,
        tipoId,
        codigo,
        cantidad,
        item.nombre,
        item.recipeTitle || null
      );
    }

    // Commit transaction
    db.prepare('COMMIT').run();
    console.log(`Menu saved successfully for patient ${data.idPaciente}`);
  } catch (error) {
    // Rollback on error
    db.prepare('ROLLBACK').run();
    console.error('Error saving menu:', error);
    throw error;
  }
}

export function getMenuByPaciente(idPaciente: number): any[] {
  const db = getDatabase();
  
  const menu = db.prepare(`
    SELECT 
      m.id,
      m.idPaciente,
      m.Codigo,
      m.Cantidad,
      m.Nombre,
      m.RecipeTitle,
      t.Nombre as tiempoName,
      ti.nombre as tipoNombre,
      ti.color as tipoColor
    FROM MenuPaciente m
    JOIN Tiempos t ON m.idTiempos = t.id
    LEFT JOIN TipoIngrediente ti ON m.idTipoIngrediente = ti.id
    WHERE m.idPaciente = ?
    ORDER BY t.id, m.id
  `).all(idPaciente);

  return menu;
}

export function deleteMenuByPaciente(idPaciente: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM MenuPaciente WHERE idPaciente = ?').run(idPaciente);
  console.log(`Menu deleted for patient ${idPaciente}`);
}
