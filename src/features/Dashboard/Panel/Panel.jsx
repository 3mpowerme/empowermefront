import React, { useMemo, useState } from 'react';
import Switch from '../../../components/Switch/Switch';
import { normalizePaymentStatus } from '../../../utils/utils';
import { useSearchParams } from 'react-router';
import { useFetch } from '../../../hooks/useFetch';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PanelPage() {
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub');
  const { data, isLoading, error, refetch } = useFetch('/executive/panel', { initialState: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const rowsPerPage = 10;

  const lastServices = useMemo(() => data?.lastServices || [], [data]);

  const filteredData = useMemo(() => {
    if (!search) return lastServices;
    const q = search.toLowerCase();

    return lastServices.filter((item) =>
      [item.company_name, item.service_name, item.service_status, item.payment_status]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [lastServices, search]);

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

  const formatAmount = (amountCents) => {
    const amount = Number(amountCents || 0);
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const normalizeServiceStatus = (status) => {
    const map = {
      attending: 'Atendiendo',
      finished: 'Finalizado',
      pending_payment: 'Pendiente',
      canceled: 'Cancelado',
    };
    return map[status] || status || 'Sin estado';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full gap-5 px-10 animate-slide-in mt-10">
        <h1 className="text-2xl text-black font-bold">Panel</h1>
        <div className="border border-gray-300 rounded-xl h-40 flex justify-center items-center">
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full gap-5 px-10 animate-slide-in mt-10">
        <h1 className="text-2xl text-black font-bold">Panel</h1>
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
    <>
      <div className="flex flex-col h-full w-full gap-5 px-10 animate-slide-in mt-10">
        <h1 className="text-2xl text-black font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="text-sm text-gray-500">Nuevos servicios</div>
            <div className="text-3xl font-bold text-black mt-2">{data?.newServicesCount || 0}</div>
          </div>

          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="text-sm text-gray-500">Empresas</div>
            <div className="text-3xl font-bold text-black mt-2">{data?.companiesCount || 0}</div>
          </div>

          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="text-sm text-gray-500">Total cobrado</div>
            <div className="text-3xl font-bold text-black mt-2">
              {formatAmount(data?.totalAmount || 0)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <h2 className="text-lg font-semibold text-black">Últimos servicios</h2>
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
                    <th className="py-3 px-4">ID Servicio</th>
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-4">Servicio</th>
                    <th className="py-3 px-4">Estado servicio</th>
                    <th className="py-3 px-4">Estado pago</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((item) => (
                    <tr key={`${item.service_order_id}-${item.company_id}`}>
                      <td className="py-3 px-4">{item.service_id}</td>
                      <td className="py-3 px-4">{item.company_name}</td>
                      <td className="py-3 px-4">{item.service_name}</td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {normalizeServiceStatus(item.service_status)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          {item.payment_status}
                        </span>
                      </td>

                      <td className="py-3 px-4">{formatAmount(item.payment_amount_cents)}</td>

                      <td className="py-3 px-4">
                        {item.service_order_created_at
                          ? format(new Date(item.service_order_created_at), 'd MMM yyyy, HH:mm', {
                              locale: es,
                            })
                          : '—'}
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

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-black mb-3">Servicios más solicitados</h2>

          <Switch value={(data?.mostFrequentlyRequestedServices || []).length > 0}>
            <Switch.Item case={true}>
              <div className="overflow-x-auto rounded-2xl border border-gray-300">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-300">
                    <tr>
                      <th className="py-3 px-4">ID Servicio</th>
                      <th className="py-3 px-4">Servicio</th>
                      <th className="py-3 px-4">Órdenes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.mostFrequentlyRequestedServices || []).map((row) => (
                      <tr key={row.service_id}>
                        <td className="py-3 px-4">{row.service_id}</td>
                        <td className="py-3 px-4">{row.service_name}</td>
                        <td className="py-3 px-4">{row.total_orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Switch.Item>

            <Switch.Item case={false}>
              <div className="border border-gray-300 rounded-xl h-30 flex justify-center items-center">
                Sin registros
              </div>
            </Switch.Item>
          </Switch>
        </div>
      </div>
    </>
  );
}
