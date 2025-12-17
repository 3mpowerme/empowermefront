import React from 'react';
import { useNavigate } from 'react-router';
import Button from '../Button/Button';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="text-7xl font-bold text-neutral-900">404</div>

        <div className="mt-4 text-xl font-semibold text-neutral-900">Página no encontrada</div>

        <div className="mt-2 text-sm text-neutral-600">
          La página que intentas visitar no existe o fue movida.
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => navigate(-1)}>Volver atrás</Button>

          <Button onClick={() => navigate('/dashboard')}>Ir al dashboard</Button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
