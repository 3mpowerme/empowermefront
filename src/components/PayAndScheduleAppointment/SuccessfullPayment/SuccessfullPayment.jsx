import { CheckCircle, MessageCircle } from 'lucide-react';
import Button from '../../Button/Button';
import Switch from '../../Switch/Switch';
import { useState } from 'react';
import Link from '../../Link/Link';
import { useNavigate } from 'react-router';
import CompanyPurchaseSaleWizard from '../../../features/Dashboard/LegalServices/Wizards/CompanyPurchaseSaleWizard';
import { useService } from '../../../hooks/useService';
import ScheduleAppointmentNotice from '../../ScheduleAppointmentNotice/ScheduleAppointmentNotice';

const WIZARD_VIEW = 'wizard-view';
const SUCCESSFUL_SUBSCRIPTION_VIEW = 'successful-subscription';

export default function SuccessfullPayment({ serviceCode, goTo, folio, count }) {
  const navigate = useNavigate();
  const [view, setView] = useState(SUCCESSFUL_SUBSCRIPTION_VIEW);

  const {
    data: { whats_app_support_number, requires_appointment, appointment_url },
  } = useService(serviceCode);

  const handleClick = () => {
    const message = encodeURIComponent('¡Hola! Tengo una duda');
    const phone = whats_app_support_number || '56962101021';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const needsPurchaseSale =
    serviceCode === 'company_modifications_spa'
      ? count > 0
      : serviceCode === 'company_modifications_srl'
        ? count > 0
        : false;
  console.log('needsPurchaseSale', needsPurchaseSale);

  const showRepositoryLink = false;
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
            {needsPurchaseSale && (
              <>
                <p className="mb-10">para continuar requerimos completes el siguiente formulario</p>
                <Button
                  onClick={() => {
                    setView(WIZARD_VIEW);
                  }}>
                  Abrir formulario
                </Button>
              </>
            )}
            <p className="mt-5">
              Recibirá una notificacion, si tiene algún mensaje o requiremos alguna información
              adicional
            </p>
            {showRepositoryLink && <Link to={`/dashboard/${goTo}`}>Ir a mi repositorio</Link>}
          </div>

          <Button
            onClick={handleClick}
            className="fixed bottom-20 right-20 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50">
            <MessageCircle className="w-5 h-5 inline mr-2" />
            Orientación por WhatsApp
          </Button>
          {requires_appointment === 1 && <ScheduleAppointmentNotice url={appointment_url} />}
        </Switch.Item>
        <Switch.Item case={WIZARD_VIEW}>
          <CompanyPurchaseSaleWizard
            handleWizardClose={() => {
              setView(SUCCESSFUL_SUBSCRIPTION_VIEW);
            }}
            handleWizardSuccess={() => {
              navigate(`/dashboard/${goTo}`);
            }}
          />
        </Switch.Item>
      </Switch>
    </>
  );
}
