import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import type { NavigationItem } from './components/Sidebar';
import { Dashboard, Recetario, Pacientes } from './pages';
import { MealTable } from './pages/Dashboard';
import { AddRecipeModal, AddIngredienteModal, IngredientesListModal } from './components';
import { useRecipes, useIngredientes } from './hooks';
import CalorimetricLogo from '../assets/images/CalorimetricLogo.jpeg';
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineUsers,
} from 'react-icons/hi2';

type Page = 'dashboard' | 'recetario' | 'pacientes';

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isAddIngredienteModalOpen, setIsAddIngredienteModalOpen] = useState(false);
  const [isIngredientesListModalOpen, setIsIngredientesListModalOpen] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState<{ id: number; nombre: string; tipo_id?: number } | null>(null);
  const [tiposIngrediente, setTiposIngrediente] = useState<{ id: number; nombre: string; color: string }[]>([]);
  
  const { createRecipe } = useRecipes();
  const { ingredientes, loading: ingredientesLoading, refresh: refreshIngredientes } = useIngredientes();

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 500); // Fade duration
    }, 2000); // Display duration

    return () => clearTimeout(timer);
  }, []);

  // Fetch tipos ingrediente
  useEffect(() => {
    const fetchTipos = async () => {
      const tipos = await window.electronAPI?.tiposIngrediente.getAll();
      if (tipos) {
        setTiposIngrediente(tipos);
      }
    };
    fetchTipos();
  }, []);

  // Listen for menu events
  useEffect(() => {
    const handleShowAddRecipe = () => {
      setIsAddRecipeModalOpen(true);
      setCurrentPage('recetario');
    };

    const handleShowAddIngrediente = () => {
      setEditingIngrediente(null);
      setIsAddIngredienteModalOpen(true);
    };

    const handleShowIngredientesList = () => {
      setIsIngredientesListModalOpen(true);
    };

    window.electronAPI?.onShowAddRecipe(handleShowAddRecipe);
    window.electronAPI?.onShowAddIngrediente(handleShowAddIngrediente);
    window.electronAPI?.onShowIngredientesList(handleShowIngredientesList);

    return () => {
      window.electronAPI?.removeAllListeners('show-add-recipe');
      window.electronAPI?.removeAllListeners('show-add-ingrediente');
      window.electronAPI?.removeAllListeners('show-ingredientes-list');
    };
  }, []);

  const handleSaveIngrediente = async (nombre: string, tipo_id?: number) => {
    if (editingIngrediente) {
      await window.electronAPI?.ingredientes.update(editingIngrediente.id, nombre, tipo_id);
    } else {
      await window.electronAPI?.ingredientes.create(nombre, tipo_id);
    }
    await refreshIngredientes();
    setIsAddIngredienteModalOpen(false);
    setEditingIngrediente(null);
  };

  const handleEditIngrediente = (ingrediente: { id: number; nombre: string; tipo_id?: number }) => {
    setEditingIngrediente(ingrediente);
    setIsAddIngredienteModalOpen(true);
    setIsIngredientesListModalOpen(false);
  };

  const handleDeleteIngrediente = async (id: number, nombre: string) => {
    await window.electronAPI?.ingredientes.delete(id);
    await refreshIngredientes();
  };

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      icon: HiOutlineHome,
      current: currentPage === 'dashboard',
      onClick: () => setCurrentPage('dashboard'),
    },
    {
      name: 'Recetario',
      icon: HiOutlineBookOpen,
      current: currentPage === 'recetario',
      onClick: () => setCurrentPage('recetario'),
    },
    {
      name: 'Pacientes',
      icon: HiOutlineUsers,
      current: currentPage === 'pacientes',
      onClick: () => setCurrentPage('pacientes'),
    },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'recetario':
        return <Recetario />;
      case 'pacientes':
        return <Pacientes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="text-center">
            <img 
              src={CalorimetricLogo} 
              alt="Calorimetric Logo" 
              className="w-96 h-auto animate-pulse"
            />
          </div>
        </div>
      )}
      <Sidebar navigation={navigation} className="h-full">
        {renderPage()}
      </Sidebar>
      <AddRecipeModal
        isOpen={isAddRecipeModalOpen}
        onClose={() => setIsAddRecipeModalOpen(false)}
        onSave={async (recipe) => {
          await createRecipe(recipe);
          setIsAddRecipeModalOpen(false);
        }}
      />
      <AddIngredienteModal
        isOpen={isAddIngredienteModalOpen}
        onClose={() => {
          setIsAddIngredienteModalOpen(false);
          setEditingIngrediente(null);
        }}
        onSave={handleSaveIngrediente}
        editMode={!!editingIngrediente}
        initialData={editingIngrediente || undefined}
        tipos={tiposIngrediente}
      />
      <IngredientesListModal
        isOpen={isIngredientesListModalOpen}
        onClose={() => setIsIngredientesListModalOpen(false)}
        ingredientes={ingredientes}
        onEdit={handleEditIngrediente}
        onDelete={handleDeleteIngrediente}
        loading={ingredientesLoading}
      />
    </div>
  );
};

export default App;
