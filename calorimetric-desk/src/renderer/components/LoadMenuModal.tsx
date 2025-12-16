import React, { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';

interface MenuHeader {
  id: number;
  idPaciente: number;
  nombre: string;
  tiempo1: string;
  tiempo2: string;
  tiempo3: string;
  tiempo4: string;
  tiempo5: string;
  created_at: string;
}

interface LoadMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  idPaciente: number | null;
  onSelectMenu: (menuId: number) => void;
}

export const LoadMenuModal: React.FC<LoadMenuModalProps> = ({
  isOpen,
  onClose,
  idPaciente,
  onSelectMenu,
}) => {
  const [menus, setMenus] = useState<MenuHeader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!idPaciente) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await window.electronAPI?.menu.listByPaciente(idPaciente);
        setMenus(result || []);
      } catch (e) {
        console.error('Error loading menus list:', e);
        setError('Error al cargar la lista de menús');
        setMenus([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isOpen, idPaciente]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-xl max-h-[80vh] rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cargar Menu</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">Cargando menús...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-600 dark:text-red-400">{error}</div>
          ) : menus.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">No hay menús guardados</div>
          ) : (
            <div className="space-y-2">
              {menus.map((m) => {
                const created = m.created_at ? new Date(m.created_at) : null;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMenu(m.id);
                      onClose();
                    }}
                    className="w-full text-left rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{m.nombre}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {created && !Number.isNaN(created.getTime()) ? created.toLocaleString() : m.created_at}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
