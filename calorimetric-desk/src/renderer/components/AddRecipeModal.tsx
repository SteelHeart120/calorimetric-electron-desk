import React, { useState, useMemo, useEffect } from 'react';
import { HiXMark, HiMagnifyingGlass, HiPlus } from 'react-icons/hi2';
import { useIngredientes } from '../hooks';
import { Recipe } from '../types/electron';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  editMode?: boolean;
  initialData?: Recipe;
}

interface IngredienteEntry {
  nombre: string;
  cantidad: string;
  unidad: string;
  tipo?: string;
  color?: string;
}

const TIPO_OPTIONS = ['Desayuno', 'Comida', 'Cena', 'Snack'];

const UNIDADES = [
  { value: 'g', label: 'g (gramos)' },
  { value: 'kg', label: 'kg (kilogramos)' },
  { value: 'ml', label: 'ml (mililitros)' },
  { value: 'l', label: 'l (litros)' },
  { value: 'cdita', label: 'cdita (cucharadita)' },
  { value: 'cda', label: 'cda (cucharada)' },
  { value: 'taza', label: 'taza' },
  { value: 'pz', label: 'pz (pieza)' },
  { value: 'porción', label: 'porción' },
  { value: 'libre', label: 'libre' },
];

export function AddRecipeModal({ isOpen, onClose, onSave, editMode = false, initialData }: AddRecipeModalProps) {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [ingredientesList, setIngredientesList] = useState<IngredienteEntry[]>(
    initialData?.ingredientes?.map(ing => ({
      nombre: typeof ing === 'string' ? ing : ing.nombre,
      cantidad: (ing as any).cantidad || '',
      unidad: (ing as any).unidad || 'g',
      tipo: (ing as any).tipo,
      color: (ing as any).color,
    })) || []
  );
  const [ingredienteSearch, setIngredienteSearch] = useState('');
  const [tipo, setTipo] = useState(initialData?.tipo || 'Desayuno');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>(initialData?.imagen || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIngredienteDropdown, setShowIngredienteDropdown] = useState(false);

  const { ingredientes } = useIngredientes();

  const ingredientesMap = useMemo(() => {
    const map = new Map<string, { color?: string; tipo?: string }>();
    ingredientes.forEach(ing => {
      map.set(ing.nombre, { color: ing.color, tipo: ing.tipo });
    });
    return map;
  }, [ingredientes]);

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setIngredientesList(
        initialData.ingredientes?.map(ing => ({
          nombre: typeof ing === 'string' ? ing : ing.nombre,
          cantidad: (ing as any).cantidad || '',
          unidad: (ing as any).unidad || 'g',
          tipo: (ing as any).tipo,
          color: (ing as any).color,
        })) || []
      );
      setTipo(initialData.tipo || 'Desayuno');
      setImagenPreview(initialData.imagen || '');
      setLink(initialData.link || '');
      setImagenFile(null);
    }
  }, [initialData]);

  const availableIngredientes = useMemo(() => {
    if (!ingredienteSearch.trim()) return [];
    const selectedNames = ingredientesList.map(e => e.nombre);
    return ingredientes.filter(ing =>
      !selectedNames.includes(ing.nombre) &&
      ing.nombre.toLowerCase().includes(ingredienteSearch.toLowerCase())
    );
  }, [ingredientes, ingredientesList, ingredienteSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre de la receta es requerido');
      return;
    }

    if (ingredientesList.length === 0) {
      setError('Debe agregar al menos un ingrediente');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let imagenPath = imagenPreview;
      
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
        ingredientes: ingredientesList.map(entry => {
          const ingData = ingredientesMap.get(entry.nombre);
          return {
            nombre: entry.nombre,
            tipo: entry.tipo ?? ingData?.tipo,
            color: entry.color ?? ingData?.color,
            cantidad: entry.cantidad || undefined,
            unidad: entry.unidad || undefined,
          };
        }),
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
      setIngredientesList([]);
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

  const addIngrediente = (ingNombre: string) => {
    const ingData = ingredientesMap.get(ingNombre);
    setIngredientesList(prev => [
      ...prev,
      { nombre: ingNombre, cantidad: '', unidad: 'g', tipo: ingData?.tipo, color: ingData?.color },
    ]);
    setIngredienteSearch('');
    setShowIngredienteDropdown(false);
  };

  const removeIngrediente = (ingNombre: string) => {
    setIngredientesList(prev => prev.filter(e => e.nombre !== ingNombre));
  };

  const updateIngredienteField = (ingNombre: string, field: 'cantidad' | 'unidad', value: string) => {
    setIngredientesList(prev =>
      prev.map(e => e.nombre === ingNombre ? { ...e, [field]: value } : e)
    );
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

            {/* Search Ingredientes */}
            <div className="relative mb-3">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={ingredienteSearch}
                onChange={(e) => { setIngredienteSearch(e.target.value); setShowIngredienteDropdown(true); }}
                onFocus={() => setShowIngredienteDropdown(true)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                         disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Buscar y agregar ingrediente..."
              />
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
                      <div className="flex items-center gap-2">
                        {ing.tipo && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: ing.color || '#6b7280' }}
                          >
                            {ing.tipo}
                          </span>
                        )}
                        <HiPlus className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients list with quantity */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {ingredientesList.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900">
                  Busca y agrega ingredientes arriba
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_110px_130px_36px] gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700/60 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <span>Ingrediente</span>
                    <span>Cantidad</span>
                    <span>Unidad</span>
                    <span />
                  </div>
                  {ingredientesList.map((entry) => (
                    <div
                      key={entry.nombre}
                      className="grid grid-cols-[1fr_110px_130px_36px] gap-2 items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      {/* Nombre */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: entry.color || '#6b7280' }}
                        />
                        <span className="text-sm text-gray-900 dark:text-white truncate">{entry.nombre}</span>
                      </div>
                      {/* Cantidad */}
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={entry.cantidad}
                        onChange={(e) => updateIngredienteField(entry.nombre, 'cantidad', e.target.value)}
                        disabled={loading}
                        placeholder="0"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {/* Unidad */}
                      <select
                        value={entry.unidad}
                        onChange={(e) => updateIngredienteField(entry.nombre, 'unidad', e.target.value)}
                        disabled={loading}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {UNIDADES.map(u => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>
                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeIngrediente(entry.nombre)}
                        disabled={loading}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        <HiXMark className="w-4 h-4" />
                      </button>
                    </div>
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
