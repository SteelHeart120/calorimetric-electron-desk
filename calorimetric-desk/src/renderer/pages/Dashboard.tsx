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
  recipeTitle?: string;
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [tipos, setTipos] = useState<TipoIngrediente[]>([]);

  const { pacientes, createPaciente, refresh: refreshPacientes } = usePacientes();

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load tipos from database on mount
  useEffect(() => {
    const loadTipos = async () => {
      try {
        const tipos = await window.electronAPI?.tiposIngrediente.getAll();
        console.log('Loaded tipos ingrediente:', tipos);
        if (tipos) {
          COLOR_OPTIONS = tipos.map(t => ({ value: t.color, label: t.nombre }));
          setTipos(tipos);
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

  const handleSelectPaciente = async (paciente: { id: number; nombre: string }) => {
    setSelectedPaciente(paciente);
    setPacienteSearch(paciente.nombre);
    // Close dropdown by clearing the filtered list
    // The dropdown will close because filteredPacientes will be empty when exact match
    
    // Load saved menu for this patient
    try {
      const savedMenu = await window.electronAPI?.menu.getByPaciente(paciente.id);
      if (savedMenu && savedMenu.length > 0) {
        // Reconstruct mealTables from saved menu
        const newTables = [...initialMealTables];
        
        // Group menu items by tiempo
        const menuByTiempo: { [key: string]: any[] } = {};
        const recipeTitlesByTiempo: { [key: string]: string } = {};
        savedMenu.forEach((item: any) => {
          if (!menuByTiempo[item.tiempoName]) {
            menuByTiempo[item.tiempoName] = [];
          }
          menuByTiempo[item.tiempoName].push({
            codigo: item.Codigo?.toString() || '',
            cantidad: item.Cantidad?.toString() || '',
            nombre: item.Nombre || '',
            color: item.tipoColor || '#9CA3AF',
          });
          // Store recipeTitle (same for all items in a tiempo)
          if (item.RecipeTitle && !recipeTitlesByTiempo[item.tiempoName]) {
            recipeTitlesByTiempo[item.tiempoName] = item.RecipeTitle;
          }
        });
        
        // Update tables with saved data
        newTables.forEach((table) => {
          if (menuByTiempo[table.title]) {
            table.items = menuByTiempo[table.title];
            table.recipeTitle = recipeTitlesByTiempo[table.title];
          }
        });
        
        setMealTables(newTables);
        console.log('Menu cargado para paciente:', paciente.nombre);
      } else {
        // Reset to initial state if no saved menu
        setMealTables(initialMealTables);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      setMealTables(initialMealTables);
    }
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

  const handleSaveMenu = async () => {
    if (!selectedPaciente) {
      showToast('Por favor selecciona un paciente primero', 'error');
      return;
    }

    try {
      // Prepare menu items with tiempo names
      const items: any[] = [];
      
      mealTables.forEach((table) => {
        table.items.forEach((item) => {
          items.push({
            codigo: item.codigo,
            cantidad: item.cantidad,
            nombre: item.nombre,
            color: item.color,
            tiempoName: table.title, // Include the tiempo name
            recipeTitle: table.recipeTitle || null,
          });
        });
      });

      const menuData = {
        idPaciente: selectedPaciente.id,
        items: items,
      };

      await window.electronAPI?.menu.save(menuData);
      showToast('Menú guardado exitosamente', 'success');
      console.log('Menú guardado:', menuData);
    } catch (error) {
      console.error('Error al guardar menú:', error);
      showToast('Error al guardar el menú', 'error');
    }
  };

  const handleCellChange = (tableIndex: number, itemIndex: number, field: keyof MealItem, value: string) => {
    setMealTables(prevTables => {
      const newTables = prevTables.map((table, tIdx) => {
        if (tIdx !== tableIndex) return table;
        
        return {
          ...table,
          items: table.items.map((item, iIdx) => {
            if (iIdx !== itemIndex) return item;
            return { ...item, [field]: value };
          })
        };
      });
      
      return newTables;
    });
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

  const handleAddRecipeIngredients = (recipe: any) => {
    if (selectedMenuIndex === null) return;
    
    console.log('Adding recipe to menu index:', selectedMenuIndex);
    console.log('Recipe:', recipe);
    
    // Use setTimeout to ensure modal closes properly before state update
    setTimeout(() => {
      const newTables = [...mealTables];
      const newItems = recipe.ingredientes.map((ing: RecipeIngredient) => ({
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
        newTables[selectedMenuIndex].items = newItems;
      }
      
      // Set recipe title
      newTables[selectedMenuIndex].recipeTitle = recipe.nombre;
      
      console.log('Updated menu table:', newTables[selectedMenuIndex]);
      setMealTables(newTables);
      showToast(`Receta "${recipe.nombre}" cargada exitosamente`, 'success');
    }, 100);
  };

  // TEST FUNCTION: Fill all menus with random recipes
  const handleFillTestData = async () => {
    try {
      const recipes = await window.electronAPI?.recipes.getAll();
      if (!recipes || recipes.length === 0) {
        showToast('No hay recetas disponibles', 'error');
        return;
      }

      const newTables = [...mealTables];
      
      newTables.forEach((table, tableIndex) => {
        // Get a random recipe for this menu
        const randomRecipe = recipes[tableIndex % recipes.length];
        
        // Fill with recipe ingredients
        const items = randomRecipe.ingredientes.map((ing, idx) => ({
          codigo: String(idx + 1),
          cantidad: String(Math.floor(Math.random() * 200) + 50), // Random quantity 50-250
          nombre: ing.nombre,
          color: ing.color || '#9CA3AF',
        }));
        
        newTables[tableIndex].items = items;
        newTables[tableIndex].recipeTitle = randomRecipe.nombre;
      });

      setMealTables(newTables);
      console.log('Test data filled successfully');
      showToast('Datos de prueba cargados en todos los menús', 'success');
    } catch (error) {
      console.error('Error filling test data:', error);
      showToast('Error al cargar datos de prueba', 'error');
    }
  };

  const getHeaderColorClasses = (color: 'green' | 'pink') => {
    return color === 'green'
      ? 'bg-emerald-500 text-white dark:bg-emerald-600'
      : 'bg-pink-500 text-white dark:bg-pink-600';
  };

  // Map tipo names to their colors for display
  const tipoColors = useMemo(() => {
    const colorMap: { [key: string]: string } = {};
    tipos.forEach(tipo => {
      colorMap[tipo.nombre] = tipo.color;
    });
    return colorMap;
  }, [tipos]);

  // Calculate Grupo Alimenticio sums based on menu data
  const grupoAlimenticioData = useMemo(() => {
    // Map color to tipo name for matching
    const colorToTipo: { [key: string]: string } = {};
    tipos.forEach(tipo => {
      colorToTipo[tipo.color.toUpperCase()] = tipo.nombre;
    });

    // Initialize data structure: { tipoName: [tiempo1, tiempo2, tiempo3, tiempo4, tiempo5] }
    const sums: { [key: string]: number[] } = {};
    
    // Define the tiempo groups (5 tables per tiempo)
    const tiempoGroups = [
      { name: 'Desayuno', start: 0, end: 5 },     // Tiempo 1: Desayuno I-V
      { name: 'Almuerzo', start: 5, end: 10 },    // Tiempo 2: Almuerzo I-V
      { name: 'Comida', start: 10, end: 15 },     // Tiempo 3: Comida I-V
      { name: 'Post-entreno', start: 15, end: 20 }, // Tiempo 4: Post-entreno I-V
      { name: 'Cena', start: 20, end: 25 },       // Tiempo 5: Cena I-V
    ];

    // Calculate sums for each tiempo group
    tiempoGroups.forEach((grupo, tiempoIndex) => {
      // Process tables in this tiempo group
      for (let tableIndex = grupo.start; tableIndex < grupo.end; tableIndex++) {
        const table = mealTables[tableIndex];
        if (!table) continue;

        // Process each item in the table
        table.items.forEach(item => {
          if (!item.codigo || item.codigo.trim() === '') return;
          
          const codigoValue = parseFloat(item.codigo) || 0;
          if (codigoValue === 0) return;

          // Get tipo name from color
          const tipoName = colorToTipo[item.color.toUpperCase()];
          if (!tipoName) return;

          // Initialize array if needed
          if (!sums[tipoName]) {
            sums[tipoName] = [0, 0, 0, 0, 0];
          }

          // Add to the appropriate tiempo
          sums[tipoName][tiempoIndex] += codigoValue;
        });
      }
    });

    return sums;
  }, [mealTables, tipos]);

  // Calculate totals for Calorias Totales and % de la dieta rows
  const patronTotals = useMemo(() => {
    const foodGroups = ['Lácteos', 'Frutas', 'Verduras', 'Leguminosas', 'Cereales', 'Azúcares', 'AOAM', 'AOAB', 'AOAMB', 'Lípidos', 'Líp+proteína'];
    const valuesPerGroup = [95, 60, 25, 60, 95, 40, 45, 45, 90, 45, 70]; // Corresponding values for ene calculation
    // Calculate ene values for each tiempo (columns 2, 4, 6, 8, 10)
    const eneByTiempo = [0, 0, 0, 0, 0]; // 5 tiempos
    const caloriasByGroup: number[] = [];
    
    foodGroups.forEach(group => {
      let groupCaloriesTotal = 0;
      for (let i = 0; i < 5; i++) {
        const eneValue = (((grupoAlimenticioData[group]?.[i] || 0) / 7) * valuesPerGroup[foodGroups.indexOf(group)]);
        eneByTiempo[i] += eneValue;
        groupCaloriesTotal += eneValue;
      }
      caloriasByGroup.push(groupCaloriesTotal);
    });
    
    // Total calories (sum of all Calorias column)
    const totalCalorias = caloriasByGroup.reduce((sum, val) => sum + val, 0);
    
    // Calculate % de la dieta for each tiempo
    const percentByTiempo = eneByTiempo.map(eneVal => 
      totalCalorias > 0 ? (eneVal * 1 / totalCalorias) * 100 : 0
    );
    
    // Total % (sum of all %)
    const totalPercent = percentByTiempo.reduce((sum, val) => sum + val, 0);
    
    return {
      eneByTiempo,
      totalCalorias,
      percentByTiempo,
      totalPercent
    };
  }, [grupoAlimenticioData]);

  const renderMenuView = () => {
    // Group tables into rows of 5
    const rows = [];
    for (let i = 0; i < mealTables.length; i += 5) {
      rows.push(mealTables.slice(i, i + 5));
    }

    return (
      <div className="space-y-0">
        {/* Color Reference */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Referencia de Colores:</h3>
          <div className="flex flex-wrap gap-3">
            {tipos.map((tipo) => (
              <div key={tipo.id} className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: tipo.color }}
                  title={tipo.nombre}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{tipo.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Data Button */}
        <div className="mb-4 flex justify-start">
          <button
            onClick={handleFillTestData}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            🧪 Llenar con Datos de Prueba
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

                  {/* Recipe Title (if exists) */}
                  {table.recipeTitle && (
                    <div className="px-4 text-center py-1.5 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      Receta: {table.recipeTitle}
                    </div>
                  )}

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="w-16 px-2  text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Codigo
                          </th>
                          <th className="w-16 px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Cantidad
                          </th>
                          <th className="px-2 py-0.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Nombre
                          </th>
                          <th className="w-10 px-2 py-0.5">
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {table.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td className="w-16 px-2">
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
                                className="w-full rounded border border-gray-300 px-2 py-0 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="0"
                                title="Click derecho para cambiar color"
                              />
                            </td>
                            <td className="w-16 px-2 py-0.5">
                              <input
                                type="text"
                                value={item.cantidad}
                                onChange={(e) =>
                                  handleCellChange(actualTableIndex, itemIndex, 'cantidad', e.target.value)
                                }
                                className="w-full rounded border-gray-300 bg-transparent px-2 py-0 text-xs text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:text-white"
                              />
                            </td>
                            <td className="px-2 py-0.5">
                              <input
                                type="text"
                                value={item.nombre}
                                onChange={(e) =>
                                  handleCellChange(actualTableIndex, itemIndex, 'nombre', e.target.value)
                                }
                                className="w-full rounded border-gray-300 bg-transparent px-2 py-0 text-xs text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:text-white"
                              />
                            </td>
                            <td className="w-10 px-2 py-0.5">
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
                  <th className="bg-yellow-500 px-2 py-2 text-center text-xs font-semibold text-white">Calorias</th>
                  <th className="bg-gray-100 dark:bg-gray-900 px-2 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white"></th>
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
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white">Total</th>
                  <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-900 dark:text-white"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Lacteos</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lácteos']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lácteos']?.[0] || 0) / 7) * 95))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lácteos']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lácteos']?.[1] || 0) / 7) * 95))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lácteos']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lácteos']?.[2] || 0) / 7) * 95))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lácteos']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lácteos']?.[3] || 0) / 7) * 95))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lácteos']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lácteos']?.[4] || 0) / 7) * 95))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['Lácteos']?.[0] || 0) / 7) * 95)) +
                    Math.round((((grupoAlimenticioData['Lácteos']?.[1] || 0) / 7) * 95)) +
                    Math.round((((grupoAlimenticioData['Lácteos']?.[2] || 0) / 7) * 95)) +
                    Math.round((((grupoAlimenticioData['Lácteos']?.[3] || 0) / 7) * 95)) +
                    Math.round((((grupoAlimenticioData['Lácteos']?.[4] || 0) / 7) * 95))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Frutas</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Frutas']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Frutas']?.[0] || 0) / 7) * 60))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Frutas']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Frutas']?.[1] || 0) / 7) * 60))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Frutas']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Frutas']?.[2] || 0) / 7) * 60))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Frutas']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Frutas']?.[3] || 0) / 7) * 60))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Frutas']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Frutas']?.[4] || 0) / 7) * 60))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['Frutas']?.[0] || 0) / 7) * 60)) +
                    Math.round((((grupoAlimenticioData['Frutas']?.[1] || 0) / 7) * 60)) +
                    Math.round((((grupoAlimenticioData['Frutas']?.[2] || 0) / 7) * 60)) +
                    Math.round((((grupoAlimenticioData['Frutas']?.[3] || 0) / 7) * 60)) +
                    Math.round((((grupoAlimenticioData['Frutas']?.[4] || 0) / 7) * 60))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Verduras</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Verduras']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Verduras']?.[0] || 0) / 7) * 25))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Verduras']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Verduras']?.[1] || 0) / 7) * 25))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Verduras']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Verduras']?.[2] || 0) / 7) * 25))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Verduras']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Verduras']?.[3] || 0) / 7) * 25))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Verduras']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Verduras']?.[4] || 0) / 7) * 25))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['Verduras']?.[0] || 0) / 7) * 25)) +
                    Math.round((((grupoAlimenticioData['Verduras']?.[1] || 0) / 7) * 25)) +
                    Math.round((((grupoAlimenticioData['Verduras']?.[2] || 0) / 7) * 25)) +
                    Math.round((((grupoAlimenticioData['Verduras']?.[3] || 0) / 7) * 25)) +
                    Math.round((((grupoAlimenticioData['Verduras']?.[4] || 0) / 7) * 25))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Leguminosas</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Leguminosas']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Leguminosas']?.[0] || 0) / 7) * 120))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Leguminosas']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Leguminosas']?.[1] || 0) / 7) * 120))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Leguminosas']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Leguminosas']?.[2] || 0) / 7) * 120))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Leguminosas']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Leguminosas']?.[3] || 0) / 7) * 120))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Leguminosas']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Leguminosas']?.[4] || 0) / 7) * 120))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['Leguminosas']?.[0] || 0) / 7) * 120)) +
                    Math.round((((grupoAlimenticioData['Leguminosas']?.[1] || 0) / 7) * 120)) +
                    Math.round((((grupoAlimenticioData['Leguminosas']?.[2] || 0) / 7) * 120)) +
                    Math.round((((grupoAlimenticioData['Leguminosas']?.[3] || 0) / 7) * 120)) +
                    Math.round((((grupoAlimenticioData['Leguminosas']?.[4] || 0) / 7) * 120))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Cereales</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Cereales']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Cereales']?.[0] || 0) / 7) * 70))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Cereales']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Cereales']?.[1] || 0) / 7) * 70))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Cereales']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Cereales']?.[2] || 0) / 7) * 70))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Cereales']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Cereales']?.[3] || 0) / 7) * 70))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Cereales']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Cereales']?.[4] || 0) / 7) * 70))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['Cereales']?.[0] || 0) / 7) * 70)) +
                    Math.round((((grupoAlimenticioData['Cereales']?.[1] || 0) / 7) * 70)) +
                    Math.round((((grupoAlimenticioData['Cereales']?.[2] || 0) / 7) * 70)) +
                    Math.round((((grupoAlimenticioData['Cereales']?.[3] || 0) / 7) * 70)) +
                    Math.round((((grupoAlimenticioData['Cereales']?.[4] || 0) / 7) * 70))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Azucares</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Azúcares']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Azúcares']?.[0] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Azúcares']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Azúcares']?.[1] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Azúcares']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Azúcares']?.[2] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Azúcares']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Azúcares']?.[3] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Azúcares']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Azúcares']?.[4] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['Azúcares']?.[0] || 0) / 7) * 40)) +
                    Math.round((((grupoAlimenticioData['Azúcares']?.[1] || 0) / 7) * 40)) +
                    Math.round((((grupoAlimenticioData['Azúcares']?.[2] || 0) / 7) * 40)) +
                    Math.round((((grupoAlimenticioData['Azúcares']?.[3] || 0) / 7) * 40)) +
                    Math.round((((grupoAlimenticioData['Azúcares']?.[4] || 0) / 7) * 40))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">AOAM</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAM']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAM']?.[0] || 0) / 7) * 75))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAM']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAM']?.[1] || 0) / 7) * 75))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAM']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAM']?.[2] || 0) / 7) * 75))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAM']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAM']?.[3] || 0) / 7) * 75))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAM']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAM']?.[4] || 0) / 7) * 75))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['AOAM']?.[0] || 0) / 7) * 75)) +
                    Math.round((((grupoAlimenticioData['AOAM']?.[1] || 0) / 7) * 75)) +
                    Math.round((((grupoAlimenticioData['AOAM']?.[2] || 0) / 7) * 75)) +
                    Math.round((((grupoAlimenticioData['AOAM']?.[3] || 0) / 7) * 75)) +
                    Math.round((((grupoAlimenticioData['AOAM']?.[4] || 0) / 7) * 75))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">AOAB</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAB']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAB']?.[0] || 0) / 7) * 55))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAB']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAB']?.[1] || 0) / 7) * 55))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAB']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAB']?.[2] || 0) / 7) * 55))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAB']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAB']?.[3] || 0) / 7) * 55))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAB']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAB']?.[4] || 0) / 7) * 55))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['AOAB']?.[0] || 0) / 7) * 55)) +
                    Math.round((((grupoAlimenticioData['AOAB']?.[1] || 0) / 7) * 55)) +
                    Math.round((((grupoAlimenticioData['AOAB']?.[2] || 0) / 7) * 55)) +
                    Math.round((((grupoAlimenticioData['AOAB']?.[3] || 0) / 7) * 55)) +
                    Math.round((((grupoAlimenticioData['AOAB']?.[4] || 0) / 7) * 55))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">AOAMB</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAMB']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAMB']?.[0] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAMB']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAMB']?.[1] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAMB']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAMB']?.[2] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAMB']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAMB']?.[3] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['AOAMB']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['AOAMB']?.[4] || 0) / 7) * 40))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['AOAMB']?.[0] || 0) / 7) * 40)) +
                    Math.round((((grupoAlimenticioData['AOAMB']?.[1] || 0) / 7) * 40)) +
                    Math.round((((grupoAlimenticioData['AOAMB']?.[2] || 0) / 7) * 40)) +
                    Math.round((((grupoAlimenticioData['AOAMB']?.[3] || 0) / 7) * 40)) +
                    Math.round((((grupoAlimenticioData['AOAMB']?.[4] || 0) / 7) * 40))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Lipidos</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lípidos']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lípidos']?.[0] || 0) / 7) * 45))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lípidos']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lípidos']?.[1] || 0) / 7) * 45))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lípidos']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lípidos']?.[2] || 0) / 7) * 45))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lípidos']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lípidos']?.[3] || 0) / 7) * 45))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Lípidos']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Lípidos']?.[4] || 0) / 7) * 45))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['Lípidos']?.[0] || 0) / 7) * 45)) +
                    Math.round((((grupoAlimenticioData['Lípidos']?.[1] || 0) / 7) * 45)) +
                    Math.round((((grupoAlimenticioData['Lípidos']?.[2] || 0) / 7) * 45)) +
                    Math.round((((grupoAlimenticioData['Lípidos']?.[3] || 0) / 7) * 45)) +
                    Math.round((((grupoAlimenticioData['Lípidos']?.[4] || 0) / 7) * 45))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Lip/Pt</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Líp+proteína']?.[0] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Líp+proteína']?.[0] || 0) / 7) * 65))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Líp+proteína']?.[1] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Líp+proteína']?.[1] || 0) / 7) * 65))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Líp+proteína']?.[2] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Líp+proteína']?.[2] || 0) / 7) * 65))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Líp+proteína']?.[3] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Líp+proteína']?.[3] || 0) / 7) * 65))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{((grupoAlimenticioData['Líp+proteína']?.[4] || 0) / 7).toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round((((grupoAlimenticioData['Líp+proteína']?.[4] || 0) / 7) * 65))}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(
                    Math.round((((grupoAlimenticioData['Líp+proteína']?.[0] || 0) / 7) * 65)) +
                    Math.round((((grupoAlimenticioData['Líp+proteína']?.[1] || 0) / 7) * 65)) +
                    Math.round((((grupoAlimenticioData['Líp+proteína']?.[2] || 0) / 7) * 65)) +
                    Math.round((((grupoAlimenticioData['Líp+proteína']?.[3] || 0) / 7) * 65)) +
                    Math.round((((grupoAlimenticioData['Líp+proteína']?.[4] || 0) / 7) * 65))
                  )}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 bg-gray-100 hover:bg-gray-200 dark:divide-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white">Calorias Totales</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round(patronTotals.eneByTiempo[0])}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round(patronTotals.eneByTiempo[1])}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round(patronTotals.eneByTiempo[2])}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round(patronTotals.eneByTiempo[3])}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round(patronTotals.eneByTiempo[4])}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{Math.round(patronTotals.totalCalorias)}</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                </tr>
                <tr className="divide-x divide-gray-200 bg-gray-100 hover:bg-gray-200 dark:divide-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white">% de la dieta</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{patronTotals.percentByTiempo[0].toFixed(2)}%</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{patronTotals.percentByTiempo[1].toFixed(2)}%</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{patronTotals.percentByTiempo[2].toFixed(2)}%</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{patronTotals.percentByTiempo[3].toFixed(2)}%</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{patronTotals.percentByTiempo[4].toFixed(2)}%</td>
                  <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{patronTotals.totalPercent.toFixed(2)}%</td>
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
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['Lácteos'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['Lácteos'] ? getTextColor(tipoColors['Lácteos']) : 'inherit' }}>Lacteos</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lácteos'] ? getTextColor(tipoColors['Lácteos']) : 'inherit' }}>{grupoAlimenticioData['Lácteos']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lácteos'] ? getTextColor(tipoColors['Lácteos']) : 'inherit' }}>{grupoAlimenticioData['Lácteos']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lácteos'] ? getTextColor(tipoColors['Lácteos']) : 'inherit' }}>{grupoAlimenticioData['Lácteos']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lácteos'] ? getTextColor(tipoColors['Lácteos']) : 'inherit' }}>{grupoAlimenticioData['Lácteos']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lácteos'] ? getTextColor(tipoColors['Lácteos']) : 'inherit' }}>{grupoAlimenticioData['Lácteos']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['Frutas'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['Frutas'] ? getTextColor(tipoColors['Frutas']) : 'inherit' }}>Frutas</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Frutas'] ? getTextColor(tipoColors['Frutas']) : 'inherit' }}>{grupoAlimenticioData['Frutas']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Frutas'] ? getTextColor(tipoColors['Frutas']) : 'inherit' }}>{grupoAlimenticioData['Frutas']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Frutas'] ? getTextColor(tipoColors['Frutas']) : 'inherit' }}>{grupoAlimenticioData['Frutas']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Frutas'] ? getTextColor(tipoColors['Frutas']) : 'inherit' }}>{grupoAlimenticioData['Frutas']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Frutas'] ? getTextColor(tipoColors['Frutas']) : 'inherit' }}>{grupoAlimenticioData['Frutas']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['Verduras'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['Verduras'] ? getTextColor(tipoColors['Verduras']) : 'inherit' }}>Verduras</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Verduras'] ? getTextColor(tipoColors['Verduras']) : 'inherit' }}>{grupoAlimenticioData['Verduras']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Verduras'] ? getTextColor(tipoColors['Verduras']) : 'inherit' }}>{grupoAlimenticioData['Verduras']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Verduras'] ? getTextColor(tipoColors['Verduras']) : 'inherit' }}>{grupoAlimenticioData['Verduras']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Verduras'] ? getTextColor(tipoColors['Verduras']) : 'inherit' }}>{grupoAlimenticioData['Verduras']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Verduras'] ? getTextColor(tipoColors['Verduras']) : 'inherit' }}>{grupoAlimenticioData['Verduras']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['Leguminosas'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['Leguminosas'] ? getTextColor(tipoColors['Leguminosas']) : 'inherit' }}>Leguminosas</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Leguminosas'] ? getTextColor(tipoColors['Leguminosas']) : 'inherit' }}>{grupoAlimenticioData['Leguminosas']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Leguminosas'] ? getTextColor(tipoColors['Leguminosas']) : 'inherit' }}>{grupoAlimenticioData['Leguminosas']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Leguminosas'] ? getTextColor(tipoColors['Leguminosas']) : 'inherit' }}>{grupoAlimenticioData['Leguminosas']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Leguminosas'] ? getTextColor(tipoColors['Leguminosas']) : 'inherit' }}>{grupoAlimenticioData['Leguminosas']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Leguminosas'] ? getTextColor(tipoColors['Leguminosas']) : 'inherit' }}>{grupoAlimenticioData['Leguminosas']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['Cereales'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['Cereales'] ? getTextColor(tipoColors['Cereales']) : 'inherit' }}>Cereales</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Cereales'] ? getTextColor(tipoColors['Cereales']) : 'inherit' }}>{grupoAlimenticioData['Cereales']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Cereales'] ? getTextColor(tipoColors['Cereales']) : 'inherit' }}>{grupoAlimenticioData['Cereales']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Cereales'] ? getTextColor(tipoColors['Cereales']) : 'inherit' }}>{grupoAlimenticioData['Cereales']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Cereales'] ? getTextColor(tipoColors['Cereales']) : 'inherit' }}>{grupoAlimenticioData['Cereales']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Cereales'] ? getTextColor(tipoColors['Cereales']) : 'inherit' }}>{grupoAlimenticioData['Cereales']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['Azúcares'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['Azúcares'] ? getTextColor(tipoColors['Azúcares']) : 'inherit' }}>Azucares</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Azúcares'] ? getTextColor(tipoColors['Azúcares']) : 'inherit' }}>{grupoAlimenticioData['Azúcares']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Azúcares'] ? getTextColor(tipoColors['Azúcares']) : 'inherit' }}>{grupoAlimenticioData['Azúcares']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Azúcares'] ? getTextColor(tipoColors['Azúcares']) : 'inherit' }}>{grupoAlimenticioData['Azúcares']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Azúcares'] ? getTextColor(tipoColors['Azúcares']) : 'inherit' }}>{grupoAlimenticioData['Azúcares']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Azúcares'] ? getTextColor(tipoColors['Azúcares']) : 'inherit' }}>{grupoAlimenticioData['Azúcares']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['AOAM'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['AOAM'] ? getTextColor(tipoColors['AOAM']) : 'inherit' }}>AOAM</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAM'] ? getTextColor(tipoColors['AOAM']) : 'inherit' }}>{grupoAlimenticioData['AOAM']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAM'] ? getTextColor(tipoColors['AOAM']) : 'inherit' }}>{grupoAlimenticioData['AOAM']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAM'] ? getTextColor(tipoColors['AOAM']) : 'inherit' }}>{grupoAlimenticioData['AOAM']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAM'] ? getTextColor(tipoColors['AOAM']) : 'inherit' }}>{grupoAlimenticioData['AOAM']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAM'] ? getTextColor(tipoColors['AOAM']) : 'inherit' }}>{grupoAlimenticioData['AOAM']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['AOAB'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['AOAB'] ? getTextColor(tipoColors['AOAB']) : 'inherit' }}>AOAB</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAB'] ? getTextColor(tipoColors['AOAB']) : 'inherit' }}>{grupoAlimenticioData['AOAB']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAB'] ? getTextColor(tipoColors['AOAB']) : 'inherit' }}>{grupoAlimenticioData['AOAB']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAB'] ? getTextColor(tipoColors['AOAB']) : 'inherit' }}>{grupoAlimenticioData['AOAB']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAB'] ? getTextColor(tipoColors['AOAB']) : 'inherit' }}>{grupoAlimenticioData['AOAB']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAB'] ? getTextColor(tipoColors['AOAB']) : 'inherit' }}>{grupoAlimenticioData['AOAB']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['AOAMB'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['AOAMB'] ? getTextColor(tipoColors['AOAMB']) : 'inherit' }}>AOAMB</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAMB'] ? getTextColor(tipoColors['AOAMB']) : 'inherit' }}>{grupoAlimenticioData['AOAMB']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAMB'] ? getTextColor(tipoColors['AOAMB']) : 'inherit' }}>{grupoAlimenticioData['AOAMB']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAMB'] ? getTextColor(tipoColors['AOAMB']) : 'inherit' }}>{grupoAlimenticioData['AOAMB']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAMB'] ? getTextColor(tipoColors['AOAMB']) : 'inherit' }}>{grupoAlimenticioData['AOAMB']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['AOAMB'] ? getTextColor(tipoColors['AOAMB']) : 'inherit' }}>{grupoAlimenticioData['AOAMB']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['Lípidos'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['Lípidos'] ? getTextColor(tipoColors['Lípidos']) : 'inherit' }}>Lipidos</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lípidos'] ? getTextColor(tipoColors['Lípidos']) : 'inherit' }}>{grupoAlimenticioData['Lípidos']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lípidos'] ? getTextColor(tipoColors['Lípidos']) : 'inherit' }}>{grupoAlimenticioData['Lípidos']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lípidos'] ? getTextColor(tipoColors['Lípidos']) : 'inherit' }}>{grupoAlimenticioData['Lípidos']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lípidos'] ? getTextColor(tipoColors['Lípidos']) : 'inherit' }}>{grupoAlimenticioData['Lípidos']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Lípidos'] ? getTextColor(tipoColors['Lípidos']) : 'inherit' }}>{grupoAlimenticioData['Lípidos']?.[4] || 0}</td>
                </tr>
                <tr className="divide-x divide-gray-200 transition-colors" style={{ backgroundColor: tipoColors['Líp+proteína'] || 'transparent' }}>
                  <td className="px-3 py-2 text-xs font-medium" style={{ color: tipoColors['Líp+proteína'] ? getTextColor(tipoColors['Líp+proteína']) : 'inherit' }}>Lip/Pt</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Líp+proteína'] ? getTextColor(tipoColors['Líp+proteína']) : 'inherit' }}>{grupoAlimenticioData['Líp+proteína']?.[0] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Líp+proteína'] ? getTextColor(tipoColors['Líp+proteína']) : 'inherit' }}>{grupoAlimenticioData['Líp+proteína']?.[1] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Líp+proteína'] ? getTextColor(tipoColors['Líp+proteína']) : 'inherit' }}>{grupoAlimenticioData['Líp+proteína']?.[2] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Líp+proteína'] ? getTextColor(tipoColors['Líp+proteína']) : 'inherit' }}>{grupoAlimenticioData['Líp+proteína']?.[3] || 0}</td>
                  <td className="px-3 py-2 text-center text-xs" style={{ color: tipoColors['Líp+proteína'] ? getTextColor(tipoColors['Líp+proteína']) : 'inherit' }}>{grupoAlimenticioData['Líp+proteína']?.[4] || 0}</td>
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
      {/* Header with Search */}
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`rounded-lg px-6 py-3 shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
