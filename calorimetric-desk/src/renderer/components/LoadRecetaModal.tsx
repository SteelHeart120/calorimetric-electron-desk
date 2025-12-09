import React, { useState, useEffect, useMemo } from 'react';
import { HiXMark, HiMagnifyingGlass } from 'react-icons/hi2';
import { Recipe, RecipeIngredient } from '../types/electron';

interface LoadRecetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  menuTitle: string;
}

export const LoadRecetaModal: React.FC<LoadRecetaModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  menuTitle,
}) => {
  const [recetas, setRecetas] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceta, setSelectedReceta] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRecetas();
      setSearchQuery('');
      setSelectedReceta(null);
    }
  }, [isOpen]);

  const loadRecetas = async () => {
    setIsLoading(true);
    try {
      const allRecetas = await window.electronAPI?.recipes.getAll();
      setRecetas(allRecetas || []);
    } catch (error) {
      console.error('Error loading recetas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecetas = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return recetas.filter(r => 
      r.nombre.toLowerCase().includes(query)
    );
  }, [recetas, searchQuery]);

  const handleSelectReceta = (receta: Recipe) => {
    setSelectedReceta(receta);
  };

  const handleAgregarReceta = () => {
    if (selectedReceta) {
      console.log('Adding recipe:', selectedReceta.nombre);
      onSelectRecipe(selectedReceta);
      onClose();
    }
  };

  const getTextColor = (bgColor: string) => {
    if (!bgColor) return '#000000';
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[80vh] rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cargar Receta - {menuTitle}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Search Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <HiMagnifyingGlass className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar receta..."
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Cargando recetas...
                </div>
              ) : filteredRecetas.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No se encontraron recetas
                </div>
              ) : (
                filteredRecetas.map((receta) => (
                  <button
                    key={receta.id}
                    onClick={() => handleSelectReceta(receta)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedReceta?.id === receta.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                      {receta.nombre}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {receta.ingredientes && receta.ingredientes.length > 0 ? (
                        receta.ingredientes.map((ing, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: ing.color || '#9CA3AF',
                              color: getTextColor(ing.color || '#9CA3AF'),
                            }}
                          >
                            {ing.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Sin ingredientes</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Selected Recipe Display */}
          {selectedReceta && (
            <div className="mt-4 p-4 rounded-lg border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Receta seleccionada:
              </div>
              <div className="font-semibold text-gray-900 dark:text-white mb-3">
                {selectedReceta.nombre}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedReceta.ingredientes && selectedReceta.ingredientes.length > 0 ? (
                  selectedReceta.ingredientes.map((ing, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: ing.color || '#9CA3AF',
                        color: getTextColor(ing.color || '#9CA3AF'),
                      }}
                    >
                      {ing.nombre}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">Sin ingredientes</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregarReceta}
            disabled={!selectedReceta}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar Receta
          </button>
        </div>
      </div>
    </div>
  );
};
