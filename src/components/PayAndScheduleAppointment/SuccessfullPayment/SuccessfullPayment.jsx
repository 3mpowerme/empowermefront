import { CheckCircle, MessageCircle } from 'lucide-react';
import Button from '../../Button/Button';
import Switch from '../../Switch/Switch';
import { useState } from 'react';
import { Link } from 'react-router';

const WIZARD_VIEW = 'wizard-view';
const SUCCESSFUL_SUBSCRIPTION_VIEW = 'successful-subscription';

export default function SuccessfullPayment({ serviceCode, goTo, folio }) {
  const [view, setView] = useState(SUCCESSFUL_SUBSCRIPTION_VIEW);
  const handleClick = () => {
    const message = encodeURIComponent('¡Hola!');
    const phone = '5215544444444';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <>
      <Switch value={view}>
        <Switch.Item case={SUCCESSFUL_SUBSCRIPTION_VIEW}>
          <div className="flex flex-col items-center justify-center w-full my-10 text-center px-5">
            <CheckCircle className="text-green-500 w-16 h-16 mb-4 animate-bounce" />

            <h2 className="text-2xl font-semibold text-gray-800 mb-2">¡Pago exitosa!</h2>
            {folio && (
              <h2 className="text-1xl font-semibold text-gray-800 mb-2">Folio: {`${folio}`}</h2>
            )}
            <p className="mt-5">
              Recibirá una notificacion, si tiene algún mensaje o requiremos alguna información
              adicional
            </p>
            <Link to={`/dashboard/${goTo}`}>
              <Button className="mt-5">Ir a mi repositorio</Button>
            </Link>
          </div>

          <Button
            onClick={handleClick}
            className="fixed bottom-20 right-20 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50">
            <MessageCircle className="w-5 h-5 inline mr-2" />
            Orientación por WhatsApp
          </Button>
        </Switch.Item>
      </Switch>
    </>
  );
}
