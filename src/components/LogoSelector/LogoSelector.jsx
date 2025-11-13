import React from 'react';
import classNames from 'classnames';

export default function LogoSelector({ logos = [], selectedLogoId = null, onSelect }) {
  if (!logos.length) {
    return (
      <div className="flex justify-center items-center py-10 text-gray-500 text-sm">
        Logos no disponibles
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {logos.map((logo) => {
        const isSelected = logo.id === selectedLogoId;
        return (
          <button
            key={logo.id}
            onClick={() => onSelect?.(logo.id)}
            className={classNames(
              'relative group border rounded-xl overflow-hidden transition-all',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isSelected
                ? 'border-primary ring-2 ring-primary ring-offset-1'
                : 'border-gray-300 hover:border-primary/50'
            )}>
            <img
              src={logo.url}
              alt={`Logo ${logo.id}`}
              className={classNames(
                'object-contain w-full h-50 bg-white transition-transform duration-200',
                isSelected ? 'scale-105' : 'group-hover:scale-105'
              )}
            />

            {isSelected && (
              <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                Elegido
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
