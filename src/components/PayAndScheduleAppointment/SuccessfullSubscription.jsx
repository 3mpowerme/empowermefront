import { CheckCircle } from 'lucide-react';
import Button from '../Button/Button';
import RequiredDocumentTable from '../RequiredDocumentTable/RequiredDocumentTable';

export default function SuccessfulSubscription({
  serviceId,
  showRequiredDocuments = false,
  onSchedule = () => {},
}) {
  const handleClick = () => {
    const message = encodeURIComponent('¡Hola! Acabo de completar mi suscripción');
    const phone = '5215544444444';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full my-10 text-center px-5">
      <CheckCircle className="text-green-500 w-16 h-16 mb-4 animate-bounce" />

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">¡Suscripción exitosa!</h2>

      <p className="text-gray-600 mb-6 max-w-md">
        Tu suscripción se ha activado correctamente. Por favor envianos un WhatsApp para
        orientación.
      </p>

      <Button
        onClick={handleClick}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
        Enviar WhatsApp
      </Button>

      {showRequiredDocuments && (
        <RequiredDocumentTable serviceId={serviceId} onSchedule={onSchedule} />
      )}
    </div>
  );
}
