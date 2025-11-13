import React, { useEffect, useState } from 'react';
import { privateService } from '../../services/privateService';
import { formatBytesToMB } from '../../utils/utils';
import { useApp } from '../../hooks/useApp';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';

export default function RequiredDocumentTable({ serviceId, onSchedule = () => {} }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [file, setFile] = useState({});
  const [progress, setProgress] = useState({});
  const { setToast } = useApp();
  const [showScheduleButton, setShowScheduleButton] = useState(false);

  async function fetchDocs() {
    setLoading(true);
    const res = await privateService.get(`/services/${serviceId}/documents`);
    if (res.docs) setDocs(res.docs);
    setLoading(false);
  }

  useEffect(() => {
    let allDocumentsHaveBeenUploaded = true;
    for (let i = 0; i < docs.length; i++) {
      if (!docs[i].url) {
        allDocumentsHaveBeenUploaded = false;
      }
    }
    setShowScheduleButton(allDocumentsHaveBeenUploaded);
  }, [docs]);

  useEffect(() => {
    fetchDocs();
  }, [serviceId]);

  async function saveComment(id, notes) {
    setSavingId(id);
    await privateService.update(`/services/${serviceId}/documents/${id}`, { notes });
    await fetchDocs();
    setToast({
      show: true,
      message: 'Comentario guardado correctamente',
      type: 'success',
      button: {},
    });
    setSavingId(null);
  }

  async function uploadFile(id, doc, f) {
    if (!f)
      return setToast({
        show: true,
        message: 'Selecciona un archivo',
        type: 'error',
        button: {},
      });
    if (f.size > doc.max_size_bytes)
      return setToast({
        show: true,
        message: 'El archivo excede el tamaño máximo permitido',
        type: 'error',
        button: {},
      });

    const res = await privateService.create(`/services/${serviceId}/documents/${id}/upload-url`, {
      content_type: f.type || 'application/octet-stream',
      file_name: f.name,
    });

    await putWithProgress(res.upload_url, f, f.type, (p) =>
      setProgress((prev) => ({ ...prev, [id]: p }))
    );

    setToast({
      show: true,
      message: 'Archivo subido correctamente',
      type: 'success',
      button: {},
    });
    await fetchDocs();
  }

  function putWithProgress(url, blob, contentType, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', contentType || 'application/octet-stream');
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject());
      xhr.onerror = reject;
      xhr.send(blob);
    });
  }

  async function viewDoc(doc) {
    const res = await privateService.create(
      `/services/${doc.service_id}/documents/${doc.id}/view-url`
    );
    window.open(res.view_url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-between my-4">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900">
          Documentos requeridos
        </h1>
        {!showScheduleButton && (
          <p className="text-md text-body">
            Para continuar por favor sube los documentos requeridos
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-500">
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs w-50">
                  Detalles
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">
                  Archivo
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">
                  Comentario
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={5}>
                    Cargando…
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-500" colSpan={5}>
                    No hay documentos requeridos.
                  </td>
                </tr>
              ) : (
                docs.map((d) => (
                  <tr key={d.id} className="align-top hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{d.name}</div>
                      <div className="mt-1 inline-flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary opacity-90 px-2 py-0.5 text-[11px] font-medium text-white">
                          {d.doc_type}
                        </span>
                        <span className="inline-flex items-center text-center rounded-full bg-primary opacity-90 px-2 py-1 text-[11px] font-medium text-white">
                          {formatBytesToMB(d.max_size_bytes)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-700">
                      {d.details || <span className="text-gray-400">—</span>}
                    </td>

                    <td className="px-4 py-4">
                      {d.url ? (
                        <button
                          className="text-primary hover:text-body underline underline-offset-4 transition-colors cursor-pointer"
                          onClick={() => viewDoc(d)}>
                          Ver archivo
                        </button>
                      ) : (
                        <span className="text-gray-400">Sin archivo</span>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <input
                          id={`file-${d.id}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => setFile({ ...file, [d.id]: e.target.files[0] })}
                        />

                        <label
                          htmlFor={`file-${d.id}`}
                          className="cursor-pointer rounded-lg border-primary text-primary px-3 py-2 transition">
                          Seleccionar archivo
                        </label>

                        {file[d.id] && (
                          <span className="text-sm text-gray-600">{file[d.id].name}</span>
                        )}
                        {file[d.id] && (
                          <Button
                            variant="wizard"
                            onClick={() => uploadFile(d.id, d, file[d.id])}
                            disabled={progress[d.id] > 0 && progress[d.id] < 100}>
                            {progress[d.id] && progress[d.id] < 100
                              ? `${progress[d.id]}%`
                              : 'Subir'}
                          </Button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <TextArea
                        maxLength={250}
                        className="block w-full min-w-[260px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                        rows={2}
                        value={d.notes || ''}
                        onChange={(e) =>
                          setDocs((prev) =>
                            prev.map((x) => (x.id === d.id ? { ...x, notes: e.target.value } : x))
                          )
                        }
                        placeholder="Escribe un comentario…"
                      />
                    </td>

                    <td className="px-4 py-4 max-w-20">
                      <Button
                        variant="wizard"
                        onClick={() => saveComment(d.id, d.notes)}
                        disabled={savingId === d.id}>
                        {savingId === d.id ? 'Guardando…' : 'Guardar'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showScheduleButton && (
        <Button className="mt-5" onClick={onSchedule}>
          Agendar una cita
        </Button>
      )}
    </div>
  );
}
