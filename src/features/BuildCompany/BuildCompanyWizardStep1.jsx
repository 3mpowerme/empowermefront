import React from 'react';

const BuildCompanyWizardStep1 = ({ name }) => {
  return (
    <div className="flex flex-col items-center text-center gap-6 sm:gap-8 px-4 sm:px-8 py-10 sm:py-14 md:py-20">
      <img
        src="/images/wizard/setup.png"
        alt="Configuración del asistente"
        className="w-40 sm:w-48 md:w-56 lg:w-64 h-auto"
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black max-w-2xl">
        Construyamos una guía personalizada para {name}
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-xl">
        Responde algunas preguntas para que podamos brindarte la mejor orientación sobre cómo sacar
        adelante tu negocio.
      </p>
    </div>
  );
};

export default BuildCompanyWizardStep1;
