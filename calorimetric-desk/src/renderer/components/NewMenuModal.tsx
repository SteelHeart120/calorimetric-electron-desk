import React, { useEffect, useMemo, useState } from 'react';
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
  tiempos?: string;
  created_at: string;
}

interface CreateMenuData {
  idPaciente: number;
  nombre: string;
  tiempos: string[];
}

interface MenuTiempo {
  id: number;
  Nombre: string;
}

interface NewMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  idPaciente: number | null;
  defaultTiempos: string[];
  onCreated: (menu: MenuHeader) => void;
}

export const NewMenuModal: React.FC<NewMenuModalProps> = ({
  isOpen,
  onClose,
  idPaciente,
  defaultTiempos,
  onCreated,
}) => {
  const [nombre, setNombre] = useState('');
  const [tiempos, setTiempos] = useState<string[]>(['Desayuno']);
  const [options, setOptions] = useState<MenuTiempo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNombre('');
    setTiempos(['Desayuno']);
    setError(null);

    const loadOptions = async () => {
      try {
        const rows = await window.electronAPI?.menuTiempos.getAll();
        setOptions(rows || []);
      } catch (e) {
        console.error('Error loading MenuTiempos:', e);
        setOptions([]);
      }
    };

    loadOptions();
  }, [isOpen]);

  const canSubmit = useMemo(() => {
    return Boolean(idPaciente) && Boolean(nombre.trim()) && tiempos.length > 0 && tiempos.every((t) => t && t.trim());
  }, [idPaciente, nombre, tiempos]);

  const handleAddTiempo = () => {
    setTiempos([...tiempos, '']);
  };

  const handleRemoveTiempo = (index: number) => {
    if (tiempos.length <= 1) return;
    const next = [...tiempos];
    next.splice(index, 1);
    setTiempos(next);
  };

  const handleCreate = async () => {
    if (!idPaciente) {
      setError('Selecciona un paciente primero');
      return;
    }
    if (!nombre.trim()) {
      setError('El nombre del menú es requerido');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload: CreateMenuData = {
        idPaciente,
        nombre: nombre.trim(),
        tiempos,
      };
      const created = await window.electronAPI?.menu.create(payload);
      if (created) {
        onCreated(created);
        onClose();
      } else {
        setError('No se pudo crear el menú');
      }
    } catch (e) {
      console.error('Error creating menu:', e);
      setError('Error al crear el menú');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-xl max-h-[80vh] rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nuevo menu</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)] space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Ej. Menu semana 1"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {tiempos.map((tiempo, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tiempo {idx + 1}
                  </label>
                  <select
                    value={tiempo}
                    onChange={(e) => {
                      const next = [...tiempos];
                      next[idx] = e.target.value;
                      setTiempos(next);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar tiempo</option>
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.Nombre}>
                        {opt.Nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {tiempos.length > 1 && (
                  <button
                    onClick={() => handleRemoveTiempo(idx)}
                    className="mb-0.5 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                    title="Eliminar tiempo"
                  >
                    <HiXMark className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddTiempo}
            disabled={isLoading}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <span className="text-lg">+</span> Agregar tiempo
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!canSubmit || isLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
};
