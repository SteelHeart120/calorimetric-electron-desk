import { getDatabase } from './database';

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

export function getAllPacientes(): Paciente[] {
  const database = getDatabase();
  const pacientes = database.prepare('SELECT * FROM Pacientes ORDER BY nombre').all() as Paciente[];
  
  // Load ingredientes evitar for each paciente
  for (const paciente of pacientes) {
    paciente.ingredientesEvitar = getIngredientesEvitarByPaciente(paciente.id);
    console.log(`Paciente ${paciente.nombre} (${paciente.id}) tiene ${paciente.ingredientesEvitar.length} ingredientes evitar:`, paciente.ingredientesEvitar);
  }
  
  return pacientes;
}

export function getPacienteById(id: number): Paciente | null {
  const database = getDatabase();
  const paciente = database.prepare('SELECT * FROM Pacientes WHERE id = ?').get(id) as Paciente | null;
  
  if (paciente) {
    paciente.ingredientesEvitar = getIngredientesEvitarByPaciente(paciente.id);
  }
  
  return paciente;
}

export function createPaciente(nombre: string, ingredientesEvitarIds?: number[]): number {
  const database = getDatabase();
  console.log('Creating paciente:', nombre, 'with ingredientes evitar:', ingredientesEvitarIds);
  const result = database.prepare('INSERT INTO Pacientes (nombre) VALUES (?)').run(nombre);
  const pacienteId = result.lastInsertRowid as number;
  
  // Add ingredientes evitar
  if (ingredientesEvitarIds && ingredientesEvitarIds.length > 0) {
    console.log(`Adding ${ingredientesEvitarIds.length} ingredientes evitar to paciente ${pacienteId}`);
    addIngredientesEvitar(pacienteId, ingredientesEvitarIds);
  }
  
  return pacienteId;
}

export function updatePaciente(id: number, nombre: string, ingredientesEvitarIds?: number[]): boolean {
  const database = getDatabase();
  const result = database.prepare('UPDATE Pacientes SET nombre = ? WHERE id = ?').run(nombre, id);
  
  if (result.changes > 0) {
    // Update ingredientes evitar
    // First, remove all existing
    database.prepare('DELETE FROM PacienteIngredientesEvitar WHERE idPaciente = ?').run(id);
    
    // Then add new ones
    if (ingredientesEvitarIds && ingredientesEvitarIds.length > 0) {
      addIngredientesEvitar(id, ingredientesEvitarIds);
    }
  }
  
  return result.changes > 0;
}

export function deletePaciente(id: number): boolean {
  const database = getDatabase();
  const result = database.prepare('DELETE FROM Pacientes WHERE id = ?').run(id);
  return result.changes > 0;
}

// Ingredientes Evitar functions
export function getIngredientesEvitarByPaciente(idPaciente: number): IngredienteEvitar[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT i.id, i.nombre 
    FROM PacienteIngredientesEvitar pie
    JOIN Ingredientes i ON pie.idIngrediente = i.id
    WHERE pie.idPaciente = ?
    ORDER BY i.nombre
  `).all(idPaciente) as IngredienteEvitar[];
}

export function addIngredientesEvitar(idPaciente: number, ingredienteIds: number[]): void {
  const database = getDatabase();
  const stmt = database.prepare('INSERT OR IGNORE INTO PacienteIngredientesEvitar (idPaciente, idIngrediente) VALUES (?, ?)');
  
  for (const ingredienteId of ingredienteIds) {
    stmt.run(idPaciente, ingredienteId);
  }
}

export function removeIngredienteEvitar(idPaciente: number, idIngrediente: number): boolean {
  const database = getDatabase();
  const result = database.prepare('DELETE FROM PacienteIngredientesEvitar WHERE idPaciente = ? AND idIngrediente = ?').run(idPaciente, idIngrediente);
  return result.changes > 0;
}
