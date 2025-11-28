import React, { useState, useMemo } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi2';
import { Tabs } from '../components';

// Predefined color palette
const COLOR_OPTIONS = [
  { value: '#EF4444', label: 'Rojo' },
  { value: '#F59E0B', label: 'Naranja' },
  { value: '#EAB308', label: 'Amarillo' },
  { value: '#10B981', label: 'Verde' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#8B5CF6', label: 'Morado' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#06B6D4', label: 'Cian' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#14B8A6', label: 'Turquesa' },
  { value: '#F97316', label: 'Naranja Oscuro' },
  { value: '#84CC16', label: 'Lima' },
];

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
  const [colorPickerOpen, setColorPickerOpen] = useState<{ tableIndex: number; itemIndex: number } | null>(null);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });

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
                  <div className={`px-4 py-1.5 text-center text-sm font-semibold ${getHeaderColorClasses(table.headerColor)}`}>
                    {table.title}
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
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-32 dark:border-gray-700 dark:bg-gray-900/50">
        <div className="text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Vista de Patron/Macros - Próximamente
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-xs">
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
        </div>
        <button
          onClick={handleAddMenu}
          className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <HiOutlinePlus className="h-5 w-5" />
          Agregar Menu
        </button>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'Menu' ? renderMenuView() : renderPatronMacrosView()}
      </div>
    </div>
  );
};

export default Dashboard;
