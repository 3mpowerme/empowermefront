import React, { useRef, useState } from 'react';
import { useAccount } from '../../../hooks/useAccount';
import FeatureCard from '../../../components/FeatureCard/FeatureCard';
import classNames from 'classnames';
import Switch from '../../../components/Switch/Switch';
import PayAndScheduleAppointment from '../../../components/PayAndScheduleAppointment/PayAndScheduleAppointment';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const BUSINESS_PROFILE_VIEW = 'business-profile-view';

export default function BusinessOrientationPage() {
  const {
    activeCompanyInfo: { companyName },
  } = useAccount();
  const [view, setView] = useState(BUSINESS_PROFILE_VIEW);
  const currentServiceOrderIdRef = useRef({
    serviceOrderId: null,
    serviceType: 'business_orientation',
  });

  return (
    <div
      className={classNames('w-full min-h-screen', 'bg-gradient-to-b from-[#FFFFFF] to-[#FDECDA]')}>
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-10 py-6 sm:py-8 md:py-12">
        <Switch value={view}>
          <Switch.Item case={PAY_AND_SCHEDULE_APPOINTMENT_VIEW}>
            <div className="w-full">
              <PayAndScheduleAppointment
                onComplete={() => setView(BUSINESS_PROFILE_VIEW)}
                ref={currentServiceOrderIdRef}
              />
            </div>
          </Switch.Item>

          <Switch.Item case={BUSINESS_PROFILE_VIEW}>
            <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
              <FeatureCard
                imgClassName="py-6 sm:py-8 md:py-10 px-6 sm:px-8 md:px-10"
                reverse
                title={`Bienvenido ${companyName}`}
                img="/images/dashboard/business_orientation/happy-woman.png"
                subtitle="Asesoría Personalizada"
                button={{
                  text: 'Solicitar asesoría',
                  onClick: () => setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW),
                }}
                description="El servicio de asesoría personalizada que ofrecemos consiste en 15, 30 o 60 minutos en los que puedes realizar consultas sobre diferentes aspectos de tu proyecto/empresa y te vamos ayudando a resolverlos inmediatamente."
              />

              <FeatureCard
                imgClassName="py-6 sm:py-8 md:py-10 px-6 sm:px-8 md:px-10"
                className="bg-white"
                img="/images/dashboard/business_orientation/entrepreneurs.jpg"
                description="Somos competentes y tenemos mucha experiencia en temas de emprendimiento, desde selección de ideas de negocio, modelos de negocio, creación de empresas, comercialización, marketing digital, postulaciones a financiamiento, contabilidad, finanzas y tributación, por lo que normalmente podemos resolver casi cualquier escenario respecto del desarrollo de un proyecto de negocios."
              />

              <FeatureCard
                imgClassName="py-6 sm:py-8 md:py-10 px-6 sm:px-8 md:px-10"
                reverse
                img="/images/dashboard/business_orientation/team_work.jpg"
                description="Los valores incluyen todos los impuestos. Para agendar se cancela anticipado el valor del servicio y se coordina un horario y puedes hacerlo agregando el producto al carro de compras y realizando el pago (debes seleccionar el tiempo a agendar, 15, 30 o 60 minutos) y realizado esto recibirás un correo electrónico con toda la información para agendar en el horario que más te acomode."
              />
            </div>
          </Switch.Item>
        </Switch>
      </div>
    </div>
  );
}
