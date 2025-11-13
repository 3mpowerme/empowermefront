import React from 'react';

export default function ErrorScreen({ status = 404, message = '¡Ups! Algo salió mal.' }) {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <h1 className="text-6xl font-extrabold text-red-500 mb-4">{status}</h1>
        <h2 className="text-2xl font-semibold mb-2">{message}</h2>
        <p className="text-opaque mb-6">Puedes volver a la página anterior o intentar de nuevo.</p>
        <button
          onClick={goBack}
          className="inline-block px-6 py-3 bg-primary text-white rounded-xl shadow-md hover:shadow-lg cursor-pointer transition">
          Atrás
        </button>
      </div>
      <p className="mt-6 text-secondary text-sm">
        &copy; {new Date().getFullYear()} Copyright EmpowerMe
      </p>
    </div>
  );
}
