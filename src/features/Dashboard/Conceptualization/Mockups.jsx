import React, { useEffect, useState, useCallback } from 'react';
import Button from '../../../components/Button/Button';
import { FileText, Loader2, Image as ImageIcon, Image } from 'lucide-react';
import { privateService } from '../../../services/privateService';
import { useApp } from '../../../hooks/useApp';
import ImageModal from '../../../components/Modal/ImageModal';

export default function Mockups({
  offering_service_type_id,
  region_id,
  business_sector_id,
  about,
  conceptualization_id,
  brand_book_id,
  mockups: mockupsFromProps,
  refetchConceptualizations = () => {},
}) {
  const [loading, setLoading] = useState(false);
  const [mockups, setMockups] = useState(mockupsFromProps);

  useEffect(() => {
    setMockups(mockupsFromProps);
  }, [mockupsFromProps]);

  async function handleCreateMockups() {
    setLoading(true);
    setMockups([]);

    try {
      const payload = {
        offering_service_type_id,
        region_id,
        business_sector_id,
        about,
        brand_book_id,
      };

      const data = await privateService.create(
        `/conceptualization/business-card-mockups/${conceptualization_id}`,
        payload
      );
      if (data.mockups) setMockups((prevMockups) => [...prevMockups, ...data.mockups]);
    } catch (err) {
      console.log('error', err);
    } finally {
      refetchConceptualizations();
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-5 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Mockups</h2>
        {
          <Button
            onClick={handleCreateMockups}
            variant="wizard"
            className="flex items-center gap-2 px-4 py-2"
            disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText />
                Generar mockups
              </>
            )}
          </Button>
        }
      </div>
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600 flex items-center gap-2">
          <Loader2 className="animate-spin" />
          Creando propuestas de tarjeta (frente y reverso)...
        </div>
      )}

      {!loading && Array.isArray(mockups) && mockups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockups.map((item, i) => (
            <MockupCard
              key={item.id || `${i}-${item?.front?.url}-${item?.back?.url}`}
              item={item}
              optionNumber={i + 1}
              conceptualization_id={conceptualization_id}
              refetchConceptualizations={refetchConceptualizations}
            />
          ))}
        </div>
      )}

      {/* vacío */}
      {!loading && Array.isArray(mockups) && mockups.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-sm text-gray-500">
          Aún no hay propuestas. Haz clic en <span className="font-medium">Generar mockups</span>{' '}
          para empezar.
        </div>
      )}
    </div>
  );
}

function MockupCard({ item, optionNumber, conceptualization_id, refetchConceptualizations }) {
  const { setToast } = useApp();

  const [modalUrl, setModalUrl] = useState(null);

  const openModal = useCallback((url) => {
    if (url) setModalUrl(url);
  }, []);
  const closeModal = useCallback(() => setModalUrl(null), []);

  const handleChooseMockup = (history_id) => {
    privateService
      .create(`/conceptualization/business-card-mockups/${conceptualization_id}/update-chosen`, {
        history_id,
      })
      .finally(() => {
        setToast({
          show: true,
          message: 'Se ha guardado tu elección',
          type: 'success',
          button: {},
        });
        refetchConceptualizations();
      });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Opción #{optionNumber}</div>
        {item?.tagline && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900 text-white">
            {item.tagline}
          </span>
        )}
      </div>

      {item?.style_notes && <p className="text-body text-sm">{item.style_notes}</p>}

      <div className="flex flex-col gap-3">
        <PreviewPane label="Frente" url={item?.front?.url} onView={openModal} />
        <PreviewPane label="Reverso" url={item?.back?.url} onView={openModal} />
      </div>

      {Array.isArray(item?.color_palette) && item.color_palette.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-gray-600 font-medium">Paleta usada</div>
          <div className="flex flex-wrap gap-2">
            {item.color_palette.map((hex, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-md border border-gray-300 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <div className="text-[10px] text-gray-500 font-mono">{hex}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!item?.chosen && (
        <div className="mt-auto">
          <button
            onClick={() => handleChooseMockup(item.history_id)}
            className="text-[11px] font-medium text-primary hover:primary cursor-pointer underline underline-offset-2">
            Elegir esta opción
          </button>
        </div>
      )}
      <ImageModal isOpen={!!modalUrl} url={modalUrl} onClose={closeModal} />
    </div>
  );
}

function PreviewPane({ label, url, onView }) {
  return (
    <div className="rounded-lg border border-gray-300 bg-gray-50 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2 text-[10px] text-gray-600 px-2 py-1 border-b border-gray-200 bg-white">
        <span className="font-medium text-gray-700">{label}</span>
        <div className="ml-auto flex items-center gap-2">
          {url && (
            <button
              type="button"
              onClick={() => onView && onView(url)}
              className="text-[11px] font-medium text-primary hover:primary underline underline-offset-2"
              title="Ver imagen">
              Ver imagen
            </button>
          )}
          {!url && <span className="text-[10px] text-red-500">sin imagen</span>}
        </div>
      </div>
      <div className="aspect-[1.6] flex flex-col items-center justify-center text-[10px] text-gray-500 bg-gray-50">
        {url ? (
          <>
            <img src={url} alt={`${label} tarjeta`} className="w-full h-full object-cover" />
            <Button variant="wizard" className="flex py-2 mb-5" onClick={() => onView(url)}>
              <span>
                <Image size={20} />
              </span>
            </Button>
          </>
        ) : (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" /> preview no disponible
          </span>
        )}
      </div>
    </div>
  );
}
