import React, { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Switch from '../../../components/Switch/Switch';
import { useFetch } from '../../../hooks/useFetch';
import { privateService } from '../../../services/privateService';
import { useNavigate } from 'react-router';
import { Search, Info, X } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import { useAccount } from '../../../hooks/useAccount';

const statusOptions = [
  { value: 'in_progress', label: 'En progreso' },
  { value: 'canceled', label: 'Cancelado' },
  { value: 'finished', label: 'Finalizado' },
];

const toDateOnly = (d) => {
  if (!d) return null;
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};

const ServicesTable = ({ showAmount = false }) => {
  const { account } = useAccount();
  const { type } = account || {};
  const showAssignButton = type === 1;
  const { data, isLoading, error, refetch } = useFetch('/executive', { initialState: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const rowsPerPage = 10;
  const navigate = useNavigate();
  const { setToast } = useApp();

  const [serviceType, setServiceType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [statusModal, setStatusModal] = useState({
    open: false,
    serviceOrderId: null,
    status: 'in_progress',
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [intakeModal, setIntakeModal] = useState({
    open: false,
    serviceId: null,
    companyId: null,
  });
  const [intakeData, setIntakeData] = useState(null);
  const [isLoadingIntake, setIsLoadingIntake] = useState(false);
  const [intakeError, setIntakeError] = useState(null);

  const [dragging, setDragging] = useState({
    service_order_id: null,
    fromStatus: null,
  });

  const [assignModal, setAssignModal] = useState({
    open: false,
    serviceOrderId: null,
    userId: '',
  });
  const [executives, setExecutives] = useState([]);
  const [isLoadingExecutives, setIsLoadingExecutives] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, serviceType, dateFrom, dateTo]);

  const serviceTypeOptions = useMemo(() => {
    const map = new Map();
    (data || []).forEach((item) => {
      const id = item?.service_id != null ? String(item.service_id) : '';
      const name = String(item?.service_name || '').trim();
      const key = id ? `id:${id}` : name ? `name:${name}` : '';
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          value: key,
          label: id && name ? `${name} (#${id})` : name || `Servicio #${id}`,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [data]);

  const filteredData = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = String(search || '')
      .trim()
      .toLowerCase();

    const from = dateFrom ? toDateOnly(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? toDateOnly(`${dateTo}T00:00:00`) : null;

    return list.filter((item) => {
      if (q) {
        const hay = [
          item.company_name,
          item.service_name,
          item.service_status,
          item.payment_status,
          item.assigned_to,
          item.service_order_id,
          item.company_id,
          item.service_id,
        ]
          .join(' ')
          .toLowerCase();

        if (!hay.includes(q)) return false;
      }

      if (serviceType) {
        const parts = String(serviceType).split(':');
        const kind = parts[0];
        const val = parts.slice(1).join(':');

        if (kind === 'id') {
          if (String(item?.service_id ?? '') !== String(val)) return false;
        } else if (kind === 'name') {
          if (String(item?.service_name || '').trim() !== String(val).trim()) return false;
        }
      }

      if (from || to) {
        const createdRaw = item?.service_order_created_at;
        const created = createdRaw ? toDateOnly(new Date(createdRaw)) : null;
        if (!created) return false;

        if (from && created < from) return false;
        if (to && created > to) return false;
      }

      return true;
    });
  }, [data, search, serviceType, dateFrom, dateTo]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredData.length / rowsPerPage)),
    [filteredData.length]
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = useMemo(
    () => filteredData.slice(startIndex, startIndex + rowsPerPage),
    [filteredData, startIndex]
  );

  const formatAmount = (amountCents) => {
    const amount = Number(amountCents || 0) / 100;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const normalizeServiceStatus = (status) => {
    const map = {
      created: 'Created',
      in_progress: 'In Progress',
      finished: 'Finished',
      canceled: 'Canceled',
      pending_payment: 'Pendiente',
    };
    return map[status] || status || 'Sin estado';
  };

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const openStatusModal = (serviceOrderId, currentStatus) => {
    const safeStatus = statusOptions.some((x) => x.value === currentStatus)
      ? currentStatus
      : 'in_progress';
    setUpdateError(null);
    setStatusModal({ open: true, serviceOrderId, status: safeStatus });
  };

  const closeStatusModal = () => {
    if (isUpdatingStatus) return;
    setStatusModal({ open: false, serviceOrderId: null, status: 'in_progress' });
    setUpdateError(null);
  };

  const handleGoToRepository = (item) => {
    navigate(`/dashboard/repository/${item.service_code}/${item.company_id}`);
  };

  const handleUpdateStatus = async () => {
    if (!statusModal.serviceOrderId) return;
    try {
      setIsUpdatingStatus(true);
      await privateService.update(`/executive/${statusModal.serviceOrderId}/status`, {
        status: statusModal.status,
      });
      closeStatusModal();
      await refetch();
      setToast({
        show: true,
        message: 'Se actualizo el estado correctamente',
        type: 'success',
        button: {},
      });
    } catch (e) {
      setUpdateError(e?.message || 'Error actualizando estado');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const closeIntakeModal = () => {
    if (isLoadingIntake) return;
    setIntakeModal({ open: false, serviceId: null, companyId: null });
    setIntakeData(null);
    setIntakeError(null);
  };

  const handleOpenIntake = async (item) => {
    const serviceId = item?.service_id;
    const companyId = item?.company_id;

    setIntakeError(null);
    setIntakeData(null);
    setIntakeModal({ open: true, serviceId, companyId });

    try {
      setIsLoadingIntake(true);

      const primaryPath = `/executive//services/${serviceId}/companies/${companyId}/intake`;
      const fallbackPath = `/executive/services/${serviceId}/companies/${companyId}/intake`;

      try {
        const res = await privateService.get(primaryPath);
        setIntakeData(res?.data ?? res);
      } catch (e1) {
        const res2 = await privateService.get(fallbackPath);
        setIntakeData(res2?.data ?? res2);
      }
    } catch (e) {
      setIntakeError(e?.message || 'Error cargando información');
    } finally {
      setIsLoadingIntake(false);
    }
  };

  const getOrderStatus = (item) => {
    if (item?.service_status === 'attending') return 'in_progress';
    if (item?.service_status === 'finished') return 'finished';
    if (item?.service_status === 'canceled') return 'canceled';
    if (item?.service_status === 'created') return 'created';
    if (item?.service_status === 'in_progress') return 'in_progress';
    return 'created';
  };

  const handleDragStart = (item) => {
    setDragging({
      service_order_id: item.service_order_id,
      fromStatus: getOrderStatus(item),
    });
  };

  const handleDrop = async (toStatus) => {
    if (!dragging.service_order_id) return;
    if (dragging.fromStatus === toStatus) {
      setDragging({ service_order_id: null, fromStatus: null });
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await privateService.update(`/executive/${dragging.service_order_id}/status`, {
        status: toStatus,
      });
      await refetch();
      setToast({
        show: true,
        message: 'Se actualizo el estado correctamente',
        type: 'success',
        button: {},
      });
    } catch (e) {
      setUpdateError(e?.message || 'Error actualizando estado');
    } finally {
      setIsUpdatingStatus(false);
      setDragging({ service_order_id: null, fromStatus: null });
    }
  };

  const columns = useMemo(() => {
    const base = {
      created: [],
      in_progress: [],
      finished: [],
      canceled: [],
    };

    filteredData.forEach((item) => {
      const st = getOrderStatus(item);
      if (!base[st]) base.created.push(item);
      else base[st].push(item);
    });

    return base;
  }, [filteredData]);

  const openAssignModal = async (serviceOrderId, serviceId) => {
    setAssignError(null);
    setAssignModal({ open: true, serviceOrderId, userId: '' });

    if (executives.length > 0) return;

    try {
      setIsLoadingExecutives(true);
      const res = await privateService.get('/executive/executives/' + serviceId);
      const list = res?.data ?? res ?? [];
      setExecutives(Array.isArray(list) ? list : []);
    } catch (e) {
      setAssignError(e?.message || 'Error cargando ejecutivos');
    } finally {
      setIsLoadingExecutives(false);
    }
  };

  const closeAssignModal = () => {
    if (isAssigning) return;
    setAssignModal({ open: false, serviceOrderId: null, userId: '' });
    setAssignError(null);
  };

  const handleAssign = async () => {
    if (!assignModal.serviceOrderId) return;

    const userIdNum = Number(assignModal.userId);
    if (!Number.isFinite(userIdNum) || userIdNum <= 0) {
      setAssignError('Selecciona un ejecutivo');
      return;
    }

    try {
      setIsAssigning(true);
      setAssignError(null);

      await privateService.update(`/executive/${assignModal.serviceOrderId}/assigne`, {
        userId: userIdNum,
      });

      closeAssignModal();
      await refetch();
      setToast({
        show: true,
        message: 'Se asignó correctamente',
        type: 'success',
        button: {},
      });
    } catch (e) {
      setAssignError(e?.message || 'Error asignando');
    } finally {
      setIsAssigning(false);
    }
  };

  const getAssignedInitial = (email) => {
    const s = String(email || '').trim();
    if (!s) return '?';
    return s[0].toUpperCase();
  };

  const clearFilters = () => {
    setSearch('');
    setServiceType('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
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
      <Switch value={isUpdatingStatus || isAssigning}>
        <Switch.Item case={true}>
          <div className="mb-4 border border-gray-300 rounded-xl px-4 py-3 bg-primary text-white">
            Cargando...
          </div>
        </Switch.Item>
      </Switch>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div className="inline-flex rounded-xl border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm ${
                viewMode === 'table' ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'
              }`}>
              Tabla
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-4 py-2 text-sm ${
                viewMode === 'board' ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'
              }`}>
              Tablero
            </button>
          </div>

          <div className="relative w-full max-w-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-10 focus:outline-none"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="w-full">
            <label className="text-xs text-gray-600 mb-1 block">Tipo de servicio</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white">
              <option value="">Todos</option>
              {serviceTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="text-xs text-gray-600 mb-1 block">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
            />
          </div>

          <div className="w-full">
            <label className="text-xs text-gray-600 mb-1 block">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
            />
          </div>

          <div className="w-full flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition inline-flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <Switch value={viewMode === 'table'}>
        <Switch.Item case={true}>
          <Switch value={paginatedData.length > 0}>
            <Switch.Item case={true}>
              <div className="overflow-x-auto rounded-2xl border border-gray-300">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-300">
                    <tr>
                      <th className="py-3 px-4">ID Servicio</th>
                      <th className="py-3 px-4">Empresa</th>
                      <th className="py-3 px-4">Servicio</th>
                      <th className="py-3 px-4">Asignado a</th>
                      <th className="py-3 px-4">Estado servicio</th>
                      <th className="py-3 px-4">Estado pago</th>
                      {showAmount && <th className="py-3 px-4">Monto</th>}
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.map((item) => (
                      <tr key={`${item.service_order_id}-${item.company_id}`}>
                        <td className="py-3 px-4">{item.service_order_id}</td>
                        <td className="py-3 px-4">{item.company_name}</td>
                        <td className="py-3 px-4">{item.service_name}</td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                              {getAssignedInitial(item.assigned_to)}
                            </div>

                            <div className="relative group inline-flex items-center">
                              <Info className="w-4 h-4 text-gray-500" />
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-10">
                                <div className="whitespace-nowrap text-xs bg-black text-white rounded-lg px-3 py-2 shadow-lg">
                                  {item.assigned_to || 'Sin asignación'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

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

                        {showAmount && (
                          <td className="py-3 px-4">{formatAmount(item.payment_amount_cents)}</td>
                        )}

                        <td className="py-3 px-4">
                          {item.service_order_created_at
                            ? format(new Date(item.service_order_created_at), 'd MMM yyyy, HH:mm', {
                                locale: es,
                              })
                            : '—'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleGoToRepository(item)}
                              className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-sm">
                              Repositorio
                            </button>

                            <button
                              onClick={() => handleOpenIntake(item)}
                              className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-sm inline-flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              Info
                            </button>

                            {showAssignButton && (
                              <button
                                onClick={() =>
                                  openAssignModal(item.service_order_id, item.service_id)
                                }
                                className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-sm">
                                Asignar
                              </button>
                            )}

                            <button
                              onClick={() =>
                                openStatusModal(item.service_order_id, item.service_status)
                              }
                              className="px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition text-sm">
                              Estado
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
        </Switch.Item>

        <Switch.Item case={false}>
          <Switch value={filteredData.length > 0}>
            <Switch.Item case={true}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { key: 'created', title: 'created' },
                  { key: 'in_progress', title: 'in_progress' },
                  { key: 'finished', title: 'finished' },
                  { key: 'canceled', title: 'canceled' },
                ].map((col) => (
                  <div
                    key={col.key}
                    className="rounded-2xl border border-gray-300 bg-white min-h-[300px] p-3"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(col.key)}>
                    <div className="font-semibold text-sm mb-3 capitalize">{col.title}</div>

                    <div className="flex flex-col gap-3">
                      {(columns[col.key] || []).map((item) => (
                        <div
                          key={`${item.service_order_id}-${item.company_id}`}
                          draggable
                          onDragStart={() => handleDragStart(item)}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-3 cursor-grab active:cursor-grabbing">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs text-gray-600">
                              #{item.service_order_id} · {item.company_name}
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {item.payment_status}
                            </div>
                          </div>

                          <div className="mt-2 text-sm font-semibold">{item.service_name}</div>

                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                              {getAssignedInitial(item.assigned_to)}
                            </div>

                            <div className="relative group inline-flex items-center">
                              <Info className="w-4 h-4 text-gray-500" />
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-10">
                                <div className="whitespace-nowrap text-xs bg-black text-white rounded-lg px-3 py-2 shadow-lg">
                                  {item.assigned_to || 'Sin asignación'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-gray-600">
                            {item.service_order_created_at
                              ? format(
                                  new Date(item.service_order_created_at),
                                  'd MMM yyyy, HH:mm',
                                  {
                                    locale: es,
                                  }
                                )
                              : '—'}
                          </div>

                          {showAmount && (
                            <div className="mt-2 text-sm font-semibold">
                              {formatAmount(item.payment_amount_cents)}
                            </div>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => handleGoToRepository(item)}
                              className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-xs">
                              Repositorio
                            </button>

                            <button
                              onClick={() => handleOpenIntake(item)}
                              className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-xs inline-flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              Info
                            </button>

                            <button
                              onClick={() => openAssignModal(item.service_order_id)}
                              className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-xs">
                              Asignar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Switch.Item>

            <Switch.Item case={false}>
              <div className="border border-gray-300 rounded-xl h-40 flex justify-center items-center">
                Sin registros
              </div>
            </Switch.Item>
          </Switch>
        </Switch.Item>
      </Switch>

      <Switch value={statusModal.open}>
        <Switch.Item case={true}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeStatusModal} />
            <div className="relative bg-white w-full max-w-md rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Cambiar estado</h3>

              <select
                value={statusModal.status}
                onChange={(e) => setStatusModal((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {updateError && <div className="text-red-600 mt-2">{updateError}</div>}

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={closeStatusModal} className="px-4 py-2 rounded-lg bg-gray-200">
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50">
                  {isUpdatingStatus ? 'Cargando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </Switch.Item>
      </Switch>

      <Switch value={assignModal.open}>
        <Switch.Item case={true}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeAssignModal} />
            <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold">Asignar orden</h3>
                <button
                  onClick={closeAssignModal}
                  disabled={isAssigning}
                  className="px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50">
                  <X />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-600">Orden #{assignModal.serviceOrderId}</div>

                <Switch value={isLoadingExecutives}>
                  <Switch.Item case={true}>
                    <div className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                      Cargando ejecutivos...
                    </div>
                  </Switch.Item>
                </Switch>

                <select
                  value={assignModal.userId}
                  onChange={(e) => setAssignModal((prev) => ({ ...prev, userId: e.target.value }))}
                  disabled={isLoadingExecutives || isAssigning}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Selecciona un ejecutivo</option>
                  {(executives || []).map((u) => (
                    <option key={u.user_id ?? u.id} value={u.user_id ?? u.id}>
                      {(u.name || '').trim() ? `${u.name} (${u.email})` : u.email}
                    </option>
                  ))}
                </select>

                {assignError && <div className="text-red-600 text-sm">{assignError}</div>}

                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAssign}
                    disabled={isLoadingExecutives || isAssigning}
                    className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50">
                    {isAssigning ? 'Cargando...' : 'Asignar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Switch.Item>
      </Switch>

      <Switch value={intakeModal.open}>
        <Switch.Item case={true}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeIntakeModal} />
            <div className="relative bg-white w-full max-w-5xl rounded-2xl p-6 max-h-[85vh] overflow-hidden">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Información del servicio</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    Servicio #{intakeModal.serviceId} · Compañía #{intakeModal.companyId}
                  </div>
                </div>

                <button
                  onClick={closeIntakeModal}
                  className="px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  <X></X>
                </button>
              </div>

              <div className="border border-gray-200 rounded-2xl p-4 overflow-auto max-h-[65vh] bg-gray-50">
                {isLoadingIntake && <div>Cargando...</div>}
                {!isLoadingIntake && intakeError && (
                  <div className="text-red-600">{intakeError}</div>
                )}
                {!isLoadingIntake && !intakeError && (
                  <pre className="text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(intakeData, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </Switch.Item>
      </Switch>
    </div>
  );
};

export default ServicesTable;
