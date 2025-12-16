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
  created_at: string;
}

interface CreateMenuData {
  idPaciente: number;
  nombre: string;
  tiempos: [string, string, string, string, string];
}

interface MenuTiempo {
  id: number;
  Nombre: string;
}

interface NewMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  idPaciente: number | null;
  defaultTiempos: [string, string, string, string, string];
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
  const [tiempos, setTiempos] = useState<[string, string, string, string, string]>(defaultTiempos);
  const [options, setOptions] = useState<MenuTiempo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNombre('');
    setTiempos(defaultTiempos);
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
  }, [isOpen, defaultTiempos]);

  const canSubmit = useMemo(() => {
    return Boolean(idPaciente) && Boolean(nombre.trim()) && tiempos.every((t) => t && t.trim());
  }, [idPaciente, nombre, tiempos]);

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
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx}>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tiempo {idx + 1}
                </label>
                <select
                  value={tiempos[idx]}
                  onChange={(e) => {
                    const next = [...tiempos] as [string, string, string, string, string];
                    next[idx] = e.target.value;
                    setTiempos(next);
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                >
                  {options.length === 0 ? (
                    <option value={tiempos[idx]}>{tiempos[idx]}</option>
                  ) : (
                    options.map((opt) => (
                      <option key={opt.id} value={opt.Nombre}>
                        {opt.Nombre}
                      </option>
                    ))
                  )}
                </select>
              </div>
            ))}
          </div>
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
