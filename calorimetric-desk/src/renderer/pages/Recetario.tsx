import React, { useState, useMemo } from 'react';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi2';
import SearchBar from '../components/SearchBar';

type MealType = 'Desayuno' | 'Comida' | 'Cena';

interface Recipe {
  id: number;
  nombre: string;
  tipo: MealType;
  tiempo: string;
  imagen: string;
  ingredientes: string[];
  calorias: number;
}

const Recetario = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MealType | 'Todos'>('Todos');

  const recetas: Recipe[] = [
    {
      id: 1,
      nombre: 'Bowl de Quinoa y Aguacate',
      tipo: 'Desayuno',
      tiempo: '15 min',
      calorias: 320,
      imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      ingredientes: ['Quinoa', 'Aguacate', 'Huevo pochado', 'Espinacas', 'Tomate cherry', 'Limón'],
    },
    {
      id: 2,
      nombre: 'Tacos de Pescado con Col Morada',
      tipo: 'Comida',
      tiempo: '25 min',
      calorias: 380,
      imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
      ingredientes: ['Pescado blanco', 'Tortillas de maíz', 'Col morada', 'Cilantro', 'Limón', 'Salsa de yogurt'],
    },
    {
      id: 3,
      nombre: 'Ensalada de Nopales',
      tipo: 'Cena',
      tiempo: '20 min',
      calorias: 180,
      imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      ingredientes: ['Nopales', 'Tomate', 'Cebolla', 'Cilantro', 'Queso fresco', 'Limón', 'Chile serrano'],
    },
    {
      id: 4,
      nombre: 'Chilaquiles Verdes con Pollo',
      tipo: 'Desayuno',
      tiempo: '30 min',
      calorias: 420,
      imagen: 'https://images.unsplash.com/photo-1599974715142-a5ec2f90e8cc?w=400&h=300&fit=crop',
      ingredientes: ['Tortillas horneadas', 'Salsa verde', 'Pollo desmenuzado', 'Crema light', 'Queso fresco', 'Cebolla'],
    },
    {
      id: 5,
      nombre: 'Ceviche de Camarón',
      tipo: 'Comida',
      tiempo: '40 min',
      calorias: 210,
      imagen: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
      ingredientes: ['Camarón', 'Limón', 'Tomate', 'Pepino', 'Cebolla morada', 'Cilantro', 'Aguacate'],
    },
    {
      id: 6,
      nombre: 'Sopa de Frijoles Negros',
      tipo: 'Cena',
      tiempo: '35 min',
      calorias: 280,
      imagen: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
      ingredientes: ['Frijoles negros', 'Cebolla', 'Ajo', 'Comino', 'Chile chipotle', 'Cilantro', 'Aguacate'],
    },
    {
      id: 7,
      nombre: 'Molletes Integrales',
      tipo: 'Desayuno',
      tiempo: '15 min',
      calorias: 310,
      imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
      ingredientes: ['Pan integral', 'Frijoles refritos', 'Queso panela', 'Pico de gallo', 'Aguacate'],
    },
    {
      id: 8,
      nombre: 'Pozole Verde Light',
      tipo: 'Comida',
      tiempo: '45 min',
      calorias: 350,
      imagen: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
      ingredientes: ['Pollo', 'Maíz pozolero', 'Tomatillos', 'Chile poblano', 'Lechuga', 'Rábanos', 'Orégano'],
    },
    {
      id: 9,
      nombre: 'Ensalada de Jícama y Mango',
      tipo: 'Cena',
      tiempo: '10 min',
      calorias: 150,
      imagen: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop',
      ingredientes: ['Jícama', 'Mango', 'Pepino', 'Chile en polvo', 'Limón', 'Cilantro'],
    },
    {
      id: 10,
      nombre: 'Huevos Rancheros Saludables',
      tipo: 'Desayuno',
      tiempo: '20 min',
      calorias: 290,
      imagen: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
      ingredientes: ['Huevos', 'Tortilla integral', 'Salsa ranchera', 'Frijoles negros', 'Aguacate', 'Cilantro'],
    },
    {
      id: 11,
      nombre: 'Tostadas de Atún',
      tipo: 'Comida',
      tiempo: '15 min',
      calorias: 270,
      imagen: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=400&h=300&fit=crop',
      ingredientes: ['Atún en agua', 'Tostadas horneadas', 'Aguacate', 'Tomate', 'Cebolla', 'Limón', 'Lechuga'],
    },
    {
      id: 12,
      nombre: 'Crema de Calabaza',
      tipo: 'Cena',
      tiempo: '30 min',
      calorias: 160,
      imagen: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop',
      ingredientes: ['Calabaza', 'Cebolla', 'Ajo', 'Caldo de pollo', 'Leche descremada', 'Nuez moscada', 'Pepitas'],
    },
  ];

  const getMealTypeColor = (tipo: MealType) => {
    switch (tipo) {
      case 'Desayuno':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'Comida':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Cena':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400';
    }
  };

  // Filter and search logic
  const filteredRecetas = useMemo(() => {
    return recetas.filter((receta) => {
      const matchesSearch = receta.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receta.ingredientes.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterType === 'Todos' || receta.tipo === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType]);

  const handleEdit = (id: number) => {
    console.log('Editar receta:', id);
  };

  const handleDelete = (id: number) => {
    console.log('Eliminar receta:', id);
  };

  const handleAddNew = () => {
    console.log('Agregar nueva receta');
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
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <HiOutlinePlus className="h-5 w-5" />
          Nueva Receta
        </button>
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
          onChange={(e) => setFilterType(e.target.value as MealType | 'Todos')}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <option value="Todos">Todos</option>
          <option value="Desayuno">Desayuno</option>
          <option value="Comida">Comida</option>
          <option value="Cena">Cena</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredRecetas.length} de {recetas.length} recetas
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRecetas.map((receta) => (
          <div
            key={receta.id}
            className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
          >
            {/* Image */}
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={receta.imagen}
                alt={receta.nombre}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
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
                  <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getMealTypeColor(receta.tipo)}`}>
                    {receta.tipo}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>⏱️ {receta.tiempo}</span>
                  <span>🔥 {receta.calorias} kcal</span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Ingredientes:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {receta.ingredientes.map((ingrediente, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {ingrediente}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(receta.id)}
                  className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
                >
                  <HiOutlinePencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(receta.id)}
                  className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredRecetas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron recetas que coincidan con tu búsqueda.
          </p>
        </div>
      )}
    </div>
  );
};

export default Recetario;
