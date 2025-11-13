import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ImageModal({ isOpen, url, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-[101] max-w-4xl w-[90vw] max-h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
          <span className="text-sm font-medium text-gray-800 truncate pr-2">Vista previa</span>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-700 hover:bg-gray-100"
            aria-label="Cerrar"
            title="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2 bg-gray-50">
          <div className="w-full max-h-[80vh] overflow-auto">
            {url ? (
              <img src={url} alt="Imagen de mockup" className="w-full h-auto object-contain" />
            ) : (
              <div className="h-[60vh] flex items-center justify-center text-sm text-gray-500">
                Imagen no disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
