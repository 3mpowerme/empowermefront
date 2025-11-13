import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Modal, { ModalBody, ModalFooter } from '../Modal/Modal';
import Button from '../Button/Button';

export default function StripePaymentModal({ open, onClose, clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsPaying(true);
    setError('');

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/appointments`,
      },
    });

    setIsPaying(false);

    if (confirmError) {
      setError(confirmError.message || 'No se pudo procesar el pago');
      return;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onClose?.();
      setTimeout(() => {
        onSuccess?.(paymentIntent);
      }, 500);
    } else if (paymentIntent?.status === 'requires_action') {
      //TODO handle requires_action
    }
  };

  if (!clientSecret) return null;

  return (
    <Modal open={open} onClose={onClose} title="Pagar con tarjeta" subtitle="Pago seguro">
      <ModalBody>
        <PaymentElement />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </ModalBody>
      <ModalFooter>
        <Button onClick={handlePay} disabled={!stripe || isPaying}>
          {isPaying ? 'Procesando…' : 'Pagar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
