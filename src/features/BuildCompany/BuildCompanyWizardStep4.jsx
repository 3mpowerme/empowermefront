import React, { useEffect, useState } from 'react';
import CreatableSelect from '../../components/CreatableSelect/CreatableSelect';
import TextArea from '../../components/TextArea/TextArea';
import { useBusinessSectors } from '../../hooks/useBusinessSectors';
import { mapCatalogToOptions } from '../../utils/catalogs';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { storage } from '../../utils/storage';

const BuildCompanyWizardStep4 = ({ name }) => {
  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const { step4: { about: aboutFromStorage, business_sectors: business_sectorsFromStorage } = {} } =
    buildCompanyFromStorage;

  const [text, setText] = useState(aboutFromStorage ?? '');
  const [value, setValue] = useState(business_sectorsFromStorage ?? '');
  const [businessSectorOther, setBusinessSectorOther] = useState('');
  const { businessSectors, isLoading } = useBusinessSectors();
  const options = mapCatalogToOptions(businessSectors);
  const { setStepState } = useBuildCompany();

  useEffect(() => {
    if (business_sectorsFromStorage) {
      const parsedId = Number(business_sectorsFromStorage);
      const isNumericId = !Number.isNaN(parsedId);
      if (!isNumericId) {
        setTimeout(() => {
          setStepState(4, {
            business_sectors: '',
            about: text,
            business_sector_other: '',
            canContinue: false,
          });
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    setStepState(4, {
      business_sectors: value,
      about: text,
      business_sector_other: businessSectorOther,
      canContinue: !!value && !!text,
    });
  }, [text, value, businessSectorOther]);

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  const handleBusinessSectorChange = (val) => {
    setValue(val);
    if (val && isNaN(Number(val))) {
      setBusinessSectorOther(val);
    } else {
      setBusinessSectorOther('');
    }
  };

  const handleNewOptionAdded = (newOptionName) => {
    setBusinessSectorOther(newOptionName);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 flex flex-col items-center gap-5 sm:gap-5">
      <img
        className="w-36 sm:w-44 md:w-56 h-auto"
        src="/images/wizard/thumbnail_Frame.png"
        alt="Sector empresarial"
      />
      <h1 className="text-center font-bold text-2xl sm:text-3xl md:text-4xl text-black max-w-3xl">
        ¿En qué tipo de sector empresarial está {name}?
      </h1>

      <div className="w-full max-w-2xl">
        <CreatableSelect
          enableAddItem={true}
          options={options}
          value={value}
          onChange={handleBusinessSectorChange}
          placeholder="Elegir..."
          label="Sector Empresarial"
          onNewOptionAdded={handleNewOptionAdded}
        />
      </div>

      <div className="w-full max-w-2xl">
        <TextArea
          label="Cuéntanos más sobre tu negocio"
          id="aboutYou"
          name="aboutYou"
          placeholder="..."
          maxLength={500}
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep4;
