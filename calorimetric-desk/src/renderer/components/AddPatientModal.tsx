import React, { useState, useEffect, useMemo } from 'react';
import { HiOutlineX } from 'react-icons/hi';

interface Ingrediente {
  id: number;
  nombre: string;
}

interface Paciente {
  id: number;
  nombre: string;
  ingredientesEvitar?: Ingrediente[];
}

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  paciente?: Paciente | null;
}

export function AddPatientModal({ isOpen, onClose, onSave, paciente }: AddPatientModalProps) {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allIngredientes, setAllIngredientes] = useState<Ingrediente[]>([]);
  const [ingredientesEvitar, setIngredientesEvitar] = useState<Ingrediente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Load ingredientes on mount
  useEffect(() => {
    const loadIngredientes = async () => {
      try {
        const ingredientes = await window.electronAPI?.ingredientes.getAll();
        if (ingredientes) {
          setAllIngredientes(ingredientes);
        }
      } catch (error) {
        console.error('Error loading ingredientes:', error);
      }
    };
    loadIngredientes();
  }, []);

  // Set initial values when editing
  useEffect(() => {
    if (paciente) {
      setNombre(paciente.nombre);
      setIngredientesEvitar(paciente.ingredientesEvitar || []);
    } else {
      setNombre('');
      setIngredientesEvitar([]);
    }
  }, [paciente, isOpen]);

  // Filter ingredientes based on search term
  const filteredIngredientes = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const evitarIds = new Set(ingredientesEvitar.map(i => i.id));
    return allIngredientes.filter(ing => 
      !evitarIds.has(ing.id) &&
      ing.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
  }, [searchTerm, allIngredientes, ingredientesEvitar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre del paciente es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const ingredientesEvitarIds = ingredientesEvitar.map(i => i.id);
      
      if (paciente) {
        // Update existing paciente
        await window.electronAPI?.pacientes.update(paciente.id, nombre.trim(), ingredientesEvitarIds);
      } else {
        // Create new paciente
        await window.electronAPI?.pacientes.create(nombre.trim(), ingredientesEvitarIds);
      }
      
      await onSave();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNombre('');
      setIngredientesEvitar([]);
      setSearchTerm('');
      setShowDropdown(false);
      setError(null);
      onClose();
    }
  };

  const handleAddIngrediente = (ingrediente: Ingrediente) => {
    setIngredientesEvitar([...ingredientesEvitar, ingrediente]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveIngrediente = (id: number) => {
    setIngredientesEvitar(ingredientesEvitar.filter(i => i.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {paciente ? 'Editar Paciente' : 'Agregar Paciente'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="nombre" 
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nombre del Paciente
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
              placeholder="Ingrese el nombre completo"
              autoFocus
            />
          </div>

          {/* Evitar Ingredientes Section */}
          <div className="mb-4">
            <label 
              htmlFor="ingredientes-search" 
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Evitar Ingredientes
            </label>
            
            {/* Tags Display */}
            {ingredientesEvitar.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {ingredientesEvitar.map((ingrediente) => (
                  <span
                    key={ingrediente.id}
                    className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {ingrediente.nombre}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngrediente(ingrediente.id)}
                      className="hover:text-red-900 dark:hover:text-red-200"
                    >
                      <HiOutlineX className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                id="ingredientes-search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                disabled={loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                placeholder="Buscar ingrediente..."
              />
              
              {/* Dropdown */}
              {showDropdown && filteredIngredientes.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {filteredIngredientes.map((ingrediente) => (
                    <button
                      key={ingrediente.id}
                      type="button"
                      onClick={() => handleAddIngrediente(ingrediente)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      {ingrediente.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
