import { isToday, isAfter, startOfDay } from 'date-fns';

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function isValidDate(dateString) {
  const givenDate = new Date(dateString);
  const today = startOfDay(new Date());

  // returns true if it is today or days after today
  return isToday(givenDate) || isAfter(givenDate, today);
}

export function formatToDatetime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export function deriveFilenameFromUrl(url, fallback = 'logo.png') {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop() || fallback;
    return last.includes('.') ? last : fallback;
  } catch {
    return fallback;
  }
}

export async function downloadImageFromUrl(url, filename) {
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename || deriveFilenameFromUrl(url);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch (err) {
    console.warn('Fallo descarga como blob, abriendo en nueva pestaña:', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const [, payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp < now;
  } catch (err) {
    console.error('Invalid JWT:', err);
    return true;
  }
}

export function normalizeAppointmentStatus(status) {
  switch (status) {
    case 'scheduled':
      return 'Agendado';
    case 'rescheduled':
      return 'Reagendado';
    case 'completed':
      return 'Finalizado';
    case 'canceled':
      return 'Cancelado';
    default:
      return 'Sin agendar';
  }
}

export function normalizePaymentStatus(status) {
  switch (status) {
    case 'succeeded':
      return 'Pagado';
    case 'pending':
      return 'Pendiente';
    case 'requires_action':
      return 'Accion requerida';
    case 'processing':
      return 'Procesando';
    case 'failed':
      return 'Fallado';
    case 'canceled':
      return 'Cancelado';
    case 'refunded':
      return 'Reembolsado';
    default:
      return 'No pagado';
  }
}

export function formatAmount(amountCents, currency = 'CLP', locale = 'es-CL') {
  if (typeof amountCents !== 'number' || isNaN(amountCents)) return '';

  const amount = amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatBytesToMB(bytes) {
  if (!bytes || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}
