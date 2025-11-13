import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Modal, { ModalBody, ModalFooter } from '../Modal/Modal';
import Button from '../Button/Button';

export default function StripeSubscribeModal({
  open,
  onClose,
  clientSecret,
  planName,
  priceSummary,
  onSuccess,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async () => {
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    setErrorMsg('');
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/subscriptions`,
      },
    });

    console.log('paymentIntent', paymentIntent);

    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'No se pudo completar la suscripción');
      return;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onClose?.();
      setTimeout(() => {
        onSuccess?.(paymentIntent);
      }, 500);
    } else if (paymentIntent?.status === 'requires_action') {
      setErrorMsg('Tu banco requiere autenticación adicional.');
    }
  };

  if (!clientSecret) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Suscribirme al plan"
      subtitle="Pago recurrente seguro con tarjeta">
      <ModalBody>
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">{planName || 'Plan seleccionado'}</div>
          <div className="text-gray-600">{priceSummary || '—'}</div>
          <div className="mt-2 text-xs text-gray-500">
            La suscripción se renovará automáticamente según el periodo que elegiste. Puedes
            cancelarla en cualquier momento desde tu panel.
          </div>
        </div>

        <PaymentElement />

        {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}
      </ModalBody>

      <ModalFooter>
        <Button onClick={handleSubscribe} disabled={!stripe || isSubmitting}>
          {isSubmitting ? 'Procesando…' : 'Confirmar suscripción'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
