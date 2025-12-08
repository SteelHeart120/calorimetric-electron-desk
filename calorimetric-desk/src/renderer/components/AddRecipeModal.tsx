import React, { useState, useMemo, useEffect } from 'react';
import { HiXMark, HiPhoto, HiMagnifyingGlass } from 'react-icons/hi2';
import { useIngredientes } from '../hooks';
import { Recipe } from '../types/electron';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  editMode?: boolean;
  initialData?: Recipe;
}

const TIPO_OPTIONS = ['Desayuno', 'Comida', 'Cena', 'Snack'];

export function AddRecipeModal({ isOpen, onClose, onSave, editMode = false, initialData }: AddRecipeModalProps) {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [selectedIngredientes, setSelectedIngredientes] = useState<string[]>(initialData?.ingredientes || []);
  const [ingredienteSearch, setIngredienteSearch] = useState('');
  const [tipo, setTipo] = useState(initialData?.tipo || 'Desayuno');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>(initialData?.imagen || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIngredienteDropdown, setShowIngredienteDropdown] = useState(false);

  const { ingredientes } = useIngredientes();

  // Create a map for quick lookup of ingrediente colors
  const ingredientesMap = useMemo(() => {
    const map = new Map<string, { color?: string; tipo?: string }>();
    ingredientes.forEach(ing => {
      map.set(ing.nombre, { color: ing.color, tipo: ing.tipo });
    });
    return map;
  }, [ingredientes]);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setSelectedIngredientes(initialData.ingredientes || []);
      setTipo(initialData.tipo || 'Desayuno');
      setImagenPreview(initialData.imagen || '');
      setLink(initialData.link || '');
      setImagenFile(null); // Reset file input when editing
    }
  }, [initialData]);

  // Filter ingredientes that haven't been selected
  const availableIngredientes = useMemo(() => {
    if (!ingredienteSearch.trim()) return [];
    return ingredientes.filter(ing => 
      !selectedIngredientes.includes(ing.nombre) &&
      ing.nombre.toLowerCase().includes(ingredienteSearch.toLowerCase())
    );
  }, [ingredientes, selectedIngredientes, ingredienteSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre de la receta es requerido');
      return;
    }

    if (selectedIngredientes.length === 0) {
      setError('Debe agregar al menos un ingrediente');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let imagenPath = imagenPreview; // Use existing path for edit mode
      
      // If new file selected, save it
      if (imagenFile) {
        const arrayBuffer = await imagenFile.arrayBuffer();
        imagenPath = await window.electronAPI.saveRecipeImage(arrayBuffer, imagenFile.name);
      }
      
      await onSave({
        nombre: nombre.trim(),
        tipo,
        tiempo_preparacion: '',
        calorias: 0,
        imagen: imagenPath,
        link: link.trim() || undefined,
        ingredientes: selectedIngredientes,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNombre('');
      setSelectedIngredientes([]);
      setIngredienteSearch('');
      setTipo('Desayuno');
      setImagenFile(null);
      setImagenPreview('');
      setLink('');
      setError(null);
      setShowIngredienteDropdown(false);
      onClose();
    }
  };

  const addIngrediente = (ingrediente: string) => {
    setSelectedIngredientes([...selectedIngredientes, ingrediente]);
    setIngredienteSearch('');
    setShowIngredienteDropdown(false);
  };

  const removeIngrediente = (ingrediente: string) => {
    setSelectedIngredientes(selectedIngredientes.filter(i => i !== ingrediente));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editMode ? 'Editar Receta' : 'Nueva Receta'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de la receta <span className="text-red-500">*</span>
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
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="Ej: Ensalada César"
            />
          </div>

          {/* Ingredientes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ingredientes <span className="text-red-500">*</span>
            </label>
            
            {/* Selected Ingredientes Tags */}
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
              {selectedIngredientes.length === 0 ? (
                <span className="text-gray-400 dark:text-gray-500 text-sm">No hay ingredientes agregados</span>
              ) : (
                selectedIngredientes.map((ing) => {
                  const ingData = ingredientesMap.get(ing);
                  const bgColor = ingData?.color || '#6b7280';
                  return (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: bgColor }}
                    >
                      {ing}
                      <button
                        type="button"
                        onClick={() => removeIngrediente(ing)}
                        className="rounded-full p-0.5 transition-colors hover:bg-black/20"
                      >
                        <HiXMark className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>

            {/* Search Ingredientes */}
            <div className="relative">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={ingredienteSearch}
                  onChange={(e) => {
                    setIngredienteSearch(e.target.value);
                    setShowIngredienteDropdown(true);
                  }}
                  onFocus={() => setShowIngredienteDropdown(true)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Buscar ingredientes..."
                />
              </div>

              {/* Dropdown */}
              {showIngredienteDropdown && availableIngredientes.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-48 overflow-y-auto">
                  {availableIngredientes.map((ing) => (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => addIngrediente(ing.nombre)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 
                               transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between gap-2"
                    >
                      <span className="text-gray-900 dark:text-white">{ing.nombre}</span>
                      {ing.tipo && (
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: ing.color || '#6b7280' }}
                        >
                          {ing.tipo}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de receta <span className="text-red-500">*</span>
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {TIPO_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen File Input */}
          <div>
            <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagen
            </label>
            <div className="relative">
              <input
                type="file"
                id="imagen"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImagenFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagenPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                         disabled:opacity-50 disabled:cursor-not-allowed
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         dark:file:bg-blue-900/20 dark:file:text-blue-400
                         dark:hover:file:bg-blue-900/30"
              />
            </div>
            {imagenPreview && (
              <div className="mt-3 relative">
                <img
                  src={imagenPreview.startsWith('data:') || imagenPreview.startsWith('http') ? imagenPreview : `local-file://${imagenPreview}`}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagenFile(null);
                    setImagenPreview('');
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Link */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link (URL de la receta)
            </label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="https://ejemplo.com/receta"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 
                       bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                       rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white 
                       bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                       dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700
                       rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg hover:shadow-xl transition-all duration-200
                       flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                editMode ? 'Actualizar' : 'Guardar Receta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
