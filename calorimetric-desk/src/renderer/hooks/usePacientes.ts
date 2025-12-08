import { useState, useEffect } from 'react';
import { Paciente } from '../types/electron';

export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI?.pacientes.getAll();
      setPacientes(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading pacientes');
      console.error('Error fetching pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const createPaciente = async (nombre: string) => {
    try {
      setError(null);
      const id = await window.electronAPI?.pacientes.create(nombre);
      await fetchPacientes();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating paciente');
      console.error('Error creating paciente:', err);
      throw err;
    }
  };

  const updatePaciente = async (id: number, nombre: string) => {
    try {
      setError(null);
      await window.electronAPI?.pacientes.update(id, nombre);
      await fetchPacientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating paciente');
      console.error('Error updating paciente:', err);
      throw err;
    }
  };

  const deletePaciente = async (id: number) => {
    try {
      setError(null);
      await window.electronAPI?.pacientes.delete(id);
      await fetchPacientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting paciente');
      console.error('Error deleting paciente:', err);
      throw err;
    }
  };

  return {
    pacientes,
    loading,
    error,
    createPaciente,
    updatePaciente,
    deletePaciente,
    refresh: fetchPacientes,
  };
}
