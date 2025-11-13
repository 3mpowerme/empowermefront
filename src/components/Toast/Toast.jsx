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
        return classNames('text-red-600 mr-2');
      case 'success':
        return classNames('text-primary mr-2');
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
        'fixed top-6 right-6 z-60 flex justify-center w-full pointer-events-none',
        { hidden: !show }
      )}>
      <div
        className={classNames(
          'min-w-1/3 bg-white border rounded-xl shadow-lg flex items-center justify-between px-4 py-3 pointer-events-auto animate-slide-in',
          getDivClassNamesByType(type)
        )}>
        <span className={getSpanClassNamesByType(type)}>{message}</span>
        {buttonMessage && onClick && (
          <span className="mr-2">
            <Button variant="wizard" onClick={onClick}>
              {buttonMessage}
            </Button>
          </span>
        )}
        <button className={getButtonClassNamesByType(type)} onClick={handleClose}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
