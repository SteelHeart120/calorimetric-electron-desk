import React, { useState, useMemo, useEffect } from 'react';
import { HiPencil, HiTrash, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import SearchBar from '../components/SearchBar';
import { AddRecipeModal } from '../components';
import { useRecipes } from '../hooks';
import { Recipe } from '../types/electron';

type MealType = 'Desayuno' | 'Comida' | 'Cena' | 'Snack' | 'Todos';

const Recetario = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MealType>('Todos');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  const { recipes, loading, error, updateRecipe, deleteRecipe, refresh } = useRecipes();
  
  const getMealTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Desayuno':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'Comida':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Cena':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'Snack':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Filter and search logic - search by nombre or ingredientes
  const filteredRecetas = useMemo(() => {
    return recipes.filter((receta) => {
      const matchesSearch = searchQuery.trim() === '' || 
        receta.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receta.ingredientes.some(ing => ing.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterType === 'Todos' || receta.tipo === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [recipes, searchQuery, filterType]);

  const handleSaveRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, recipe);
      setEditingRecipe(null);
    }
    await refresh();
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la receta "${nombre}"?`)) {
      await deleteRecipe(id);
      await refresh();
    }
  };

  const handleCardClick = (recipe: Recipe) => {
    if (recipe.link) {
      window.open(recipe.link, '_blank');
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingRecipe(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Recetario</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Gestiona todas tus recetas saludables
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre o ingrediente..."
          className="flex-1"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as MealType)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <option value="Todos">Todos</option>
          <option value="Desayuno">Desayuno</option>
          <option value="Comida">Comida</option>
          <option value="Cena">Cena</option>
          <option value="Snack">Snack</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredRecetas.length} de {recipes.length} recetas
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Cargando recetas...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Recipe Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecetas.map((receta) => (
            <div
              key={receta.id}
              className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
            >
              {/* Image */}
              <div
                className={`aspect-video w-full overflow-hidden ${receta.link ? 'cursor-pointer' : ''}`}
                onClick={() => receta.link && handleCardClick(receta)}
              >
                <img
                  src={receta.imagen ? (receta.imagen.startsWith('http') ? receta.imagen : `local-file://${receta.imagen}`) : 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+imagen'}
                  alt={receta.nombre}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Imagen+no+disponible';
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {receta.nombre}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getMealTypeColor(receta.tipo)}`}>
                        {receta.tipo}
                      </span>
                      {receta.link && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(receta);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          title="Ver receta completa"
                        >
                          <HiArrowTopRightOnSquare className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Ingredientes:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {receta.ingredientes.slice(0, 5).map((ingrediente, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: ingrediente.color || '#9CA3AF',
                          color: '#FFFFFF',
                        }}
                      >
                        {ingrediente.nombre}
                      </span>
                    ))}
                    {receta.ingredientes.length > 5 && (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        +{receta.ingredientes.length - 5} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(receta)}
                    className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600 transition-colors"
                  >
                    <HiPencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(receta.id, receta.nombre)}
                    className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && !error && filteredRecetas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron recetas que coincidan con tu búsqueda.
          </p>
        </div>
      )}

      {/* Edit Recipe Modal */}
      <AddRecipeModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRecipe}
        editMode={!!editingRecipe}
        initialData={editingRecipe || undefined}
      />
    </div>
  );
};

export default Recetario;
