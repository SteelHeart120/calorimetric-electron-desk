import { useState, useEffect } from 'react';
import { Ingrediente } from '../types/electron';

export function useIngredientes() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI?.ingredientes.getAll();
      setIngredientes(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading ingredientes');
      console.error('Error fetching ingredientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredientes();
  }, []);

  return {
    ingredientes,
    loading,
    error,
    refresh: fetchIngredientes,
  };
}
