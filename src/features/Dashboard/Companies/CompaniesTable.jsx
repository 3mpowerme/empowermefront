import React, { useMemo, useState } from 'react';
import Switch from '../../../components/Switch/Switch';
import { useFetch } from '../../../hooks/useFetch';
import { Search } from 'lucide-react';
import { privateService } from '../../../services/privateService';

const CompaniesTable = () => {
  const { data, isLoading, error, refetch } = useFetch('/executive/companies', {
    initialState: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const rowsPerPage = 10;

  const [notificationModal, setNotificationModal] = useState({
    open: false,
    companyId: null,
    title: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();

    return data.filter((item) =>
      [item.company_name, item.user_email, item.has_subscription, item.paid_service_orders_count]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [data, search]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredData.length / rowsPerPage)),
    [filteredData.length]
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = useMemo(
    () => filteredData.slice(startIndex, startIndex + rowsPerPage),
    [filteredData, startIndex]
  );

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const openNotificationModal = (companyId) => {
    setSendError(null);
    setNotificationModal({ open: true, companyId, title: '', message: '' });
  };

  const closeNotificationModal = () => {
    if (isSending) return;
    setNotificationModal({ open: false, companyId: null, title: '', message: '' });
    setSendError(null);
  };

  const handleSendNotification = async () => {
    if (!notificationModal.companyId) return;

    const title = (notificationModal.title || '').trim();
    const message = (notificationModal.message || '').trim();

    if (!title || !message) {
      setSendError('Completa el título y la descripción');
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);

      await privateService.create('/executive/notification', {
        companyId: notificationModal.companyId,
        title,
        message,
      });

      closeNotificationModal();
    } catch (e) {
      setSendError(e?.message || 'Error enviando notificación');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-10">
        <div className="border border-gray-300 rounded-xl h-40 flex justify-center items-center">
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-10">
        <div className="border border-gray-300 rounded-xl h-40 flex flex-col justify-center items-center gap-3">
          <span>Error: {error}</span>
          <button
            onClick={refetch}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-10">
      <div className="flex justify-end mb-4">
        <div className="relative w-full max-w-xs">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-10 focus:outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      <Switch value={paginatedData.length > 0}>
        <Switch.Item case={true}>
          <div className="overflow-x-auto rounded-2xl border border-gray-300">
            <table className="w-full text-left">
              <thead className="border-b border-gray-300">
                <tr>
                  <th className="py-3 px-4">ID Empresa</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Suscripción</th>
                  <th className="py-3 px-4">Servicios pagadas</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.company_id}>
                    <td className="py-3 px-4">{item.company_id}</td>
                    <td className="py-3 px-4">{item.company_name}</td>
                    <td className="py-3 px-4">{item.user_email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.has_subscription
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {item.has_subscription ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.paid_service_orders_count}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => openNotificationModal(item.company_id)}
                          className="px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition text-sm">
                          Enviar notificación
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50">
              Anterior
            </button>
            <span className="text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </Switch.Item>

        <Switch.Item case={false}>
          <div className="border border-gray-300 rounded-xl h-40 flex justify-center items-center">
            Sin registros
          </div>
        </Switch.Item>
      </Switch>

      <Switch value={notificationModal.open}>
        <Switch.Item case={true}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeNotificationModal} />
            <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Enviar notificación</h3>
                <button
                  onClick={closeNotificationModal}
                  disabled={isSending}
                  className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50">
                  Cerrar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Título</label>
                  <input
                    value={notificationModal.title}
                    onChange={(e) =>
                      setNotificationModal((prev) => ({ ...prev, title: e.target.value }))
                    }
                    disabled={isSending}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Descripción</label>
                  <textarea
                    value={notificationModal.message}
                    onChange={(e) =>
                      setNotificationModal((prev) => ({ ...prev, message: e.target.value }))
                    }
                    disabled={isSending}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none resize-none"
                  />
                </div>

                {sendError && <div className="text-sm text-red-600">{sendError}</div>}

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={closeNotificationModal}
                    disabled={isSending}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendNotification}
                    disabled={isSending}
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition disabled:opacity-50">
                    {isSending ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Switch.Item>
      </Switch>
    </div>
  );
};

export default CompaniesTable;
