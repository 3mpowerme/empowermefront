import React, { useMemo, useState } from 'react';
import Switch from '../../../components/Switch/Switch';
import { useFetch } from '../../../hooks/useFetch';
import { ClipboardList, Megaphone, Search, Settings, X } from 'lucide-react';
import { privateService } from '../../../services/privateService';
import { useApp } from '../../../hooks/useApp';

const UsersTable = () => {
  const { data, isLoading, error, refetch } = useFetch('/executive/users', {
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

  const [roleModal, setRoleModal] = useState({
    open: false,
    userId: null,
    currentRoleId: null,
  });
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [saveRoleError, setSaveRoleError] = useState(null);
  const { setToast } = useApp();

  const [roleFilterId, setRoleFilterId] = useState('');
  const [filterRoles, setFilterRoles] = useState([]);
  const [filterRolesLoading, setFilterRolesLoading] = useState(false);
  const [filterRolesError, setFilterRolesError] = useState(null);

  const [servicesModal, setServicesModal] = useState({
    open: false,
    userId: null,
  });
  const [servicesList, setServicesList] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [saveServicesError, setSaveServicesError] = useState(null);

  const filteredData = useMemo(() => {
    const q = (search || '').toLowerCase();
    const roleIdStr = roleFilterId;
    return (data || []).filter((item) => {
      const matchesSearch = !q
        ? true
        : [item.email, item.name, item.role_name, item.role_description, item.created_at]
            .join(' ')
            .toLowerCase()
            .includes(q);

      const matchesRole = !roleIdStr ? true : item.role_id == roleIdStr;
      return matchesSearch && matchesRole;
    });
  }, [data, search, roleFilterId]);

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

  const openRoleModal = async (userId, currentRoleId) => {
    setSaveRoleError(null);
    setRolesError(null);
    setRoleModal({ open: true, userId, currentRoleId });
    setSelectedRoleId(currentRoleId ? String(currentRoleId) : '');

    try {
      setRolesLoading(true);
      const res = await privateService.get('/executive/roles');
      const list = Array.isArray(res) ? res : res?.data || [];
      setRoles(Array.isArray(list) ? list : []);
    } catch (e) {
      setRolesError(e?.message || 'Error obteniendo roles');
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const closeRoleModal = () => {
    if (isSavingRole) return;
    setRoleModal({ open: false, userId: null, currentRoleId: null });
    setSelectedRoleId('');
    setSaveRoleError(null);
    setRolesError(null);
  };

  const handleSaveRole = async () => {
    if (!roleModal.userId) return;
    const roleId = selectedRoleId;
    console.log('roleId', roleId);
    if (!roleId) {
      setSaveRoleError('Selecciona un rol');
      return;
    }

    try {
      setIsSavingRole(true);
      setSaveRoleError(null);

      await privateService.create(`/executive/roles/${roleId}`, {
        userId: roleModal.userId,
      });

      closeRoleModal();
      refetch();
      setToast({
        show: true,
        message: 'El rol se guardo existosamente',
        button: {},
        type: 'success',
      });
    } catch (e) {
      setSaveRoleError(e?.message || 'Error guardando rol');
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleOpenRoleFilter = async () => {
    if (filterRolesLoading || filterRoles.length > 0) return;

    try {
      setFilterRolesLoading(true);
      setFilterRolesError(null);
      const res = await privateService.get('/executive/roles');
      const list = Array.isArray(res) ? res : res?.data || [];
      setFilterRoles(Array.isArray(list) ? list : []);
    } catch (e) {
      setFilterRolesError(e?.message || 'Error obteniendo roles');
      setFilterRoles([]);
    } finally {
      setFilterRolesLoading(false);
    }
  };

  const openServicesModal = async (userId) => {
    setSaveServicesError(null);
    setServicesError(null);
    setServicesModal({ open: true, userId });

    try {
      setServicesLoading(true);
      const res = await privateService.get('/executive/services/' + userId);
      const payload = res?.data || res || {};
      const list = Array.isArray(payload?.services) ? payload.services : [];
      const assigned = Array.isArray(payload?.assignedServices)
        ? payload.assignedServices
        : Array.isArray(payload?.assignServices)
          ? payload.assignServices
          : Array.isArray(payload?.assignedServiceIds)
            ? payload.assignedServiceIds
            : [];
      setServicesList(list);
      setSelectedServiceIds(assigned.map((x) => Number(x)).filter((x) => Number.isFinite(x)));
    } catch (e) {
      setServicesError(e?.message || 'Error obteniendo servicios');
      setServicesList([]);
      setSelectedServiceIds([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const closeServicesModal = () => {
    if (isSavingServices) return;
    setServicesModal({ open: false, userId: null });
    setServicesList([]);
    setSelectedServiceIds([]);
    setServicesError(null);
    setSaveServicesError(null);
  };

  const toggleService = (serviceId) => {
    const idNum = Number(serviceId);
    if (!Number.isFinite(idNum)) return;

    setSelectedServiceIds((prev) => {
      const exists = prev.includes(idNum);
      if (exists) return prev.filter((x) => x !== idNum);
      return [...prev, idNum];
    });
  };

  const handleSelectAllServices = () => {
    setSelectedServiceIds(
      (servicesList || []).map((s) => Number(s.id)).filter((x) => Number.isFinite(x))
    );
  };

  const handleDeselectAllServices = () => {
    setSelectedServiceIds([]);
  };

  const handleSaveServices = async () => {
    const userId = servicesModal.userId;
    if (!userId) return;

    try {
      setIsSavingServices(true);
      setSaveServicesError(null);

      const ids = (selectedServiceIds || [])
        .map((x) => Number(x))
        .filter((x) => Number.isFinite(x));

      await privateService.update(`/executive/services/${userId}`, ids);

      closeServicesModal();
      refetch();
      setToast({
        show: true,
        message: 'Los servicios se guardaron exitosamente',
        button: {},
        type: 'success',
      });
    } catch (e) {
      setSaveServicesError(e?.message || 'Error guardando servicios');
    } finally {
      setIsSavingServices(false);
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

  const showSendNotificationButton = false;

  return (
    <div className="w-full max-w-6xl mx-auto mt-10">
      <div className="flex justify-end mb-4 gap-3">
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

        <div className="relative w-full max-w-xs">
          <select
            value={roleFilterId}
            onFocus={handleOpenRoleFilter}
            onClick={handleOpenRoleFilter}
            onChange={(e) => {
              setRoleFilterId(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none">
            <option value="">{filterRolesLoading ? 'Cargando roles...' : 'Todos los roles'}</option>
            {filterRoles.map((r) => {
              return (
                <option key={r.role_id} value={r.id}>
                  {r.name}
                </option>
              );
            })}
          </select>
          {filterRolesError && <div className="text-xs text-red-600 mt-1">{filterRolesError}</div>}
        </div>
      </div>

      <Switch value={paginatedData.length > 0}>
        <Switch.Item case={true}>
          <div className="overflow-x-auto rounded-2xl border border-gray-300">
            <table className="w-full text-left">
              <thead className="border-b border-gray-300">
                <tr>
                  <th className="py-3 px-4">ID Usuario</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Fecha registro</th>
                  <th className="py-3 px-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item) => (
                  <tr key={`${item.user_id}-${item.role_id}`}>
                    <td className="py-3 px-4">{item.user_id}</td>
                    <td className="py-3 px-4">{item.email}</td>
                    <td className="py-3 px-4">{item.name || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.role_name}</span>
                        <span className="text-xs text-gray-600">{item.role_description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.created_at ? new Date(item.created_at).toLocaleString('es-CL') : '—'}
                    </td>
                    <td className="py-3 px-4 flex flex-row gap-2">
                      <button
                        onClick={() => openRoleModal(item.user_id, item.role_id)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white cursor-pointer transition"
                        title="Cambiar rol">
                        <Settings className="w-4 h-4 " />
                      </button>

                      {item.role_id == 2 && (
                        <button
                          onClick={() => openServicesModal(item.user_id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white cursor-pointer transition"
                          title="Cambiar servicios asignados">
                          <ClipboardList className="w-4 h-4" />
                        </button>
                      )}

                      {showSendNotificationButton && (
                        <button
                          onClick={() => openNotificationModal(item.company_id, item.user_id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white cursor-pointer transition"
                          title="Enviar notificación">
                          <Megaphone className="w-4 h-4" />
                        </button>
                      )}
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
                  className="px-3 py-1 rounded-lg hover:bg-gray-300 transition disabled:opacity-50">
                  <X />
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

      <Switch value={roleModal.open}>
        <Switch.Item case={true}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeRoleModal} />
            <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Cambiar rol</h3>
                <button
                  onClick={closeRoleModal}
                  disabled={isSavingRole}
                  className="px-3 py-1 rounded-lg hover:bg-gray-300 transition disabled:opacity-50">
                  <X />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Rol</label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    disabled={rolesLoading || isSavingRole}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none">
                    <option value="">
                      {rolesLoading ? 'Cargando roles...' : 'Selecciona un rol'}
                    </option>
                    {roles.map((r) => (
                      <option key={r.role_id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {rolesError && <div className="text-sm text-red-600">{rolesError}</div>}
                </div>

                {saveRoleError && <div className="text-sm text-red-600">{saveRoleError}</div>}

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={closeRoleModal}
                    disabled={isSavingRole}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={isSavingRole || rolesLoading}
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition disabled:opacity-50">
                    {isSavingRole ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Switch.Item>
      </Switch>

      <Switch value={servicesModal.open}>
        <Switch.Item case={true}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeServicesModal} />
            <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Cambiar servicios asignados</h3>
                <button
                  onClick={closeServicesModal}
                  disabled={isSavingServices}
                  className="px-3 py-1 rounded-lg hover:bg-gray-300 transition disabled:opacity-50">
                  <X />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {servicesLoading && (
                  <div className="border border-gray-300 rounded-xl h-24 flex justify-center items-center">
                    Cargando...
                  </div>
                )}

                {!servicesLoading && servicesError && (
                  <div className="text-sm text-red-600">{servicesError}</div>
                )}

                {!servicesLoading && !servicesError && (
                  <>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSelectAllServices}
                        disabled={isSavingServices}
                        className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50">
                        Marcar todos
                      </button>
                      <button
                        onClick={handleDeselectAllServices}
                        disabled={isSavingServices}
                        className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50">
                        Desmarcar todos
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-3 max-h-72 overflow-auto flex flex-col gap-2">
                      {servicesList.map((s) => {
                        const checked = selectedServiceIds.includes(Number(s.id));
                        return (
                          <label key={s.id} className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleService(s.id)}
                              disabled={isSavingServices}
                              className="mt-1"
                            />
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{s.name}</span>
                              <span className="text-xs text-gray-600">{s.code}</span>
                            </div>
                          </label>
                        );
                      })}
                      {servicesList.length === 0 && (
                        <div className="text-sm text-gray-600">Sin servicios</div>
                      )}
                    </div>
                  </>
                )}

                {saveServicesError && (
                  <div className="text-sm text-red-600">{saveServicesError}</div>
                )}

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={closeServicesModal}
                    disabled={isSavingServices}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveServices}
                    disabled={isSavingServices || servicesLoading}
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition disabled:opacity-50">
                    {isSavingServices ? 'Guardando...' : 'Guardar'}
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

export default UsersTable;
