import { useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import Button from '../Button/Button';

export default function ScheduleAppointmentNotice({ url, buttonLabel = 'Agendar cita' }) {
  const { setToast } = useApp();

  useEffect(() => {
    setToast({
      show: true,
      message: 'Por favor agenda una cita',
      type: 'success',
    });
  }, []);

  const handleClick = () => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-white rounded-xl border border-gray-200">
      <p className="text-lg text-gray-600 text-center">
        Para continuar con el proceso es necesario que agendes una cita.
      </p>

      <Button onClick={handleClick}>{buttonLabel}</Button>
    </div>
  );
}
