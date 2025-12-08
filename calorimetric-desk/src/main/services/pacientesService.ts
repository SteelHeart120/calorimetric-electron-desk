import { getDatabase } from './database';

export interface Paciente {
  id: number;
  nombre: string;
  created_at: string;
}

export function getAllPacientes(): Paciente[] {
  const database = getDatabase();
  return database.prepare('SELECT * FROM Pacientes ORDER BY nombre').all() as Paciente[];
}

export function getPacienteById(id: number): Paciente | null {
  const database = getDatabase();
  return database.prepare('SELECT * FROM Pacientes WHERE id = ?').get(id) as Paciente | null;
}

export function createPaciente(nombre: string): number {
  const database = getDatabase();
  const result = database.prepare('INSERT INTO Pacientes (nombre) VALUES (?)').run(nombre);
  return result.lastInsertRowid as number;
}

export function updatePaciente(id: number, nombre: string): boolean {
  const database = getDatabase();
  const result = database.prepare('UPDATE Pacientes SET nombre = ? WHERE id = ?').run(nombre, id);
  return result.changes > 0;
}

export function deletePaciente(id: number): boolean {
  const database = getDatabase();
  const result = database.prepare('DELETE FROM Pacientes WHERE id = ?').run(id);
  return result.changes > 0;
}
