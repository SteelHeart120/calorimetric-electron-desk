import React, { useState, useEffect } from 'react';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { AddPatientModal } from '../components/AddPatientModal';
import { usePacientes } from '../hooks/usePacientes';

interface Paciente {
  id: number;
  nombre: string;
  ingredientesEvitar?: { id: number; nombre: string }[];
}

const Pacientes = () => {
  const { pacientes, refresh, deletePaciente: deletePacienteHook } = usePacientes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Debug: Log pacientes data
  useEffect(() => {
    console.log('Pacientes data in component:', pacientes);
  }, [pacientes]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPaciente = () => {
    setSelectedPaciente(null);
    setIsModalOpen(true);
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setIsModalOpen(true);
  };

  const handleDeletePaciente = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      try {
        await deletePacienteHook(id);
        await refresh();
        showToast('Paciente eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting paciente:', error);
        showToast('Error al eliminar el paciente', 'error');
      }
    }
  };

  const handleSavePatient = async () => {
    await refresh();
    setIsModalOpen(false);
    setSelectedPaciente(null);
    showToast('Paciente guardado exitosamente', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pacientes</h1>
        <button
          onClick={handleAddPaciente}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Agregar Paciente
        </button>
      </div>

      {/* Pacientes Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                Nombre
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Ingredientes que Evita
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {pacientes.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay pacientes registrados
                </td>
              </tr>
            ) : (
              pacientes.map((paciente) => (
                <tr key={paciente.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                    {paciente.nombre}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {paciente.ingredientesEvitar && paciente.ingredientesEvitar.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {paciente.ingredientesEvitar.map((ing) => (
                          <span
                            key={ing.id}
                            className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          >
                            {ing.nombre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">Ninguno</span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditPaciente(paciente)}
                        className="rounded p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                        title="Editar paciente"
                      >
                        <HiOutlinePencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePaciente(paciente.id)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Eliminar paciente"
                      >
                        <HiOutlineTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Patient Modal */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPaciente(null);
        }}
        onSave={handleSavePatient}
        paciente={selectedPaciente}
      />

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

export default Pacientes;
