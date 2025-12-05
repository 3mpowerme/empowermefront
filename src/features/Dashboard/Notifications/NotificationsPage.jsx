// src/features/Dashboard/Notifications/NotificationsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Filter, Loader2 } from 'lucide-react';
import { privateService } from '../../../services/privateService';
import { useAccount } from '../../../hooks/useAccount';

const isNotificationRead = (n) => Boolean(n.read_at || n.readAt || n.read || n.isRead);

export default function NotificationsPage() {
  const { activeCompany } = useAccount();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeCompany) {
      setNotifications([]);
      return;
    }

    let cancelled = false;

    async function loadAllNotifications() {
      try {
        setLoading(true);
        const data = await privateService.get(`/company-notifications/${activeCompany}`);
        if (cancelled) return;
        setNotifications(data?.notifications || []);
      } catch (e) {
        if (cancelled) return;
        setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAllNotifications();

    return () => {
      cancelled = true;
    };
  }, [activeCompany]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !isNotificationRead(n));
    }
    if (filter === 'read') {
      return notifications.filter((n) => isNotificationRead(n));
    }
    return notifications;
  }, [notifications, filter]);

  const handleNotificationClick = async (notification) => {
    const route =
      notification?.metadata?.route ||
      notification?.metadata?.path ||
      notification?.metadata?.url ||
      '/dashboard';

    if (activeCompany && notification?.id && !isNotificationRead(notification)) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n
        )
      );
      try {
        await privateService.patch(
          `/company-notifications/${activeCompany}/${notification.id}/read`
        );
      } catch (e) {}
    }

    navigate(route);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <Bell size={18} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Notificaciones</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Revisa las notificaciones de tu empresa y filtra por estado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1">
            <Filter size={14} className="text-gray-500" />
            <span className="text-xs text-gray-600">Estado</span>
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded-md ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2 py-1 rounded-md ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              No vistas
            </button>
            <button
              type="button"
              onClick={() => setFilter('read')}
              className={`px-2 py-1 rounded-md ${
                filter === 'read'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              Vistas
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading && (
          <div className="flex items-center justify-center py-10 text-gray-500 text-sm gap-2">
            <Loader2 className="animate-spin" size={16} />
            <span>Cargando notificaciones...</span>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm">
            <Bell className="mb-2 text-gray-400" size={22} />
            <span>No hay notificaciones para este filtro.</span>
          </div>
        )}

        {!loading && filteredNotifications.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {filteredNotifications.map((n) => {
              const read = isNotificationRead(n);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3">
                    <div className="pt-1">
                      <span
                        className={`inline-flex h-2 w-2 rounded-full ${
                          read ? 'bg-gray-300' : 'bg-purple-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-medium truncate ${
                            read ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                          {n.title || 'Notificación'}
                        </p>
                        {n.createdAt && (
                          <span className="text-[10px] uppercase tracking-wide text-gray-400 shrink-0">
                            {new Date(n.createdAt).toLocaleString('es-MX', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      {n.message && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
