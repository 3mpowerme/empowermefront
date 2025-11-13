import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open = false, onClose = () => {}, title, subtitle, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const bodyChild = React.Children.toArray(children).find(
    (c) => c?.type?.displayName === 'ModalBody'
  );
  const footerChild = React.Children.toArray(children).find(
    (c) => c?.type?.displayName === 'ModalFooter'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto"
      aria-modal="true"
      role="dialog">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="px-6 pt-6 pb-2">
          <div>
            <div className="pr-6">
              {title && <h3 className="text-center text-xl font-semibold text-black">{title}</h3>}
              {subtitle && <p className="text-center mt-1 text-sm text-black">{subtitle}</p>}
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 p-1 rounded-2xl hover:bg-body bg-black focus:outline-none">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-transparent">
          {bodyChild || <div className="text-sm text-black"> </div>}
        </div>

        <div className="px-6 py-5 flex justify-center">{footerChild || null}</div>
      </div>
    </div>
  );
}

export function ModalBody({ children, className = '' }) {
  return <div className={`text-sm text-gray-700 dark:text-gray-300 ${className}`}>{children}</div>;
}
ModalBody.displayName = 'ModalBody';

export function ModalFooter({ children, className = '' }) {
  return <div className={`flex items-center gap-2 ${className}`}>{children}</div>;
}
ModalFooter.displayName = 'ModalFooter';
