// features/Dashboard/GraphicDesign/LogoDesignPage.jsx
import { useEffect, useState } from 'react';
import Switch from '../../../components/Switch/Switch';
import Wizard from '../../../components/Wizard/Wizard';
import { useAccount } from '../../../hooks/useAccount';
import { useConceptualization } from '../../../hooks/useConceptualization';
import { useApp } from '../../../hooks/useApp';
import { privateService } from '../../../services/privateService';
import LogoDesignWizardStep1 from './LogoDesignWizardStep1';
import LogoDesignWizardStep2 from './LogoDesignWizardStep2';
import LogoDesignWizardStep3 from './LogoDesignWizardStep3';
import { mapArrayToColorimetry, mapArrayToOptions } from '../../../utils/catalogs';
import { useLogoHistory } from '../../../hooks/useLogoHistory';
import Logos from './Logos';

const LOGO_DESIGN_VIEW = 'logo-design-view';
const WIZARD_VIEW = 'wizard-view';
const LOGO_HISTORY_VIEW = 'logo-history-view';

export default function LogoDesignPage() {
  const {
    activeCompanyInfo: { companyName },
  } = useAccount();
  const { state: { step1, step2, step3 } = {} } = useConceptualization();
  const { setIsLoading } = useApp();
  const [brandName, setBrandName] = useState(companyName);
  const [view, setView] = useState(LOGO_DESIGN_VIEW);

  const { logoHistory, refetch } = useLogoHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    setView(WIZARD_VIEW);
    console.log('Comenzar con:', brandName);
  };

  const heroImageSrc = '/images/dashboard/graphic_design/design_logo_hero.jpg';
  const steps = [
    {
      id: 1,
      img: '/images/dashboard/graphic_design/design_logo_step_1.jpeg',
      title: '1. Ingresa el nobre de tu empresa',
      desc: 'Ingresa el nombre de tu empresa. Agrega un eslogan (si corresponde) y haz clic en "Diseñar".',
    },
    {
      id: 2,
      img: '/images/dashboard/graphic_design/design_logo_step_2.jpeg',
      title: '2. Cuéntanos sobre la marca de tus sueños',
      desc: 'Selecciona un tipo de logotipo, un ícono y elige las tipografías que mejor se adapten a tu marca.',
    },
    {
      id: 3,
      img: '/images/dashboard/graphic_design/design_logo_step_3.jpeg',
      title: '3. Personalízalo y hazlo tuyo',
      desc: 'Puedes editar las fuentes, los colores, el diseño y más. No se requieren conocimientos de diseño.',
    },
  ];

  const wizardSteps = [
    { id: 1, component: <LogoDesignWizardStep1 /> },
    { id: 2, component: <LogoDesignWizardStep2 /> },
    { id: 3, component: <LogoDesignWizardStep3 brandName={brandName} /> },
  ];

  const handleCreateLogos = () => {
    setBrandName(companyName);
    setView(WIZARD_VIEW);
  };

  const handleComplete = () => {
    console.log('step1', step1);
    console.log('step2', step2);
    console.log('step3', step3);
    setIsLoading(true);
    privateService
      .create('/conceptualization/logo', {
        brand_name: step3.brand_name,
        logo_type: step3.logo_type,
        business_sector_id: step2.business_sectors,
        about: step2.about,
        offering_service_type_id: step1.offeringServiceType,
      })
      .then((response) => {
        console.log('response', response);
        if (response?.logos) refetch();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (logoHistory.length > 0) {
      setView(LOGO_HISTORY_VIEW);
    }
  }, [logoHistory.length]);

  return (
    <div className="min-h-screen">
      <Switch value={view}>
        <Switch.Item case={WIZARD_VIEW}>
          <Wizard
            showProgress={false}
            steps={wizardSteps}
            onComplete={handleComplete}
            className="mt-10"
            withCanContinue
            onClose={() => {
              setView(LOGO_DESIGN_VIEW);
            }}
          />
        </Switch.Item>
        <Switch.Item case={LOGO_DESIGN_VIEW}>
          <>
            <section className="max-w-7xl mx-auto px-4 lg:px-10 pt-6 pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bienvenido</h1>
            </section>

            <section className="max-w-7xl mx-auto px-4 lg:px-10 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                    Construye tu logo en minutos
                  </h2>
                  <p className="mt-3 text-gray-600">
                    Solo escribe tu nombre y sector, elige tu estilo que prefieras y ¡listo!, ya
                    tienes un logotipo
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Ingresa el nombre de tu logo"
                      className="w-full sm:flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                      aria-label="Nombre del logo"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg bg-purple-600 text-white px-5 py-2.5 font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300">
                      Comenzar
                    </button>
                  </form>

                  <p className="mt-3 text-xs text-gray-500"></p>
                </div>

                <div className="relative">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={heroImageSrc}
                      alt="Vista previa genérica de diseño de logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Diseña tu logotipo empresarial personalizado en 3 sencillos pasos
              </h3>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {steps.map((step) => (
                  <div key={step.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-video w-full overflow-hidden">
                      <img src={step.img} alt={step.title} className="h-full w-full object-cover" />
                    </div>
                    <h4 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">
                      {step.title}
                    </h4>
                    <p className="mt-2 text-sm text-gray-600">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        </Switch.Item>
        <Switch.Item case={LOGO_HISTORY_VIEW}>
          <Logos logos={logoHistory} handleCreateLogos={handleCreateLogos} />
        </Switch.Item>
      </Switch>
    </div>
  );
}
