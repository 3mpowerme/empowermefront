import React, { useState } from 'react';
import { useShareholder } from '../../../hooks/useShareholder';
import CardSelector from '../../../components/CardSelector/CardSelector';
import { mapShareholdersToCards } from '../../../utils/catalogs';
import Button from '../../../components/Button/Button';
import { Minus, Plus } from 'lucide-react';

export default function TaxInfoSection({
  onAddShareholder = () => {},
  onDeleteShareholder = () => {},
}) {
  const { shareholders } = useShareholder();
  const [shareholderSelected, setShareholderSelected] = useState(null);
  const handleCardChange = (idArray) => {
    console.log('handleCardChange', idArray);
    const [id] = idArray || [];
    setShareholderSelected(id);
  };
  return (
    <div className="mt-5 w-full">
      <div className="flex w-full justify-start mb-5 space-x-2">
        {shareholderSelected && (
          <Button
            variant="wizard"
            className="flex py-2"
            onClick={() => {
              onDeleteShareholder(shareholderSelected);
              setShareholderSelected(null);
            }}>
            <span>
              <Minus />
            </span>
            <span>Borrar</span>
          </Button>
        )}
        <Button variant="wizard" className="flex py-2" onClick={onAddShareholder}>
          <span>
            <Plus />
          </span>
          <span>Agregar</span>
        </Button>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-2/3 ">
          <CardSelector
            cards={mapShareholdersToCards(shareholders)}
            columns={1}
            onCardChange={handleCardChange}
          />
        </div>
      </div>
    </div>
  );
}
