import React, { useState, useMemo, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiDocumentPlus } from 'react-icons/hi2';
import { Tabs } from '../components';
import { usePacientes } from '../hooks';
import { AddPatientModal } from '../components/AddPatientModal';
import { LoadRecetaModal } from '../components/LoadRecetaModal';
import { RecipeIngredient, TipoIngrediente } from '../types/electron';

// COLOR_OPTIONS will be populated from database
let COLOR_OPTIONS: { value: string; label: string }[] = [];

interface MealItem {
  codigo: string;
  cantidad: string;
  nombre: string;
  color: string;
}

interface MealTable {
  title: string;
  items: MealItem[];
  headerColor: 'green' | 'pink';
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Menu');
  const [pacienteSearch, setPacienteSearch] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState<{ id: number; nombre: string } | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<{ tableIndex: number; itemIndex: number } | null>(null);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [isLoadRecetaModalOpen, setIsLoadRecetaModalOpen] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState<number | null>(null);

  const { pacientes, createPaciente, refresh: refreshPacientes } = usePacientes();

  // Load tipos from database on mount
  useEffect(() => {
    const loadTipos = async () => {
      try {
        const tipos = await window.electronAPI?.tiposIngrediente.getAll();
        if (tipos) {
          COLOR_OPTIONS = tipos.map(t => ({ value: t.color, label: t.nombre }));
        }
      } catch (error) {
        console.error('Error loading tipos:', error);
      }
    };
    loadTipos();
  }, []);

  // Listen for menu event to show add patient modal
  useEffect(() => {
    const handleShowAddPatient = () => {
      setIsAddPatientModalOpen(true);
    };

    window.electronAPI?.onShowAddPatient(handleShowAddPatient);

    return () => {
      window.electronAPI?.removeAllListeners('show-add-patient');
    };
  }, []);

  // Filter patients based on search
  const filteredPacientes = useMemo(() => {
    console.log('Filtering patients:', { pacienteSearch, totalPacientes: pacientes.length });
    if (!pacienteSearch.trim()) return [];
    
    // If a patient is selected and the search matches exactly, don't show dropdown
    if (selectedPaciente && pacienteSearch === selectedPaciente.nombre) {
      return [];
    }
    
    const filtered = pacientes.filter(p => 
      p.nombre.toLowerCase().includes(pacienteSearch.toLowerCase())
    );
    console.log('Filtered results:', filtered.length);
    return filtered;
  }, [pacientes, pacienteSearch, selectedPaciente]);

  const handleSavePatient = async (nombre: string) => {
    await createPaciente(nombre);
    await refreshPacientes();
  };

  const handleSelectPaciente = (paciente: { id: number; nombre: string }) => {
    setSelectedPaciente(paciente);
    setPacienteSearch(paciente.nombre);
    // Close dropdown by clearing the filtered list
    // The dropdown will close because filteredPacientes will be empty when exact match
  };

  // Initialize meal tables with empty items
  const initialMealTables: MealTable[] = [
    // Row 1 - Desayuno (Green)
    { title: 'Desayuno I', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Desayuno II', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Desayuno III', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Desayuno IV', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Desayuno V', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    
    // Row 2 - Almuerzo (Pink)
    { title: 'Almuerzo I', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    { title: 'Almuerzo II', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    { title: 'Almuerzo III', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    { title: 'Almuerzo IV', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    { title: 'Almuerzo V', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    
    // Row 3 - Comida (Green)
    { title: 'Comida I', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Comida II', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Comida III', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Comida IV', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Comida V', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    
    // Row 4 - Post-entreno (Pink)
    { title: 'Post-entreno I', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    { title: 'Post-entreno II', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    { title: 'Post-entreno III', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    { title: 'Post-entreno IV', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    { title: 'Post-entreno V', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'pink' },
    
    // Row 5 - Cena (Green)
    { title: 'Cena I', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Cena II', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Cena III', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Cena IV', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
    { title: 'Cena V', items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }], headerColor: 'green' },
  ];

  const [mealTables, setMealTables] = useState<MealTable[]>(initialMealTables);

  const tabs = [
    { name: 'Menu', current: activeTab === 'Menu' },
    { name: 'Patron/Macros', current: activeTab === 'Patron/Macros' },
  ];

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleAddMenu = () => {
    console.log('Agregar nuevo menú');
  };

  const handleSaveMenu = () => {
    console.log('Guardar menú', mealTables);
  };

  const handleCellChange = (tableIndex: number, itemIndex: number, field: keyof MealItem, value: string) => {
    const newTables = [...mealTables];
    newTables[tableIndex].items[itemIndex][field] = value;
    setMealTables(newTables);
  };

  const getTextColor = (bgColor: string) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const handleColorSelect = (tableIndex: number, itemIndex: number, color: string) => {
    handleCellChange(tableIndex, itemIndex, 'color', color);
    setColorPickerOpen(null);
  };

  const handleRightClick = (e: React.MouseEvent, tableIndex: number, itemIndex: number) => {
    e.preventDefault();
    setColorPickerPosition({ x: e.clientX, y: e.clientY });
    setColorPickerOpen({ tableIndex, itemIndex });
  };

  // Close color picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setColorPickerOpen(null);
    if (colorPickerOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [colorPickerOpen]);

  // Listen for save menu event from Electron menu
  React.useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onSaveMenu(() => {
        handleSaveMenu();
      });

      return () => {
        window.electronAPI.removeAllListeners('save-menu');
      };
    }
  }, [mealTables]);

  const handleAddRow = (tableIndex: number) => {
    const newTables = [...mealTables];
    newTables[tableIndex].items.push({ codigo: '', cantidad: '', nombre: '', color: '#EF4444' });
    setMealTables(newTables);
  };

  const handleDeleteRow = (tableIndex: number, itemIndex: number) => {
    const newTables = [...mealTables];
    if (newTables[tableIndex].items.length > 1) {
      newTables[tableIndex].items.splice(itemIndex, 1);
      setMealTables(newTables);
    }
  };

  const handleLoadReceta = (menuIndex: number) => {
    setSelectedMenuIndex(menuIndex);
    setIsLoadRecetaModalOpen(true);
  };

  const handleAddRecipeIngredients = (ingredients: RecipeIngredient[]) => {
    if (selectedMenuIndex === null) return;
    
    console.log('Adding ingredients to menu index:', selectedMenuIndex);
    console.log('Ingredients received:', ingredients);
    
    const newTables = [...mealTables];
    const newItems = ingredients.map(ing => ({
      codigo: '',
      cantidad: '',
      nombre: ing.nombre,
      color: ing.color || '#9CA3AF',
    }));
    
    console.log('New items created:', newItems);
    
    // Replace existing items or add if there's only one empty item
    if (newTables[selectedMenuIndex].items.length === 1 && 
        newTables[selectedMenuIndex].items[0].nombre === '') {
      newTables[selectedMenuIndex].items = newItems;
    } else {
      newTables[selectedMenuIndex].items.push(...newItems);
    }
    
    console.log('Updated menu table:', newTables[selectedMenuIndex]);
    setMealTables(newTables);
  };

  const getHeaderColorClasses = (color: 'green' | 'pink') => {
    return color === 'green'
      ? 'bg-emerald-500 text-white dark:bg-emerald-600'
      : 'bg-pink-500 text-white dark:bg-pink-600';
  };

  const renderMenuView = () => {
    // Group tables into rows of 5
    const rows = [];
    for (let i = 0; i < mealTables.length; i += 5) {
      rows.push(mealTables.slice(i, i + 5));
    }

    return (
      <div className="space-y-0">
        {/* Cargar Receta Button */}
        <div className="mb-4 flex justify-start">
          <button
            onClick={() => console.log('Cargar receta')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cargar Receta
          </button>
        </div>

        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-1 gap-0 lg:grid-cols-5">
            {row.map((table, tableIndex) => {
              const actualTableIndex = rowIndex * 5 + tableIndex;
              return (
                <div
                  key={actualTableIndex}
                  className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
                >
                  {/* Table Header */}
                  <div className={`flex items-center justify-between px-4 py-1.5 text-sm font-semibold ${getHeaderColorClasses(table.headerColor)}`}>
                    <span className="flex-1 text-center">{table.title}</span>
                    <button
                      onClick={() => handleLoadReceta(actualTableIndex)}
                      className="ml-2 rounded p-1 hover:bg-white/20 transition-colors"
                      title="Cargar Receta"
                    >
                      <HiDocumentPlus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="w-16 px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Codigo
                          </th>
                          <th className="w-16 px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Cantidad
                          </th>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Nombre
                          </th>
                          <th className="w-10 px-2 py-1">
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {table.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td className="w-16 px-2 py-1">
                              <input
                                type="text"
                                value={item.codigo}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Only allow numbers
                                  if (value === '' || /^\d+$/.test(value)) {
                                    handleCellChange(actualTableIndex, itemIndex, 'codigo', value);
                                  }
                                }}
                                onContextMenu={(e) => handleRightClick(e, actualTableIndex, itemIndex)}
                                style={{
                                  backgroundColor: item.color,
                                  color: getTextColor(item.color),
                                }}
                                className="w-full rounded border border-gray-300 px-2 py-0.5 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="0"
                                title="Click derecho para cambiar color"
                              />
                            </td>
                            <td className="w-16 px-2 py-1">
                              <input
                                type="number"
                                value={item.cantidad}
                                onChange={(e) =>
                                  handleCellChange(actualTableIndex, itemIndex, 'cantidad', e.target.value)
                                }
                                className="w-full rounded border-gray-300 bg-transparent px-2 py-0.5 text-xs text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:text-white"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                value={item.nombre}
                                onChange={(e) =>
                                  handleCellChange(actualTableIndex, itemIndex, 'nombre', e.target.value)
                                }
                                className="w-full rounded border-gray-300 bg-transparent px-2 py-0.5 text-xs text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:text-white"
                              />
                            </td>
                            <td className="w-10 px-2 py-1">
                              <button
                                onClick={() => handleDeleteRow(actualTableIndex, itemIndex)}
                                className="rounded p-0.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                title="Eliminar fila"
                              >
                                <HiOutlineTrash className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Row Button */}
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-1.5 dark:border-gray-700 dark:bg-gray-900">
                    <button
                      onClick={() => handleAddRow(actualTableIndex)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <HiOutlinePlus className="h-3 w-3" />
                      Agregar fila
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSaveMenu}
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Guardar Menu
          </button>
        </div>

        {/* Color Picker Dropdown */}
        {colorPickerOpen && (
          <div
            style={{
              position: 'fixed',
              left: `${colorPickerPosition.x}px`,
              top: `${colorPickerPosition.y}px`,
              zIndex: 1000,
            }}
            className="rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              <div className="mb-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                Seleccionar Color
              </div>
              <div className="grid grid-cols-3 gap-1">
                {COLOR_OPTIONS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    onClick={() =>
                      handleColorSelect(
                        colorPickerOpen.tableIndex,
                        colorPickerOpen.itemIndex,
                        colorOption.value
                      )
                    }
                    style={{ backgroundColor: colorOption.value }}
                    className="h-8 rounded border border-gray-300 hover:scale-110 transition-transform dark:border-gray-600"
                    title={colorOption.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPatronMacrosView = () => {
    return (
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Macros Section - Left */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Macros</h2>
          <div className="overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr className="divide-x divide-gray-300 dark:divide-gray-700">
                  <th className="w-48 px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-700">
                    Grupo de alimento
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-700">
                    Intercambios
                  </th>
                  <th className="bg-purple-500 px-3 py-2 text-center text-xs font-semibold text-white border-r-2 border-purple-600">
                    Carbohidratos
                  </th>
                  <th className="bg-red-500 px-3 py-2 text-center text-xs font-semibold text-white border-r-2 border-red-600">
                    Proteinas
                  </th>
                  <th className="bg-orange-500 px-3 py-2 text-center text-xs font-semibold text-white border-r-2 border-orange-600">
                    Lipidos
                  </th>
                  <th className="bg-green-500 px-3 py-2 text-center text-xs font-semibold text-white">
                    Calorias
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Lacteos</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-1.5 text-xs text-gray-900 dark:text-white pl-8">Leche entera</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-1.5 text-xs text-gray-900 dark:text-white pl-8">Leche Semidescremada</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-1.5 text-xs text-gray-900 dark:text-white pl-8">Leche descremada</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Fruta</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Verdura</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Leguminosas</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400">Azucar</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Azucares sin grasa</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Azucares con grasa</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="bg-purple-500 hover:bg-purple-600">
                  <td className="px-3 py-1 text-xs font-semibold text-white">Total carbohidratos no cereales</td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                </tr>
                <tr className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-sm font-bold text-orange-600 dark:text-orange-400">Cereales y tuberculos</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Cereales sin grasa</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Cereales con grasa</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="bg-gray-500 hover:bg-gray-600">
                  <td className="px-3 py-1 text-xs font-semibold text-white">Total proteinas no animales</td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                </tr>
                <tr className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-sm font-bold text-red-600 dark:text-red-400">Animal</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Muy bajo</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Bajo</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Moderado</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Alto</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="bg-red-500 hover:bg-red-600">
                  <td className="px-3 py-1 text-xs font-semibold text-white">Total lipidos no grasas</td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Lipidos con proteina</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Lipidos</td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="bg-gray-500 hover:bg-gray-600">
                  <td className="px-3 py-1 text-xs font-bold text-white">Total</td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                  <td className="px-3 py-1 text-xs text-white"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dividing Line */}
          <div className="my-6 border-t-2 border-gray-400 dark:border-gray-600"></div>

          {/* Labels Section */}
          <div className="mb-6 flex flex-wrap gap-6">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              CALORIAS TOTALES: <span className="text-blue-600 dark:text-blue-400">0</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              MODO FIT: <span className="text-green-600 dark:text-green-400">0</span>
            </div>
          </div>

          {/* Two Tables Side by Side - Macronutrients and Reference */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Left Table - Macronutrients */}
            <div className="flex-shrink-0 overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <table className="divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-400 dark:bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-white">Macronutriente</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-white">%</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-white">Calorias</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-white">Gramos</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-white">%</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-white">Cal</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-white">G</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="bg-pink-400 hover:bg-pink-500 transition-colors">
                    <td className="px-4 py-2 text-xs font-medium text-white">Carbohidratos</td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                  </tr>
                  <tr className="bg-pink-400 hover:bg-pink-500 transition-colors">
                    <td className="px-4 py-2 text-xs font-medium text-white">Proteinas</td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                  </tr>
                  <tr className="bg-pink-400 hover:bg-pink-500 transition-colors">
                    <td className="px-4 py-2 text-xs font-medium text-white">Lipidos</td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                    <td className="px-3 py-2 text-center text-xs text-white"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right Table - Reference */}
            <div className="flex-shrink-0 overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <table className="divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th colSpan={2} className="px-4 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-700">
                      Referencia de Colores
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#808080' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white">Lácteos</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#FF6363' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white">Animales</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#A52A2A' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white">Leguminosas</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#008000' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white">Verduras</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#FF8C00' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white">Cereales</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#8A2BE2' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white">Frutas</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#FFFF00' }}>
                    <td className="px-4 py-2 text-xs font-medium text-gray-900">Lípidos</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#CD661D' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white">Líp+proteína</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                  <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#00BFFF' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white">Azúcares</td>
                    <td className="px-3 py-2 text-xs w-12"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Percentage Labels */}
          <div className="mb-6 flex flex-wrap gap-6">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              % Cal Total: <span className="text-purple-600 dark:text-purple-400">0</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              % Fit Total: <span className="text-orange-600 dark:text-orange-400">0</span>
            </div>
          </div>

          {/* Macronutrientes / Kg masa Table */}
          <div className="max-w-2xl overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th colSpan={5} className="px-4 py-3 text-center text-base font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-700">
                    Macronutrientes / Kg masa
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">Masa corporal actual</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">66</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">kg</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">66</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">kg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white">Calorias</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">0</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">0</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white">Proteinas</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">0</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">0</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white">Carbohidratos</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">0</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">0</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white">Lipidos</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">0</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">0</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dividing Line - Vertical */}
        <div className="hidden lg:block w-px bg-gray-400 dark:bg-gray-600"></div>

        {/* Patron Section - Right */}
        <div className="flex-[1.5]">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Patron</h2>
          
          {/* First Table - Main Patron Table */}
          <div className="mb-6 overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full divide-y divide-gray-300 dark:divide-gray-700" style={{ tableLayout: 'fixed' }}>
              <thead>
                {/* First Header Row */}
                <tr className="divide-x divide-gray-300 dark:divide-gray-700">
                  <th className="bg-green-500 w-48 px-3 py-2 text-center text-xs font-semibold text-white">Tiempo de comida</th>
                  <th className="bg-gray-400 px-2 py-2 text-center text-xs font-semibold text-white">1</th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white"></th>
                  <th className="bg-gray-400 px-2 py-2 text-center text-xs font-semibold text-white">2</th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white"></th>
                  <th className="bg-gray-400 px-2 py-2 text-center text-xs font-semibold text-white">3</th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white"></th>
                  <th className="bg-gray-400 px-2 py-2 text-center text-xs font-semibold text-white">4</th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white"></th>
                  <th className="bg-gray-400 px-2 py-2 text-center text-xs font-semibold text-white">5</th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white"></th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white"></th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white"></th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white"></th>
                  <th className="bg-green-500 px-2 py-2 text-center text-xs font-semibold text-white">Calorias</th>
                </tr>
                {/* Second Header Row */}
                <tr className="divide-x divide-gray-300 bg-gray-100 dark:divide-gray-700 dark:bg-gray-900">
                  <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-900 dark:text-white">Grupo alimenticio</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">Equiv</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">ene</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">Equiv</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">ene</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">Equiv</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">ene</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">Equiv</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">ene</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">Equiv</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">ene</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white"></th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white"></th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white"></th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Lacteos</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Frutas</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Verduras</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Leguminosas</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Cereales sin grasa</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Cereales con grasa</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Azucares sin grasa</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">AOA Moderado en grasa</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">AOA bajo en grasa</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">AOA muy bajo en grasa</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Lipidos con proteina</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Lipidos</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 bg-gray-100 hover:bg-gray-200 dark:divide-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white">Calorias Totales</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 bg-gray-100 hover:bg-gray-200 dark:divide-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white">% de la dieta</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Second Table - Grupo Alimenticio Summary */}
          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
                {/* First Header Row - Full Width */}
                <tr>
                  <th colSpan={6} className="bg-gray-100 px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:bg-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-700">
                    Grupo Alimenticio
                  </th>
                </tr>
                {/* Second Header Row - Individual Columns */}
                <tr className="divide-x divide-gray-300 bg-gray-50 dark:divide-gray-700 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white">Tiempo</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">1</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">2</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">3</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">4</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">Lacteos</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">Frutas</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">Verduras</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">Leguminosas</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">Cereales</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">Azucares</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">AOAM</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">AOAB</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">AOAMB</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">Lipidos</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">Lip/Pt</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-xs relative">
          <label htmlFor="paciente-search" className="sr-only">
            Buscar Paciente
          </label>
          <input
            type="text"
            id="paciente-search"
            value={pacienteSearch}
            onChange={(e) => setPacienteSearch(e.target.value)}
            placeholder="Paciente"
            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
          
          {/* Patient dropdown */}
          {filteredPacientes.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {filteredPacientes.map((paciente) => (
                <button
                  key={paciente.id}
                  onClick={() => handleSelectPaciente(paciente)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {paciente.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleAddMenu}
          className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <HiOutlinePlus className="h-5 w-5" />
          Agregar Menu
        </button>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSave={handleSavePatient}
      />

      {/* Load Receta Modal */}
      <LoadRecetaModal
        isOpen={isLoadRecetaModalOpen}
        onClose={() => {
          setIsLoadRecetaModalOpen(false);
          setSelectedMenuIndex(null);
        }}
        onSelectRecipe={handleAddRecipeIngredients}
        menuTitle={selectedMenuIndex !== null ? mealTables[selectedMenuIndex]?.title || '' : ''}
      />

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="mt-6">
        {selectedPaciente ? (
          activeTab === 'Menu' ? renderMenuView() : renderPatronMacrosView()
        ) : (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 dark:border-gray-600 dark:bg-gray-800">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                No se ha seleccionado paciente
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Busca y selecciona un paciente para comenzar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
