import { CheckCircle, MessageCircle } from 'lucide-react';
import Button from '../Button/Button';
import Switch from '../Switch/Switch';
import { useEffect, useState } from 'react';
import MonthlyAccountingRequiredDocumentsWizard from '../../features/Dashboard/TaxesAndAccounting/Wizards/MonthlyAccountingRequiredDocumentsWizard';
import { useNavigate } from 'react-router';
import { privateService } from '../../services/privateService';

const WIZARD_VIEW = 'wizard-view';
const SUCCESSFUL_SUBSCRIPTION_VIEW = 'successful-subscription';

export default function SuccessfulSubscriptionMonthlyAccounting({
  serviceId,
  showRequiredDocuments = false,
  onSchedule = () => {},
  companyId,
}) {
  const [needActivityStartSupport, setNeedActivityStartSupport] = useState(false);
  const navigate = useNavigate();
  const [view, setView] = useState(SUCCESSFUL_SUBSCRIPTION_VIEW);
  const handleClick = () => {
    const message = encodeURIComponent('¡Hola!');
    const phone = '5215544444444';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  useEffect(() => {
    privateService.get(`/monthly-accounting/${companyId}`).then((monthlyAccountingResponse) => {
      console.log('HERE monthlyAccountingResponse', monthlyAccountingResponse);
      if (
        monthlyAccountingResponse.need_activity_start_support &&
        monthlyAccountingResponse.need_activity_start_support === 'SI'
      ) {
        setNeedActivityStartSupport(true);
      }
    });
  }, []);

  return (
    <>
      <Switch value={view}>
        <Switch.Item case={SUCCESSFUL_SUBSCRIPTION_VIEW}>
          <div className="flex flex-col items-center justify-center w-full my-10 text-center px-5">
            <CheckCircle className="text-green-500 w-16 h-16 mb-4 animate-bounce" />

            <h2 className="text-2xl font-semibold text-gray-800 mb-2">¡Suscripción exitosa!</h2>
            {needActivityStartSupport && (
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
            {showRequiredDocuments && <></>}
          </div>

          <Button
            onClick={handleClick}
            className="fixed bottom-20 right-20 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50">
            <MessageCircle className="w-5 h-5 inline mr-2" />
            Orientación por WhatsApp
          </Button>
        </Switch.Item>
        <Switch.Item case={WIZARD_VIEW}>
          <MonthlyAccountingRequiredDocumentsWizard
            handleWizardClose={() => {
              setView(SUCCESSFUL_SUBSCRIPTION_VIEW);
            }}
            handleWizardSuccess={() => {
              navigate('/dashboard/taxes_and_accounting/monthly_accounting');
            }}
          />
        </Switch.Item>
      </Switch>
    </>
  );
}
