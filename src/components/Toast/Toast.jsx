import { useEffect } from 'react';
import { X } from 'lucide-react';
import classNames from 'classnames';
import Button from '../Button/Button';

export default function Toast({
  show = false,
  message,
  duration = 10000,
  onClose,
  type = 'success',
  button: { message: buttonMessage, onClick } = {},
}) {
  useEffect(() => {
    const timer = setTimeout(() => handleClose(), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  const handleClose = () => {
    onClose();
  };

  const getDivClassNamesByType = (t) => {
    switch (t) {
      case 'error':
        return classNames('border-red-600');
      case 'success':
        return classNames('border-primary');
    }
  };

  const getSpanClassNamesByType = (t) => {
    switch (t) {
      case 'error':
        return classNames('text-red-600');
      case 'success':
        return classNames('text-primary');
    }
  };

  const getButtonClassNamesByType = (t) => {
    switch (t) {
      case 'error':
        return classNames('text-red-600 hover:text-gray-700');
      case 'success':
        return classNames('text-primary hover:text-gray-700');
    }
  };

  return (
    <div
      className={classNames(
        'fixed z-60 flex w-full pointer-events-none',
        'top-3 px-3 justify-center sm:top-6 sm:right-6 sm:px-0 sm:justify-end',
        { hidden: !show }
      )}>
      <div
        className={classNames(
          'relative bg-white border rounded-xl shadow-lg pointer-events-auto animate-slide-in',
          'w-full max-w-[560px] sm:w-auto sm:min-w-[360px]',
          'px-3 py-2 sm:px-4 sm:py-3',
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0',
          getDivClassNamesByType(type)
        )}>
        <span
          className={classNames(
            getSpanClassNamesByType(type),
            'text-sm sm:text-base',
            'break-words pr-6 sm:pr-0'
          )}>
          {message}
        </span>

        <button
          className={classNames(
            getButtonClassNamesByType(type),
            'absolute top-2 right-2 sm:static'
          )}
          onClick={handleClose}>
          <X size={20} />
        </button>

        {buttonMessage && onClick && (
          <div className="flex justify-end sm:ml-2">
            <Button variant="wizard" onClick={onClick}>
              {buttonMessage}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
