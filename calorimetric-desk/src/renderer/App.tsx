import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import type { NavigationItem } from './components/Sidebar';
import { Dashboard, Recetario } from './pages';
import {
  HiOutlineHome,
  HiOutlineBookOpen,
} from 'react-icons/hi2';

type Page = 'dashboard' | 'recetario';

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'recetario':
        return <Recetario />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar navigation={navigation} className="h-full">
        {renderPage()}
      </Sidebar>
    </div>
  );
};

export default App;
