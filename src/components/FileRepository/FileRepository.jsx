import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { privateService } from '../../services/privateService';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';
import { storage } from '../../utils/storage';
import { useAccount } from '../../hooks/useAccount';
import { useApp } from '../../hooks/useApp';
import { useAuth } from '../../hooks/useAuth';

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function formatDate(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function formatDateTime(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSize(sizeBytes) {
  if (!sizeBytes && sizeBytes !== 0) return '';
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  const kb = sizeBytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export default function FileRepository({ serviceId }) {
  const { activeCompany } = useAccount();
  const { setToast } = useApp();
  const { auth } = useAuth();
  const location = useLocation();
  const currentUserId = auth?.userId;

  const fileInputRef = useRef(null);
  const commentTargetRefByFile = useRef({});

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [openFileId, setOpenFileId] = useState(null);
  const [commentsByFile, setCommentsByFile] = useState({});
  const [commentsLoadingByFile, setCommentsLoadingByFile] = useState({});
  const [newCommentByFile, setNewCommentByFile] = useState({});
  const [savingCommentByFile, setSavingCommentByFile] = useState({});
  const [focusedFileId, setFocusedFileId] = useState(null);
  const [highlightedCommentFileId, setHighlightedCommentFileId] = useState(null);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const queryFileId = useMemo(() => {
    const v = query.get('fileId');
    const n = v ? Number(v) : null;
    return n && !Number.isNaN(n) ? n : null;
  }, [query]);
  const queryHighlightComment = useMemo(() => {
    const v = query.get('highlightComment');
    if (v === null) return false;
    if (v === '' || v === '1' || v === 'true') return true;
    return Boolean(Number(v));
  }, [query]);

  async function fetchFiles() {
    if (!activeCompany) {
      setFiles([]);
      setSelectedYear(null);
      setSelectedMonth(null);
      return;
    }

    setLoading(true);
    try {
      const res = await privateService.get(`/company-documents/${activeCompany}/${serviceId}`);
      const documents = res?.documents || [];
      const mapped = documents.map((d) => ({
        id: d.id,
        name: d.name,
        uploaded_at: d.created_at,
        size_bytes: d.size_bytes,
      }));
      setFiles(mapped);

      if (mapped.length > 0) {
        const years = Array.from(
          new Set(
            mapped.map((f) => new Date(f.uploaded_at).getFullYear()).filter((y) => !Number.isNaN(y))
          )
        ).sort((a, b) => b - a);

        const firstYear = years[0];
        const monthsForYear = Array.from(
          new Set(
            mapped
              .filter((f) => new Date(f.uploaded_at).getFullYear() === firstYear)
              .map((f) => new Date(f.uploaded_at).getMonth())
          )
        ).sort((a, b) => a - b);

        setSelectedYear(firstYear);
        setSelectedMonth(monthsForYear[0] ?? null);
      } else {
        setSelectedYear(null);
        setSelectedMonth(null);
      }
    } catch (e) {
      setFiles([]);
      setSelectedYear(null);
      setSelectedMonth(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!mounted) return;
      await fetchFiles();
    }

    run();

    return () => {
      mounted = false;
    };
  }, [activeCompany, serviceId]);

  const groupedByYearAndMonth = useMemo(() => {
    const result = {};
    files.forEach((file) => {
      const d = new Date(file.uploaded_at);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = d.getMonth();
      if (!result[year]) result[year] = {};
      if (!result[year][month]) result[year][month] = [];
      result[year][month].push(file);
    });
    return result;
  }, [files]);

  const availableYears = useMemo(() => {
    return Object.keys(groupedByYearAndMonth)
      .map((y) => Number(y))
      .sort((a, b) => b - a);
  }, [groupedByYearAndMonth]);

  const availableMonthsForSelectedYear = useMemo(() => {
    if (!selectedYear || !groupedByYearAndMonth[selectedYear]) return [];
    return Object.keys(groupedByYearAndMonth[selectedYear])
      .map((m) => Number(m))
      .sort((a, b) => a - b);
  }, [groupedByYearAndMonth, selectedYear]);

  const visibleFiles = useMemo(() => {
    if (
      !selectedYear ||
      selectedMonth === null ||
      !groupedByYearAndMonth[selectedYear] ||
      !groupedByYearAndMonth[selectedYear][selectedMonth]
    ) {
      return [];
    }
    return groupedByYearAndMonth[selectedYear][selectedMonth].sort((a, b) => {
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    });
  }, [groupedByYearAndMonth, selectedYear, selectedMonth]);

  async function handleView(fileId) {
    if (!activeCompany) return;
    const res = await privateService.create(
      `/company-documents/${activeCompany}/${serviceId}/${fileId}/view-url`
    );
    if (res?.view_url) {
      window.open(res.view_url, '_blank', 'noopener,noreferrer');
    }
  }

  async function loadComments(fileId) {
    if (!activeCompany) return;
    setCommentsLoadingByFile((prev) => ({ ...prev, [fileId]: true }));
    try {
      const res = await privateService.get(
        `/company-documents/${activeCompany}/${serviceId}/${fileId}/comments`
      );
      const comments = res?.comments || [];
      setCommentsByFile((prev) => ({ ...prev, [fileId]: comments }));
    } catch (e) {
      setCommentsByFile((prev) => ({ ...prev, [fileId]: [] }));
    } finally {
      setCommentsLoadingByFile((prev) => ({ ...prev, [fileId]: false }));
    }
  }

  function toggleComments(fileId) {
    if (openFileId === fileId) {
      setOpenFileId(null);
      setHighlightedCommentFileId(null);
      return;
    }
    setOpenFileId(fileId);
    if (!commentsByFile[fileId]) {
      loadComments(fileId);
    }
  }

  async function handleAddComment(fileId) {
    if (!activeCompany) return;
    const text = (newCommentByFile[fileId] || '').trim();
    if (!text) {
      setToast({
        show: true,
        message: 'Escribe un comentario antes de guardar',
        type: 'error',
        button: {},
      });
      return;
    }
    setSavingCommentByFile((prev) => ({ ...prev, [fileId]: true }));
    try {
      await privateService.create(
        `/company-documents/${activeCompany}/${serviceId}/${fileId}/comments`,
        {
          comment: text,
        }
      );
      setNewCommentByFile((prev) => ({ ...prev, [fileId]: '' }));
      await loadComments(fileId);
      setToast({
        show: true,
        message: 'Comentario agregado correctamente',
        type: 'success',
        button: {},
      });
    } catch (e) {
      setToast({
        show: true,
        message: 'No se pudo agregar el comentario',
        type: 'error',
        button: {},
      });
    } finally {
      setSavingCommentByFile((prev) => ({ ...prev, [fileId]: false }));
    }
  }

  async function handleUploadSelectedFile(file) {
    if (!activeCompany || !file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await privateService.upload(`/company-documents/${activeCompany}/${serviceId}`, formData);

      setToast({
        show: true,
        message: 'Archivo subido correctamente',
        type: 'success',
        button: {},
      });

      await fetchFiles();
    } catch (e) {
      setToast({
        show: true,
        message: 'No se pudo subir el archivo',
        type: 'error',
        button: {},
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  useEffect(() => {
    return () => {
      storage.setItem('IalreadyViewedPage', true);
    };
  }, []);

  const IalreadyViewedPage = storage.getItem('IalreadyViewedPage') == true;

  useEffect(() => {
    if (!queryFileId || !files.length) return;

    const targetFile = files.find((f) => String(f.id) === String(queryFileId));
    if (!targetFile) return;

    const d = new Date(targetFile.uploaded_at);
    const year = d.getFullYear();
    const month = d.getMonth();

    if (!Number.isNaN(year) && !Number.isNaN(month)) {
      setSelectedYear(year);
      setSelectedMonth(month);
      setFocusedFileId(targetFile.id);

      if (queryHighlightComment) {
        setOpenFileId(targetFile.id);
        setHighlightedCommentFileId(targetFile.id);
        if (!commentsByFile[targetFile.id]) {
          loadComments(targetFile.id);
        }
      } else {
        setOpenFileId(null);
        setHighlightedCommentFileId(null);
      }
    }
  }, [queryFileId, queryHighlightComment, files, commentsByFile]);

  useEffect(() => {
    const ctx = location.state && location.state.notificationContext;
    if (!ctx || !files.length) return;
    if (queryFileId) return;

    const documentId = ctx.documentId;
    if (!documentId) return;

    const targetFile = files.find((f) => String(f.id) === String(documentId));
    if (!targetFile) return;

    const d = new Date(targetFile.uploaded_at);
    const year = d.getFullYear();
    const month = d.getMonth();
    if (!Number.isNaN(year) && !Number.isNaN(month)) {
      setSelectedYear(year);
      setSelectedMonth(month);
      setFocusedFileId(targetFile.id);
      if (ctx.openComments) {
        setOpenFileId(targetFile.id);
        if (!commentsByFile[targetFile.id]) {
          loadComments(targetFile.id);
        }
      }
    }
  }, [location.state, files, commentsByFile, queryFileId]);

  useEffect(() => {
    if (!highlightedCommentFileId) return;
    if (openFileId !== highlightedCommentFileId) return;
    if (commentsLoadingByFile[highlightedCommentFileId]) return;

    const el = commentTargetRefByFile.current[highlightedCommentFileId];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const t = setTimeout(() => setHighlightedCommentFileId(null), 2500);
    return () => clearTimeout(t);
  }, [highlightedCommentFileId, openFileId, commentsLoadingByFile]);

  useEffect(() => {
    if (true) {
      setToast({
        show: true,
        message: 'Aqui verás tus archivos y podrás subir los tuyos',
        type: 'success',
        button: {},
      });
    }
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full h-full mr-5">
        <>
          <aside className="w-full md:w-64 lg:w-72 rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Mis archivos</h2>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleUploadSelectedFile(e.target.files && e.target.files[0])}
              />

              <button
                type="button"
                disabled={uploading || !activeCompany}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                  uploading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:opacity-90'
                }`}>
                {uploading ? 'Subiendo…' : 'Subir archivo'}
              </button>
            </div>

            {loading && files.length === 0 ? (
              <div className="text-xs text-gray-500">Cargando…</div>
            ) : availableYears.length === 0 ? (
              <div className="text-xs text-gray-500">No hay archivos disponibles.</div>
            ) : (
              <>
                <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Años</div>
                <div className="flex flex-col gap-1 mb-4">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setSelectedYear(year);
                        const months = Object.keys(groupedByYearAndMonth[year])
                          .map((m) => Number(m))
                          .sort((a, b) => a - b);
                        setSelectedMonth(months[0] ?? null);
                        setFocusedFileId(null);
                        setOpenFileId(null);
                        setHighlightedCommentFileId(null);
                      }}
                      className={`rounded-xl px-3 py-2 text-sm transition cursor-pointer ${
                        year === selectedYear
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                      {year}
                    </button>
                  ))}
                </div>

                {selectedYear && availableMonthsForSelectedYear.length > 0 && (
                  <>
                    <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">
                      Meses de {selectedYear}
                    </div>
                    <div className="grid grid-cols-2 gap-1 md:grid-cols-3">
                      {availableMonthsForSelectedYear.map((monthIndex) => (
                        <button
                          key={monthIndex}
                          type="button"
                          onClick={() => {
                            setSelectedMonth(monthIndex);
                            setFocusedFileId(null);
                            setOpenFileId(null);
                            setHighlightedCommentFileId(null);
                          }}
                          className={`rounded-xl px-2 py-1.5 text-[11px] transition cursor-pointer ${
                            monthIndex === selectedMonth
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                          {MONTH_LABELS[monthIndex]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </aside>

          <section className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedYear && selectedMonth !== null
                  ? `${MONTH_LABELS[selectedMonth]} ${selectedYear}`
                  : 'Archivos'}
              </h3>
              <p className="text-xs text-gray-500">
                {visibleFiles.length} archivo{visibleFiles.length !== 1 ? 's' : ''}
              </p>
            </div>

            {visibleFiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                No hay archivos.
              </div>
            ) : (
              <div className="overflow-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-xs md:text-sm">
                  <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-1 md:px-4 py-2 text-left font-medium">Nombre</th>
                      <th className="px-1 md:px-4 py-2 text-left font-medium">Fecha</th>
                      <th className="px-1 md:px-4 py-2 text-left font-medium">Tamaño</th>
                      <th className="px-1 md:px-4 py-2 text-left font-medium">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {visibleFiles.map((file) => (
                      <React.Fragment key={file.id}>
                        <tr
                          className={`transition ${
                            focusedFileId === file.id
                              ? 'bg-purple-50 hover:bg-purple-100'
                              : 'hover:bg-gray-50'
                          }`}>
                          <td className="px-1 md:px-4 py-2 text-gray-900">{file.name}</td>

                          <td className="px-1 md:px-4 py-2 text-gray-600">
                            {formatDate(file.uploaded_at)}
                          </td>

                          <td className="px-1 md:px-4 py-2 text-gray-600">
                            {formatSize(file.size_bytes)}
                          </td>

                          <td className="px-1 md:px-4 py-2 space-x-2">
                            <button
                              onClick={() => handleView(file.id)}
                              className="text-primary hover:underline text-xs cursor-pointer">
                              Ver
                            </button>
                            <button
                              onClick={() => toggleComments(file.id)}
                              className="text-primary hover:underline text-xs cursor-pointer">
                              Comentarios
                            </button>
                          </td>
                        </tr>

                        {openFileId === file.id && (
                          <tr>
                            <td colSpan={4} className="bg-gray-50 px-1 md:px-4 py-3">
                              <div
                                className={`space-y-3 rounded-xl ${
                                  highlightedCommentFileId === file.id
                                    ? 'ring-2 ring-primary/60 bg-purple-50'
                                    : ''
                                }`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-gray-700">
                                    Comentarios
                                  </span>
                                  {commentsLoadingByFile[file.id] && (
                                    <span className="text-[11px] text-gray-500">Cargando…</span>
                                  )}
                                </div>

                                <div className="max-h-40 overflow-y-auto space-y-2">
                                  {(commentsByFile[file.id] || []).length === 0 &&
                                  !commentsLoadingByFile[file.id] ? (
                                    <div
                                      ref={(el) => {
                                        if (el) commentTargetRefByFile.current[file.id] = el;
                                      }}
                                      className="text-[11px] text-gray-500">
                                      No hay comentarios.
                                    </div>
                                  ) : (
                                    (commentsByFile[file.id] || []).map((c, idx, arr) => {
                                      const isMine =
                                        currentUserId && c.created_by_user_id === currentUserId;
                                      const isLast = idx === arr.length - 1;

                                      return (
                                        <div
                                          key={c.id}
                                          ref={(el) => {
                                            if (isLast && el)
                                              commentTargetRefByFile.current[file.id] = el;
                                          }}
                                          className={`max-w-[85%] rounded-lg border px-3 py-2 ${
                                            isMine
                                              ? 'ml-auto bg-primary text-white border-primary'
                                              : 'mr-auto bg-white text-gray-800 border-gray-200'
                                          }`}>
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[10px] font-semibold">
                                              {isMine ? 'Tú' : 'Administrador'}
                                            </span>
                                            {c.created_at && (
                                              <span className="text-[10px] opacity-80">
                                                {formatDateTime(c.created_at)}
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-xs break-words">{c.comment}</div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                <div className="mt-2">
                                  <TextArea
                                    maxLength={2000}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                    placeholder="Escribe un comentario…"
                                    value={newCommentByFile[file.id] || ''}
                                    onChange={(e) =>
                                      setNewCommentByFile((prev) => ({
                                        ...prev,
                                        [file.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <div className="mt-2 flex justify-end">
                                    <Button
                                      variant="wizard"
                                      className="cursor-pointer"
                                      onClick={() => handleAddComment(file.id)}
                                      disabled={!!savingCommentByFile[file.id]}>
                                      {savingCommentByFile[file.id] ? 'Guardando…' : 'Enviar'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      </div>

      <div className="w-full block">
        <h2 className="text-xl text-black font-bold mb-5">Dashboard</h2>
        <div className="border rounded-xl border-opaque shadow-lg w-full h-50 flex justify-center items-center text-secondary mb-5">
          Proximamente...
        </div>
      </div>
    </>
  );
}
