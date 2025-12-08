import React, { useState, useMemo } from 'react';
import { HiXMark, HiPencil, HiTrash, HiMagnifyingGlass } from 'react-icons/hi2';

interface Ingrediente {
  id: number;
  nombre: string;
  tipo_id?: number;
  tipo?: string;
  color?: string;
}

interface IngredientesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientes: Ingrediente[];
  onEdit: (ingrediente: Ingrediente) => void;
  onDelete: (id: number, nombre: string) => Promise<void>;
  loading?: boolean;
}

export function IngredientesListModal({ 
  isOpen, 
  onClose, 
  ingredientes, 
  onEdit, 
  onDelete,
  loading = false 
}: IngredientesListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort ingredientes
  const filteredIngredientes = useMemo(() => {
    const filtered = ingredientes.filter(ing => 
      ing.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [ingredientes, searchQuery]);

  const handleDelete = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el ingrediente "${nombre}"?`)) {
      await onDelete(id, nombre);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Lista de Ingredientes
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 pb-4">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ingrediente..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredIngredientes.length} de {ingredientes.length} ingredientes
          </p>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Cargando ingredientes...</p>
            </div>
          ) : filteredIngredientes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No se encontraron ingredientes que coincidan con tu búsqueda.' : 'No hay ingredientes disponibles.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredIngredientes.map((ingrediente) => (
                    <tr key={ingrediente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ingrediente.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {ingrediente.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ingrediente.tipo ? (
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: ingrediente.color || '#6b7280' }}
                          >
                            {ingrediente.tipo}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs">Sin clasificar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEdit(ingrediente)}
                            className="inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors"
                          >
                            <HiPencil className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(ingrediente.id, ingrediente.nombre)}
                            className="inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                          >
                            <HiTrash className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
