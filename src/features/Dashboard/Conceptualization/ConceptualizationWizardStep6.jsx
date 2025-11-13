import React, { useState } from 'react';
import { useConceptualization } from '../../../hooks/useConceptualization';
import LogoSelector from '../../../components/LogoSelector/LogoSelector';
import Switch from '../../../components/Switch/Switch';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';

const ConceptualizationWizardStep6 = () => {
  const { state: { logos = [], isLoading } = {}, setStepState } = useConceptualization();
  const [selected, setSelected] = useState(null);
  const handleSelect = (id) => {
    console.log('selected logo', id);
    setSelected(id);
    setStepState(6, {
      selectedLogo: id,
      canContinue: true,
    });
  };
  return (
    <Switch value={isLoading}>
      <Switch.Item case={true}>
        <FullScreenSpinner
          message="Generando logos de tu negocio"
          showProgress
          duration={1 * 60 * 1000} // 1 minute
        />
      </Switch.Item>
      <Switch.Item case={false}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold mb-6">Selecciona un logo</h1>
          <LogoSelector logos={logos} selectedLogoId={selected} onSelect={handleSelect} />
        </div>
      </Switch.Item>
    </Switch>
  );
};

export default ConceptualizationWizardStep6;
