import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import Button from '../Button/Button';

export default function NoCompanyGate({ supportPhone = null, supportEmail = null }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const trimmedName = useMemo(() => companyName?.trim(), [companyName]);
  const canSubmit = trimmedName.length >= 2;

  const goToBuildCompany = () => {
    if (!canSubmit) return;
    setOpen(false);
    navigate(`/buildCompany?name=${encodeURIComponent(trimmedName)}`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Aún no tienes una empresa creada
            </h2>

            <p className="text-sm leading-6 text-slate-600 sm:text-base">
              Para poder usar todos los features de la plataforma necesitas crear una empresa. Si
              requieres otro tipo de acceso, contacta a soporte
              {supportEmail ? ` (${supportEmail})` : ''}
              {supportPhone ? ` (${supportPhone})` : ''}.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setOpen(true)}>Crear empresa</Button>
          </div>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}>
          <div className="animate-slide-in w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
            <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold  sm:text-lg">Crear empresa</div>
                <div className="text-xs  sm:text-sm">Ingresa el nombre para continuar</div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="rounded-lg p-2 text-[color:var(--color-secondary)] transition hover:bg-black/5 hover:text-[color:var(--color-blue-strong)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <label className="block text-sm font-medium text-[color:var(--color-blue-strong)]">
                Nombre de la empresa
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej. Mi Empresa SpA"
                autoFocus
                className="mt-2 w-full rounded-xl border border-[color:var(--color-opaque)] bg-white px-4 py-3 text-sm text-[color:var(--color-blue-strong)] outline-none transition placeholder:text-[color:var(--color-secondary)] focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary-opaque)] sm:text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goToBuildCompany();
                  if (e.key === 'Escape') setOpen(false);
                }}
              />
            </div>

            <div className="flex items-center justify-end border-t border-[color:var(--color-opaque)] px-5 py-4 sm:px-6">
              <Button onClick={goToBuildCompany} disabled={!canSubmit}>
                Crear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
