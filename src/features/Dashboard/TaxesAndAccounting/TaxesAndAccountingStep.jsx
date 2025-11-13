import React from 'react';

const TaxesAndAccountingStep = ({ children, imgSrc = '' }) => {
  return (
    <div className="flex flex-row flex-wrap gap-y-5 items-center">
      <div className="w-full flex flex-col space-y-2 p-5">
        <h1 className="font-bold text-2xl">
          Pasos para ingresar como cliente para servicios de contabilidad
        </h1>
        <h2 className="font-semibold text-lg">Complete toda la información solicitada</h2>
        <p className="text-sm">
          La contabilidad y el cumplimiento tributario son las áreas más sensibles de cualquier
          empresa, ya que un manejo inadecuado de las mismas puede derivar en multas y malos ratos
          innecesarios, cuando podrías haber llevado todo en orden y en regla con nosotros.
        </p>
      </div>

      <div className="w-1/2 h-full">
        <img className="w-1/3 m-auto" src={imgSrc}></img>
      </div>

      <div className="w-1/2 h-full">{children}</div>
    </div>
  );
};

export default TaxesAndAccountingStep;
