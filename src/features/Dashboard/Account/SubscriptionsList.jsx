import { useEffect, useMemo, useState } from 'react';
import { XCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Button from '../../../components/Button/Button';
import { privateService } from '../../../services/privateService';
import { useAccount } from '../../../hooks/useAccount';

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ status, cancelAtPeriodEnd }) {
  const map = {
    active: 'bg-green-100 text-green-800 ring-green-200',
    trialing: 'bg-blue-100 text-blue-800 ring-blue-200',
    past_due: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    canceled: 'bg-gray-100 text-gray-700 ring-gray-200',
    unpaid: 'bg-red-100 text-red-800 ring-red-200',
    incomplete: 'bg-orange-100 text-orange-800 ring-orange-200',
    incomplete_expired: 'bg-gray-100 text-gray-600 ring-gray-200',
  };

  const mapStatusLabel = {
    active: 'Activa',
    trialing: 'En período de prueba',
    past_due: 'Pago vencido',
    canceled: 'Cancelada',
    unpaid: 'No pagada',
    incomplete: 'Incompleta',
  };

  const cls = map[status] || 'bg-slate-100 text-slate-800 ring-slate-200';
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${cls}`}>
        {mapStatusLabel[status]}
      </span>
      {cancelAtPeriodEnd && (
        <span
          title="Se cancelará al final del periodo"
          className="inline-flex items-center gap-1 text-xs text-amber-700">
          <Clock size={14} /> Cancelará al final del periodo
        </span>
      )}
    </div>
  );
}

export default function SubscriptionsManager() {
  const { activeCompany: companyId } = useAccount();

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const hasData = useMemo(() => subs && subs.length > 0, [subs]);

  async function fetchSubs() {
    if (!companyId) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await privateService.get(`/subscription/${companyId}`);
      setSubs(data?.subscriptions || []);
    } catch (e) {
      setError(e?.error || e?.message || 'No se pudieron cargar las suscripciones');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubs();
  }, [companyId]);

  const openCancel = (sub) => {
    setConfirm({
      externalSubscriptionId: sub.externalSubscriptionId,
      planName: sub.plan?.name || 'Plan',
    });
    setCancelAtPeriodEnd(true);
  };

  const closeCancel = () => {
    setConfirm(null);
    setCancelling(false);
  };

  async function handleCancel() {
    if (!confirm) return;
    setCancelling(true);
    setError('');
    try {
      await privateService.create(`/subscription/${confirm.externalSubscriptionId}/cancel`, {
        mode: 'at_period_end',
        // forcing at_period_end for now
        //mode: cancelAtPeriodEnd ? 'at_period_end' : 'immediate',
      });

      closeCancel();
      setSuccessMsg(
        cancelAtPeriodEnd
          ? 'La suscripción se cancelará al finalizar el periodo actual.'
          : 'La suscripción fue cancelada inmediatamente.'
      );
      setTimeout(() => {
        fetchSubs();
      }, 1000);
    } catch (e) {
      setError(e?.error || e?.message || 'No se pudo cancelar la suscripción');
      setCancelling(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4 mt-5">
        <h2 className="text-xl font-semibold text-slate-900">Mis suscripciones</h2>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 p-4 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
          <div className="h-4 w-72 bg-slate-200 rounded mb-3" />
          <div className="h-24 w-full bg-slate-100 rounded" />
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {!loading && !hasData && !error && (
        <div className="rounded-lg border border-slate-200 p-6 text-center text-slate-600">
          No tienes suscripciones activas por el momento.
        </div>
      )}

      <div className="grid gap-4">
        {subs.map((s) => (
          <div
            key={s.externalSubscriptionId}
            className="rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-base font-semibold text-slate-900">
                  {s.plan?.name || 'Plan'}
                </div>
                <div className="text-sm text-slate-600">{s.plan?.priceSummary || '—'}</div>
                <StatusBadge status={s.status} cancelAtPeriodEnd={s.cancelAtPeriodEnd} />
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-800">Inicio:</span>{' '}
                  {fmtDate(s.currentPeriodStart)}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Fin:</span>{' '}
                  {fmtDate(s.currentPeriodEnd)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {false && (
                <label className="inline-flex items-center gap-2 select-none text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={cancelAtPeriodEnd}
                    onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
                  />
                  <span className="text-slate-700">
                    Cancelar al final del periodo (recomendado)
                  </span>
                </label>
              )}

              {!s.cancelAtPeriodEnd && (
                <Button
                  onClick={() => openCancel(s)}
                  className="bg-red-600 hover:bg-red-700 text-white px-5">
                  <XCircle className="mr-1 inline" size={16} /> Cancelar suscripción
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeCancel} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirmar cancelación</h3>
            <p className="mt-2 text-sm text-slate-700">
              Vas a cancelar <span className="font-medium">{confirm.planName}</span>.
              {cancelAtPeriodEnd
                ? ' Se desactivará al finalizar el periodo actual.'
                : ' Se desactivará de inmediato.'}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button onClick={closeCancel} className="">
                Cerrar
              </Button>
              <Button
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white">
                {cancelling ? 'Cancelando…' : 'Confirmar cancelación'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
