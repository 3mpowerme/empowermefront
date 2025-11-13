import React from 'react';
import Button from '../Button/Button';

export default function SessionRefreshModal({ open, secondsLeft = 60, onStaySignedIn, onLogout }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Tu sesión está por expirar</h2>
        <p className="mt-2 text-sm text-gray-600">
          Por seguridad, tu sesión caduca en <span className="font-semibold">{secondsLeft}s</span>.
          ¿Quieres mantener la sesión activa?
        </p>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button variant="ghost" onClick={onLogout}>
            Cerrar sesión
          </button>
          <button onClick={onStaySignedIn}>Mantener sesión</button>
        </div>
      </div>
    </div>
  );
}
