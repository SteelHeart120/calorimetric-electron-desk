import { getDatabase } from './database';

export interface TipoIngrediente {
  id: number;
  nombre: string;
  color: string;
}

export interface Ingrediente {
  id: number;
  nombre: string;
  tipo_id?: number;
  tipo?: string;
  color?: string;
}

export function getAllIngredientes(): Ingrediente[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT 
      i.id, 
      i.nombre, 
      i.tipo_id,
      t.nombre as tipo,
      t.color
    FROM Ingredientes i
    LEFT JOIN TipoIngrediente t ON i.tipo_id = t.id
    ORDER BY i.nombre
  `).all() as Ingrediente[];
}

export function getIngredienteById(id: number): Ingrediente | undefined {
  const database = getDatabase();
  return database.prepare(`
    SELECT 
      i.id, 
      i.nombre, 
      i.tipo_id,
      t.nombre as tipo,
      t.color
    FROM Ingredientes i
    LEFT JOIN TipoIngrediente t ON i.tipo_id = t.id
    WHERE i.id = ?
  `).get(id) as Ingrediente | undefined;
}

export function createIngrediente(nombre: string, tipo_id?: number): Ingrediente {
  const database = getDatabase();
  const result = database.prepare('INSERT INTO Ingredientes (nombre, tipo_id) VALUES (?, ?)').run(nombre, tipo_id || null);
  return {
    id: result.lastInsertRowid as number,
    nombre,
    tipo_id,
  };
}

export function updateIngrediente(id: number, nombre: string, tipo_id?: number): void {
  const database = getDatabase();
  database.prepare('UPDATE Ingredientes SET nombre = ?, tipo_id = ? WHERE id = ?').run(nombre, tipo_id || null, id);
}

export function deleteIngrediente(id: number): void {
  const database = getDatabase();
  database.prepare('DELETE FROM Ingredientes WHERE id = ?').run(id);
}

export function getAllTiposIngrediente(): TipoIngrediente[] {
  const database = getDatabase();
  return database.prepare('SELECT * FROM TipoIngrediente ORDER BY nombre').all() as TipoIngrediente[];
}
