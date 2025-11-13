import React from 'react';
import { useAccount } from '../../hooks/useAccount';
import FeatureCard from '../../components/FeatureCard/FeatureCard';

export default function DashboardBusinessOrientationPage() {
  const {
    activeCompanyInfo: { companyName },
  } = useAccount();
  return (
    <div className="flex flex-col h-full w-full gap-5 pl-10">
      <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
      <h2 className="text-xl text-black font-bold">Orientación Empresarial</h2>
      <FeatureCard
        img="/images/dashboard/business_orientation/happy-woman.png"
        title="Asesoría Personalizada"
        description="El servicio de asesoría personalizada que ofrecemos consiste en 15, 30 o 60 minutos en los que puedes realizar consultas sobre diferentes aspectos de tu proyecto/empresa y te vamos ayudando a resolverlos inmediatamente."
      />
      <FeatureCard
        img="/images/dashboard/business_orientation/entrepreneurs.jpg"
        description="Somos competentes y tenemos mucha experiencia en temas de emprendimiento, desde selección de ideas de negocio, modelos de negocio, creación de empresas, comercialización, marketing digital, postulaciones a financiamiento, contabilidad, finanzas y tributación, por lo que normalmente podemos resolver casi cualquier escenario respecto del desarrollo de un proyecto de negocios."
      />
      <FeatureCard
        img="/images/dashboard/business_orientation/team_work.jpg"
        description="Los valores incluyen todos los impuestos. Para agendar se cancela anticipado el valor del servicio y se coordina un horario y puedes hacerlo agregando el producto al carro de compras y realizando el pago (debes seleccionar el tiempo a agendar, 15, 30 o 60 minutos) y realizado esto recibirás un correo electrónico con toda la información para agendar en el horario que más te acomode."
      />
    </div>
  );
}
