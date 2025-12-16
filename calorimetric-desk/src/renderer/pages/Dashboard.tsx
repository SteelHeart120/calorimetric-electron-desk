import React, { useState, useMemo, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiDocumentPlus } from 'react-icons/hi2';
import { LoadMenuModal, NewMenuModal, Tabs } from '../components';
import { usePacientes } from '../hooks';
import { AddPatientModal } from '../components/AddPatientModal';
import { LoadRecetaModal } from '../components/LoadRecetaModal';
import { MenuHeader, RecipeIngredient, TipoIngrediente } from '../types/electron';

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

const ROMAN = ['I', 'II', 'III', 'IV', 'V'] as const;
const DEFAULT_MENU_TIEMPOS = ['Desayuno', 'Almuerzo', 'Comida', 'Post-entreno', 'Cena'] as const;
type MenuTiempos5 = [string, string, string, string, string];

const buildMealTables = (tiemposBase: MenuTiempos5): MealTable[] => {
  const headerColors: Array<'green' | 'pink'> = ['green', 'pink', 'green', 'pink', 'green'];
  const tables: MealTable[] = [];

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      tables.push({
        title: `${tiemposBase[row]} ${ROMAN[col]}`,
        items: [{ codigo: '', cantidad: '', nombre: '', color: '#EF4444' }],
        headerColor: headerColors[row],
      });
    }
  }

  return tables;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Menú');
  const [pacienteSearch, setPacienteSearch] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState<{ id: number; nombre: string } | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<{ tableIndex: number; itemIndex: number } | null>(null);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [isLoadRecetaModalOpen, setIsLoadRecetaModalOpen] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [tipos, setTipos] = useState<TipoIngrediente[]>([]);
  const [masaCorporalCaloriasTotales, setMasaCorporalCaloriasTotales] = useState(66);
  const [masaCorporalModoFit, setMasaCorporalModoFit] = useState(66);

  const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);
  const [currentMenuNombre, setCurrentMenuNombre] = useState<string>('');
  const [currentMenuTiempos, setCurrentMenuTiempos] = useState<MenuTiempos5>([...DEFAULT_MENU_TIEMPOS] as MenuTiempos5);
  const [isLoadMenuModalOpen, setIsLoadMenuModalOpen] = useState(false);
  const [isNewMenuModalOpen, setIsNewMenuModalOpen] = useState(false);

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

  const handleSavePatient = async () => {
    await refreshPacientes();
  };

  const handleSelectPaciente = async (paciente: { id: number; nombre: string }) => {
    setSelectedPaciente(paciente);
    setPacienteSearch(paciente.nombre);
    setCurrentMenuId(null);
    setCurrentMenuNombre('');
    setCurrentMenuTiempos([...DEFAULT_MENU_TIEMPOS] as MenuTiempos5);
    setMealTables(buildMealTables([...DEFAULT_MENU_TIEMPOS] as MenuTiempos5));
  };

  const [mealTables, setMealTables] = useState<MealTable[]>(() =>
    buildMealTables([...DEFAULT_MENU_TIEMPOS] as MenuTiempos5)
  );

  const tabs = [
    { name: 'Menú', current: activeTab === 'Menú' },
    { name: 'Macros', current: activeTab === 'Macros' },
    { name: 'Patrón', current: activeTab === 'Patrón' },
  ];

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleAddMenu = () => {
    console.log('Agregar nuevo menú');
  };

  const handleLoadMenuById = async (menuId: number) => {
    try {
      const result = await window.electronAPI?.menu.getById(menuId);
      if (!result) return;

      const header = result.menu as MenuHeader;
      const tiemposBase: MenuTiempos5 = [
        header.tiempo1,
        header.tiempo2,
        header.tiempo3,
        header.tiempo4,
        header.tiempo5,
      ];

      setCurrentMenuId(header.id);
      setCurrentMenuNombre(header.nombre);
      setCurrentMenuTiempos(tiemposBase);

      const newTables = buildMealTables(tiemposBase);

      const items = result.items || [];
      const menuByTiempo: { [key: string]: any[] } = {};
      const recipeTitlesByTiempo: { [key: string]: string } = {};

      items.forEach((item: any) => {
        const key = item.tiempoName;
        if (!menuByTiempo[key]) {
          menuByTiempo[key] = [];
        }
        menuByTiempo[key].push({
          codigo: item.Codigo?.toString() || '',
          cantidad: item.Cantidad?.toString() || '',
          nombre: item.Nombre || '',
          color: item.tipoColor || '#9CA3AF',
        });

        if (item.RecipeTitle && !recipeTitlesByTiempo[key]) {
          recipeTitlesByTiempo[key] = item.RecipeTitle;
        }
      });

      newTables.forEach((table) => {
        if (menuByTiempo[table.title]) {
          table.items = menuByTiempo[table.title];
          table.recipeTitle = recipeTitlesByTiempo[table.title];
        }
      });

      setMealTables(newTables);
      showToast('Menú cargado', 'success');
    } catch (error) {
      console.error('Error loading menu by id:', error);
      showToast('Error al cargar el menú', 'error');
    }
  };

  const handleSaveMenu = async () => {
    if (!selectedPaciente) {
      showToast('Por favor selecciona un paciente primero', 'error');
      return;
    }

    if (!currentMenuId) {
      showToast('Por favor crea o carga un menú primero', 'error');
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

      await window.electronAPI?.menu.saveItems({
        menuId: currentMenuId,
        items,
      });
      showToast('Menú guardado exitosamente', 'success');
      console.log('Menú guardado:', { menuId: currentMenuId, itemsCount: items.length });
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
  }, [mealTables, currentMenuId, selectedPaciente]);

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
      { name: currentMenuTiempos[0], start: 0, end: 5 },
      { name: currentMenuTiempos[1], start: 5, end: 10 },
      { name: currentMenuTiempos[2], start: 10, end: 15 },
      { name: currentMenuTiempos[3], start: 15, end: 20 },
      { name: currentMenuTiempos[4], start: 20, end: 25 },
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
  }, [mealTables, tipos, currentMenuTiempos]);

  // Calculate sum of all Equiv for each food group across all tiempo columns
  const equivByGroupsDict = useMemo(() => {
    const dict: { [key: string]: number } = {};
    const foodGroups = ['Lácteos', 'Frutas', 'Verduras', 'Leguminosas', 'Cereales', 'Azúcares', 'AOAM', 'AOAB', 'AOAMB', 'Lípidos', 'Líp+proteína'];
    
    foodGroups.forEach(group => {
      let totalEquiv = 0;
      for (let i = 0; i < 5; i++) {
        totalEquiv += ((grupoAlimenticioData[group]?.[i] || 0) / 7);
      }
      dict[group] = totalEquiv;
    });
    
    return dict;
  }, [grupoAlimenticioData]);

  // Calculate totals for Calorias Totales and % de la dieta rows
  const patronTotals = useMemo(() => {
    const foodGroups = ['Lácteos', 'Frutas', 'Verduras', 'Leguminosas', 'Cereales', 'Azúcares', 'AOAM', 'AOAB', 'AOAMB', 'Lípidos', 'Líp+proteína'];
    const valuesPerGroup = [95, 60, 25, 120, 70, 40, 75, 55, 40, 45, 65]; // Corresponding values for ene calculation
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

  // Calculate total calories from macronutrients table for percentage calculations
  const totalCaloriasMacros = useMemo(() => {
    const totalCarbs = (equivByGroupsDict['Lácteos'] * 12) +
                      (equivByGroupsDict['Frutas'] * 15) +
                      (equivByGroupsDict['Verduras'] * 4) +
                      (equivByGroupsDict['Leguminosas'] * 20) +
                      (equivByGroupsDict['Azúcares'] * 10) +
                      (equivByGroupsDict['Cereales'] * 15) +
                      (equivByGroupsDict['Líp+proteína'] * 2);
    
    const totalProteins = (equivByGroupsDict['Lácteos'] * 9) +
                         (equivByGroupsDict['Verduras'] * 2) +
                         (equivByGroupsDict['Leguminosas'] * 8) +
                         (equivByGroupsDict['Cereales'] * 2) +
                         (equivByGroupsDict['AOAMB'] * 7) +
                         (equivByGroupsDict['AOAB'] * 7) +
                         (equivByGroupsDict['AOAM'] * 7) +
                         (equivByGroupsDict['Líp+proteína'] * 2);
    
    const totalLipids = (equivByGroupsDict['Lácteos'] * 2) +
                       (equivByGroupsDict['Leguminosas'] * 1) +
                       (equivByGroupsDict['AOAMB'] * 1) +
                       (equivByGroupsDict['AOAB'] * 3) +
                       (equivByGroupsDict['AOAM'] * 5) +
                       (equivByGroupsDict['Líp+proteína'] * 5) +
                       (equivByGroupsDict['Lípidos'] * 5);
    
    return (totalCarbs * 4) + (totalProteins * 4) + (totalLipids * 9);
  }, [equivByGroupsDict]);

  // Calculate total calories from first Macros table (Total row, Calorias column) for Macronutrientes header
  const totalCaloriasMacrosHeader = useMemo(() => {
    const totalCarbs = (equivByGroupsDict['Lácteos'] * 12) +
                      (equivByGroupsDict['Frutas'] * 15) +
                      (equivByGroupsDict['Verduras'] * 4) +
                      (equivByGroupsDict['Leguminosas'] * 20) +
                      (equivByGroupsDict['Azúcares'] * 10) +
                      (equivByGroupsDict['Cereales'] * 15) +
                      (equivByGroupsDict['Líp+proteína'] * 2);
    
    const totalProteins = (equivByGroupsDict['Lácteos'] * 9) +
                         (equivByGroupsDict['Verduras'] * 2) +
                         (equivByGroupsDict['Leguminosas'] * 8) +
                         (equivByGroupsDict['Cereales'] * 2) +
                         (equivByGroupsDict['AOAMB'] * 7) +
                         (equivByGroupsDict['AOAB'] * 7) +
                         (equivByGroupsDict['AOAM'] * 7) +
                         (equivByGroupsDict['Líp+proteína'] * 2);
    
    const totalLipids = (equivByGroupsDict['Lácteos'] * 2) +
                       (equivByGroupsDict['Leguminosas'] * 1) +
                       (equivByGroupsDict['AOAMB'] * 1) +
                       (equivByGroupsDict['AOAB'] * 3) +
                       (equivByGroupsDict['AOAM'] * 5) +
                       (equivByGroupsDict['Líp+proteína'] * 5) +
                       (equivByGroupsDict['Lípidos'] * 5);
    
    return (totalCarbs * 4) + (totalProteins * 4) + (totalLipids * 9);
  }, [equivByGroupsDict]);

  // Calculate total calories from Modo Fit (G column) for percentage calculations
  const totalCaloriasModoFit = useMemo(() => {
    const carbsGramos = (equivByGroupsDict['Lácteos'] * 12) +
                       (equivByGroupsDict['Frutas'] * 15) +
                       (equivByGroupsDict['Verduras'] * 4) +
                       (equivByGroupsDict['Leguminosas'] * 20) +
                       (equivByGroupsDict['Azúcares'] * 10) +
                       (equivByGroupsDict['Cereales'] * 15) +
                       (equivByGroupsDict['Líp+proteína'] * 2);
    
    const proteinsGramos = (equivByGroupsDict['Lácteos'] * 9) +
                          (equivByGroupsDict['Verduras'] * 2) +
                          (equivByGroupsDict['Leguminosas'] * 8) +
                          (equivByGroupsDict['Cereales'] * 2) +
                          (equivByGroupsDict['AOAMB'] * 7) +
                          (equivByGroupsDict['AOAB'] * 7) +
                          (equivByGroupsDict['AOAM'] * 7) +
                          (equivByGroupsDict['Líp+proteína'] * 2);
    
    const lipidsGramos = (equivByGroupsDict['Lácteos'] * 2) +
                        (equivByGroupsDict['Leguminosas'] * 1) +
                        (equivByGroupsDict['AOAMB'] * 1) +
                        (equivByGroupsDict['AOAB'] * 3) +
                        (equivByGroupsDict['AOAM'] * 5) +
                        (equivByGroupsDict['Líp+proteína'] * 5) +
                        (equivByGroupsDict['Lípidos'] * 5);
    
    return (carbsGramos * 4) + (proteinsGramos * 4) + (lipidsGramos * 9);
  }, [equivByGroupsDict]);

  const renderMenuView = () => {
    // Group tables into rows of 5
    const rows = [];
    for (let i = 0; i < mealTables.length; i += 5) {
      rows.push(mealTables.slice(i, i + 5));
    }

    return (
      <div className="space-y-0">
        {/* Menu Header */}
        {currentMenuId && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Menú: {currentMenuNombre}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tiempos: {currentMenuTiempos.join(' | ')}
            </div>
          </div>
        )}

        {/* Color Reference and Ingredientes Evitar */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: Color Reference */}
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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

          {/* Right: Ingredientes que Evita */}
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Ingredientes que Evita:</h3>
            {selectedPaciente && pacientes.find(p => p.id === selectedPaciente.id)?.ingredientesEvitar && 
             pacientes.find(p => p.id === selectedPaciente.id)!.ingredientesEvitar!.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pacientes.find(p => p.id === selectedPaciente.id)!.ingredientesEvitar!.map((ing) => (
                  <span
                    key={ing.id}
                    className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {ing.nombre}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {selectedPaciente ? 'Ninguno' : 'Selecciona un paciente'}
              </span>
            )}
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
                      title="Cargar receta"
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
                            Código
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
                                title="Clic derecho para cambiar color"
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
                              <div className="relative flex items-center gap-1">
                                <input
                                  type="text"
                                  value={item.nombre}
                                  onChange={(e) =>
                                    handleCellChange(actualTableIndex, itemIndex, 'nombre', e.target.value)
                                  }
                                  className="w-full rounded border-gray-300 bg-transparent px-2 py-0 text-xs text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:text-white"
                                />
                                {/* Warning icon if ingredient is in evitar list */}
                                {selectedPaciente && 
                                 pacientes.find(p => p.id === selectedPaciente.id)?.ingredientesEvitar?.some(
                                   ing => ing.nombre.toLowerCase() === item.nombre.toLowerCase()
                                 ) && (
                                  <span 
                                    className="flex-shrink-0 text-orange-500 dark:text-orange-400" 
                                    title="Este ingrediente no le agrada al paciente"
                                  >
                                    ⚠️
                                  </span>
                                )}
                              </div>
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
            Guardar menú
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
                Seleccionar color
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

  const renderMacrosView = () => {
    const eq = (key: string) => equivByGroupsDict[key] || 0;

    const totalCarbs =
      eq('Lácteos') * 12 +
      eq('Frutas') * 15 +
      eq('Verduras') * 4 +
      eq('Leguminosas') * 20 +
      eq('Azúcares') * 10 +
      eq('Cereales') * 15 +
      eq('Líp+proteína') * 2;

    const totalProteins =
      eq('Lácteos') * 9 +
      eq('Verduras') * 2 +
      eq('Leguminosas') * 8 +
      eq('Cereales') * 2 +
      eq('AOAMB') * 7 +
      eq('AOAB') * 7 +
      eq('AOAM') * 7 +
      eq('Líp+proteína') * 2;

    const totalLipids =
      eq('Lácteos') * 2 +
      eq('Leguminosas') * 1 +
      eq('AOAMB') * 1 +
      eq('AOAB') * 3 +
      eq('AOAM') * 5 +
      eq('Líp+proteína') * 5 +
      eq('Lípidos') * 5;

    const modoFitProteins = eq('Lácteos') * 9 + eq('Leguminosas') * 8 + eq('AOAMB') * 7 + eq('AOAB') * 7 + eq('AOAM') * 7;

    const totalCarbsNoCereales = eq('Lácteos') * 12 + eq('Frutas') * 15 + eq('Verduras') * 4 + eq('Leguminosas') * 20 + eq('Azúcares') * 10;
    const totalProteinsNoAnimales = eq('Lácteos') * 9 + eq('Verduras') * 2 + eq('Leguminosas') * 8 + eq('Cereales') * 2;
    const totalLipidsNoGrasas = eq('Lácteos') * 2 + eq('Leguminosas') * 1 + eq('AOAMB') * 1 + eq('AOAB') * 3 + eq('AOAM') * 5;

    return (
      <div className="mx-auto w-full max-w-screen-2xl">
        <div className="flex flex-col gap-4">
          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Macros</h2>

            <div className="min-w-0 overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <table className="w-full table-fixed divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr className="divide-x divide-gray-300 dark:divide-gray-700">
                    <th className="w-48 px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-700">
                      Grupo de alimentos
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white border-r-2 border-gray-300 dark:border-gray-700">
                      Intercambios
                    </th>
                    <th className="bg-purple-500 px-3 py-2 text-center text-xs font-semibold text-white border-r-2 border-purple-600">
                      Carbohidratos
                    </th>
                    <th className="bg-red-500 px-3 py-2 text-center text-xs font-semibold text-white border-r-2 border-red-600">
                      Proteínas
                    </th>
                    <th className="bg-orange-500 px-3 py-2 text-center text-xs font-semibold text-white border-r-2 border-orange-600">
                      Lípidos
                    </th>
                    <th className="bg-green-500 px-3 py-2 text-center text-xs font-semibold text-white">
                      Calorías
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Lácteos</td>
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
                    <td className="px-4 py-1.5 text-xs text-gray-900 dark:text-white pl-8">Leche semidescremada</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white"></td>
                  </tr>
                  <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-1.5 text-xs text-gray-900 dark:text-white pl-8">Leche descremada</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{eq('Lácteos').toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Lácteos') * 12).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Lácteos') * 9).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Lácteos') * 2).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Lácteos') * 95).toFixed(2)}</td>
                  </tr>

                  <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Fruta</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{eq('Frutas').toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Frutas') * 15).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Frutas') * 60).toFixed(2)}</td>
                  </tr>

                  <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Verdura</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{eq('Verduras').toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Verduras') * 4).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Verduras') * 2).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Verduras') * 25).toFixed(2)}</td>
                  </tr>

                  <tr className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-1.5 text-xs font-medium text-gray-900 dark:text-white">Leguminosas</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{eq('Leguminosas').toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Leguminosas') * 20).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Leguminosas') * 8).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Leguminosas') * 1).toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-center text-xs text-gray-900 dark:text-white">{(eq('Leguminosas') * 120).toFixed(2)}</td>
                  </tr>

                  <tr className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400">Azúcar</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Azúcares sin grasa</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{eq('Azúcares').toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Azúcares') * 10).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Azúcares') * 40).toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Azúcares con grasa</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  </tr>
                  <tr className="bg-purple-500 hover:bg-purple-600">
                    <td className="px-3 py-1 text-xs font-semibold text-white">Total carbohidratos no cereales</td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs text-white">{totalCarbsNoCereales.toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                  </tr>

                  <tr className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-sm font-bold text-orange-600 dark:text-orange-400">Cereales y tubérculos</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white"></td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Cereales sin grasa</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{eq('Cereales').toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Cereales') * 15).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Cereales') * 2).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Cereales') * 70).toFixed(2)}</td>
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
                    <td className="px-3 py-1 text-xs font-semibold text-white">Total proteínas no animales</td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs text-white">{totalProteinsNoAnimales.toFixed(2)}</td>
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
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{eq('AOAMB').toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAMB') * 7).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAMB') * 1).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAMB') * 40).toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Bajo</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{eq('AOAB').toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAB') * 7).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAB') * 3).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAB') * 55).toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Moderado</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{eq('AOAM').toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAM') * 7).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAM') * 5).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('AOAM') * 75).toFixed(2)}</td>
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
                    <td className="px-3 py-1 text-xs font-semibold text-white">Total lípidos no grasas</td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs text-white">{totalLipidsNoGrasas.toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                  </tr>

                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Lípidos con proteína</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{eq('Líp+proteína').toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Líp+proteína') * 2).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Líp+proteína') * 2).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Líp+proteína') * 5).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Líp+proteína') * 65).toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">Lípidos</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{eq('Lípidos').toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">0.00</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Lípidos') * 5).toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs text-gray-900 dark:text-white">{(eq('Lípidos') * 45).toFixed(2)}</td>
                  </tr>

                  <tr className="bg-gray-500 hover:bg-gray-600">
                    <td className="px-3 py-1 text-xs font-bold text-white">Total</td>
                    <td className="px-3 py-1 text-xs text-white"></td>
                    <td className="px-3 py-1 text-xs font-bold text-purple-300">{totalCarbs.toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs font-bold text-red-300">{totalProteins.toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs font-bold text-orange-300">{totalLipids.toFixed(2)}</td>
                    <td className="px-3 py-1 text-xs font-bold text-green-300">{(totalCarbs * 4 + totalProteins * 4 + totalLipids * 9).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="my-6 border-t-2 border-gray-400 dark:border-gray-600"></div>

            <div className="grid grid-cols-1 gap-6 mb-8 xl:grid-cols-12">
              <div className="min-w-0 overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 xl:col-span-8">
                <table className="w-full table-fixed divide-y divide-gray-300 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-blue-600 dark:bg-blue-700">
                      <th colSpan={4} className="px-3 py-2 text-center text-xs font-semibold text-white border-r-2 border-blue-800">CALORÍAS TOTALES</th>
                      <th colSpan={3} className="px-3 py-2 text-center text-xs font-semibold text-white">MODO FIT</th>
                    </tr>
                    <tr className="bg-gray-400 dark:bg-gray-600">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-white">Macronutriente</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-white">%</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-white">Calorías</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-white border-r-2 border-gray-500">Gramos</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-white">%</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-white">Cal</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-white">G</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="bg-pink-400 hover:bg-pink-500 transition-colors">
                      <td className="px-4 py-2 text-xs font-medium text-white">Carbohidratos</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{totalCaloriasMacros > 0 ? (((totalCarbs * 4) / totalCaloriasMacros) * 100).toFixed(2) : '0.00'}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{(totalCarbs * 4).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white border-r-2 border-pink-600">{totalCarbs.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{totalCaloriasModoFit > 0 ? (((totalCarbs * 4) / totalCaloriasModoFit) * 100).toFixed(2) : '0.00'}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{(totalCarbs * 4).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{totalCarbs.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-pink-400 hover:bg-pink-500 transition-colors">
                      <td className="px-4 py-2 text-xs font-medium text-white">Proteínas</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{totalCaloriasMacros > 0 ? (((totalProteins * 4) / totalCaloriasMacros) * 100).toFixed(2) : '0.00'}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{(totalProteins * 4).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white border-r-2 border-pink-600">{totalProteins.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{totalCaloriasModoFit > 0 ? (((modoFitProteins * 4) / totalCaloriasModoFit) * 100).toFixed(2) : '0.00'}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{(modoFitProteins * 4).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{modoFitProteins.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-pink-400 hover:bg-pink-500 transition-colors">
                      <td className="px-4 py-2 text-xs font-medium text-white">Lípidos</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{totalCaloriasMacros > 0 ? (((totalLipids * 9) / totalCaloriasMacros) * 100).toFixed(2) : '0.00'}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{(totalLipids * 9).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white border-r-2 border-pink-600">{totalLipids.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{totalCaloriasModoFit > 0 ? (((totalLipids * 9) / totalCaloriasModoFit) * 100).toFixed(2) : '0.00'}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{(totalLipids * 9).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-xs text-white">{totalLipids.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="min-w-0 overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 xl:col-span-4">
                <table className="w-full table-fixed divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                      <th colSpan={2} className="px-4 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-700">
                        Referencia de colores
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#808080' }}>
                      <td className="px-4 py-2 text-xs font-medium text-white">Lácteos</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-white">{eq('Lácteos').toFixed(2)}</td>
                    </tr>
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#FF6363' }}>
                      <td className="px-4 py-2 text-xs font-medium text-white">Animales</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-white">{(eq('AOAMB') + eq('AOAB') + eq('AOAM')).toFixed(2)}</td>
                    </tr>
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#A52A2A' }}>
                      <td className="px-4 py-2 text-xs font-medium text-white">Leguminosas</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-white">{eq('Leguminosas').toFixed(2)}</td>
                    </tr>
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#008000' }}>
                      <td className="px-4 py-2 text-xs font-medium text-white">Verduras</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-white">{eq('Verduras').toFixed(2)}</td>
                    </tr>
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#FF8C00' }}>
                      <td className="px-4 py-2 text-xs font-medium text-white">Cereales</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-white">{eq('Cereales').toFixed(2)}</td>
                    </tr>
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#8A2BE2' }}>
                      <td className="px-4 py-2 text-xs font-medium text-white">Frutas</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-white">{eq('Frutas').toFixed(2)}</td>
                    </tr>
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#FFFF00' }}>
                      <td className="px-4 py-2 text-xs font-medium text-gray-900">Lípidos</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-gray-900">{eq('Lípidos').toFixed(2)}</td>
                    </tr>
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#CD661D' }}>
                      <td className="px-4 py-2 text-xs font-medium text-white">Líp+proteína</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-white">{eq('Líp+proteína').toFixed(2)}</td>
                    </tr>
                    <tr className="hover:opacity-80 transition-colors" style={{ backgroundColor: '#00BFFF' }}>
                      <td className="px-4 py-2 text-xs font-medium text-white">Azúcares</td>
                      <td className="px-3 py-2 text-center text-xs font-semibold text-white">{eq('Azúcares').toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-6">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                % Cal Total: <span className="text-purple-600 dark:text-purple-400">0</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                % Fit Total: <span className="text-orange-600 dark:text-orange-400">0</span>
              </div>
            </div>

            <div className="min-w-0 w-full overflow-x-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <table className="w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th colSpan={5} className="px-4 py-3 text-center text-base font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-700">
                      Macronutrientes / kg masa
                    </th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">Masa corporal actual</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">
                      <input
                        type="number"
                        value={masaCorporalCaloriasTotales}
                        onChange={(e) => setMasaCorporalCaloriasTotales(Number(e.target.value) || 0)}
                        className="w-16 text-center bg-transparent border-b border-gray-400 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">kg</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">
                      <input
                        type="number"
                        value={masaCorporalModoFit}
                        onChange={(e) => setMasaCorporalModoFit(Number(e.target.value) || 0)}
                        className="w-16 text-center bg-transparent border-b border-gray-400 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">kg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white">Calorías</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">{masaCorporalCaloriasTotales > 0 ? (totalCaloriasMacrosHeader / masaCorporalCaloriasTotales).toFixed(2) : '0.00'}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">cal/kg</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">{masaCorporalModoFit > 0 ? (totalCaloriasMacrosHeader / masaCorporalModoFit).toFixed(2) : '0.00'}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">cal/kg</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white">Proteínas</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">{masaCorporalCaloriasTotales > 0 ? (totalProteins / masaCorporalCaloriasTotales).toFixed(2) : '0.00'}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">{masaCorporalModoFit > 0 ? (modoFitProteins / masaCorporalModoFit).toFixed(2) : '0.00'}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white">Carbohidratos</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">{masaCorporalCaloriasTotales > 0 ? (totalCarbs / masaCorporalCaloriasTotales).toFixed(2) : '0.00'}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">{masaCorporalModoFit > 0 ? (totalCarbs / masaCorporalModoFit).toFixed(2) : '0.00'}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-white">Lípidos</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">{masaCorporalCaloriasTotales > 0 ? (totalLipids / masaCorporalCaloriasTotales).toFixed(2) : '0.00'}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-900 dark:text-white">{masaCorporalModoFit > 0 ? (totalLipids / masaCorporalModoFit).toFixed(2) : '0.00'}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">g/kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPatronView = () => {
    const groups: Array<{ key: string; label: string; eneFactor: number }> = [
      { key: 'Lácteos', label: 'Lácteos', eneFactor: 95 },
      { key: 'Frutas', label: 'Frutas', eneFactor: 60 },
      { key: 'Verduras', label: 'Verduras', eneFactor: 25 },
      { key: 'Leguminosas', label: 'Leguminosas', eneFactor: 120 },
      { key: 'Cereales', label: 'Cereales', eneFactor: 70 },
      { key: 'Azúcares', label: 'Azúcares', eneFactor: 40 },
      { key: 'AOAM', label: 'AOAM', eneFactor: 75 },
      { key: 'AOAB', label: 'AOAB', eneFactor: 55 },
      { key: 'AOAMB', label: 'AOAMB', eneFactor: 40 },
      { key: 'Lípidos', label: 'Lípidos', eneFactor: 45 },
      { key: 'Líp+proteína', label: 'Líp+proteína', eneFactor: 65 },
    ];

    const getEquiv = (groupKey: string, tiempoIndex: number) => (grupoAlimenticioData[groupKey]?.[tiempoIndex] || 0) / 7;
    const getEne = (groupKey: string, tiempoIndex: number, eneFactor: number) => Math.round(getEquiv(groupKey, tiempoIndex) * eneFactor);

    return (
      <div className="mx-auto w-full max-w-screen-2xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Patrón</h2>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="min-w-0 overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 xl:col-span-8">
            <table className="w-full table-fixed divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
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
                  <th className="bg-yellow-500 px-2 py-2 text-center text-xs font-semibold text-white">Calorías</th>
                </tr>
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
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {groups.map((g) => {
                  const totalEne =
                    getEne(g.key, 0, g.eneFactor) +
                    getEne(g.key, 1, g.eneFactor) +
                    getEne(g.key, 2, g.eneFactor) +
                    getEne(g.key, 3, g.eneFactor) +
                    getEne(g.key, 4, g.eneFactor);

                  return (
                    <tr
                      key={g.key}
                      className="divide-x divide-gray-200 hover:bg-gray-50 dark:divide-gray-700 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white">{g.label}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEquiv(g.key, 0).toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEne(g.key, 0, g.eneFactor)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEquiv(g.key, 1).toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEne(g.key, 1, g.eneFactor)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEquiv(g.key, 2).toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEne(g.key, 2, g.eneFactor)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEquiv(g.key, 3).toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEne(g.key, 3, g.eneFactor)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEquiv(g.key, 4).toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{getEne(g.key, 4, g.eneFactor)}</td>
                      <td className="px-2 py-1.5 text-center text-xs text-gray-900 dark:text-white">{totalEne}</td>
                    </tr>
                  );
                })}

                <tr className="divide-x divide-gray-200 bg-gray-100 hover:bg-gray-200 dark:divide-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white">Calorías totales</td>
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
                </tr>
              </tbody>
            </table>
          </div>

          <div className="min-w-0 overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 xl:col-span-4">
            <table className="w-full table-fixed divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
                <tr>
                  <th
                    colSpan={6}
                    className="bg-gray-100 px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:bg-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-700"
                  >
                    Grupo alimenticio
                  </th>
                </tr>
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
                {groups.map((g) => {
                  const bg = tipoColors[g.key] || 'transparent';
                  const fg = tipoColors[g.key] ? getTextColor(tipoColors[g.key]) : 'inherit';

                  return (
                    <tr
                      key={g.key}
                      className="divide-x divide-gray-200 transition-colors"
                      style={{ backgroundColor: bg }}
                    >
                      <td className="px-3 py-2 text-xs font-medium" style={{ color: fg }}>
                        {g.label}
                      </td>
                      <td className="px-3 py-2 text-center text-xs" style={{ color: fg }}>
                        {grupoAlimenticioData[g.key]?.[0] || 0}
                      </td>
                      <td className="px-3 py-2 text-center text-xs" style={{ color: fg }}>
                        {grupoAlimenticioData[g.key]?.[1] || 0}
                      </td>
                      <td className="px-3 py-2 text-center text-xs" style={{ color: fg }}>
                        {grupoAlimenticioData[g.key]?.[2] || 0}
                      </td>
                      <td className="px-3 py-2 text-center text-xs" style={{ color: fg }}>
                        {grupoAlimenticioData[g.key]?.[3] || 0}
                      </td>
                      <td className="px-3 py-2 text-center text-xs" style={{ color: fg }}>
                        {grupoAlimenticioData[g.key]?.[4] || 0}
                      </td>
                    </tr>
                  );
                })}
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

        {selectedPaciente && activeTab === 'Menú' && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsLoadMenuModalOpen(true)}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700"
            >
              Cargar menú
            </button>
            <button
              onClick={() => setIsNewMenuModalOpen(true)}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Nuevo menú
            </button>
          </div>
        )}
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

      {/* Load Menu Modal */}
      <LoadMenuModal
        isOpen={isLoadMenuModalOpen}
        onClose={() => setIsLoadMenuModalOpen(false)}
        idPaciente={selectedPaciente?.id ?? null}
        onSelectMenu={handleLoadMenuById}
      />

      {/* New Menu Modal */}
      <NewMenuModal
        isOpen={isNewMenuModalOpen}
        onClose={() => setIsNewMenuModalOpen(false)}
        idPaciente={selectedPaciente?.id ?? null}
        defaultTiempos={[...DEFAULT_MENU_TIEMPOS] as MenuTiempos5}
        onCreated={(menu) => {
          const tiemposBase: MenuTiempos5 = [
            menu.tiempo1,
            menu.tiempo2,
            menu.tiempo3,
            menu.tiempo4,
            menu.tiempo5,
          ];
          setCurrentMenuId(menu.id);
          setCurrentMenuNombre(menu.nombre);
          setCurrentMenuTiempos(tiemposBase);
          setMealTables(buildMealTables(tiemposBase));
          showToast('Menú creado', 'success');
        }}
      />

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="mt-6">
        {selectedPaciente ? (
          activeTab === 'Menú'
            ? renderMenuView()
            : activeTab === 'Macros'
            ? renderMacrosView()
            : renderPatronView()
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
