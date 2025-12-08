import React, { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';

interface Ingrediente {
  id: number;
  nombre: string;
  tipo_id?: number;
}

interface TipoIngrediente {
  id: number;
  nombre: string;
  color: string;
}

interface AddIngredienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nombre: string, tipo_id?: number) => Promise<void>;
  editMode?: boolean;
  initialData?: Ingrediente;
  tipos: TipoIngrediente[];
}

export function AddIngredienteModal({ isOpen, onClose, onSave, editMode = false, initialData, tipos }: AddIngredienteModalProps) {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [tipoId, setTipoId] = useState<number | undefined>(initialData?.tipo_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setTipoId(initialData.tipo_id);
    } else {
      setNombre('');
      setTipoId(undefined);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre del ingrediente es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(nombre.trim(), tipoId);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNombre('');
      setTipoId(undefined);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editMode ? 'Editar Ingrediente' : 'Agregar Ingrediente'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Ingrediente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Ej: Pollo, Tomate, Aguacate..."
              autoFocus
            />
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Ingrediente
            </label>
            <select
              id="tipo"
              value={tipoId || ''}
              onChange={(e) => setTipoId(e.target.value ? Number(e.target.value) : undefined)}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Sin clasificar</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                       text-gray-700 dark:text-gray-300 font-medium
                       hover:bg-gray-50 dark:hover:bg-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-gray-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              {loading ? 'Guardando...' : editMode ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
