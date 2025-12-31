import React from 'react';
import { BookOpen } from 'lucide-react';

export default function BrandBookEmptyState({ onCreate }) {
  return (
    <div className="w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 flex flex-col items-center text-center mt-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 mb-4">
        <BookOpen className="h-7 w-7 text-purple-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">Aún no has creado tu Brand Book</h3>

      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        Define la identidad visual y lineamientos de tu marca.
      </p>
      <button
        onClick={onCreate}
        className="flex items-center cursor-pointer shadow-xl hover:scale-105 transition-transform">
        <p className="mt-5 text-white text-sm font-semibold bg-primary rounded-xl px-5 py-2 flex items-center">
          Crear Brand Book
        </p>
      </button>
    </div>
  );
}
