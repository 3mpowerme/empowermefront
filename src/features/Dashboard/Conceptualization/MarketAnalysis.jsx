import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  AlertTriangle,
  MapPin,
  Landmark,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  PersonStanding,
  Store,
  Construction,
  Pickaxe,
  Check,
  X,
  Crosshair,
  BookOpenText,
  ShieldAlert,
  LocateFixed,
  BookCheck,
  Shapes,
  Printer,
} from 'lucide-react';
import CardSection from '../../../components/CardSection/CardSection';
import Button from '../../../components/Button/Button';
import { TEMPLATE_DATA } from './Template';

const SafeHtml = ({ html, className = '', fallback = '—' }) => {
  if (!html) return <p className={className}>{fallback}</p>;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

const getCurrencyFormatter = (meta) => {
  const locale = meta?.locale || 'es-MX';
  const currency = meta?.currency || 'MXN';
  try {
    return (n, options) =>
      typeof n === 'number'
        ? new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
            ...options,
          }).format(n)
        : '—';
  } catch {
    return (n) =>
      typeof n === 'number' ? `${currency} ${Math.round(n).toLocaleString(locale)}` : '—';
  }
};

const getNumberFormatter = (meta) => {
  const locale = meta?.locale || 'es-MX';
  try {
    return (n, options) => {
      if (typeof n === 'number') {
        return new Intl.NumberFormat(locale, { maximumFractionDigits: 0, ...options }).format(n);
      }
      if (typeof n === 'string' && !Number.isNaN(Number(n))) {
        return new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0,
          ...options,
        }).format(Number(n));
      }
      return '—';
    };
  } catch {
    return (n) => {
      if (typeof n === 'number') return Math.round(n).toLocaleString(locale);
      if (typeof n === 'string' && !Number.isNaN(Number(n))) {
        return Math.round(Number(n)).toLocaleString(locale);
      }
      return '—';
    };
  }
};

function formatMetaText(metaText, fmtNumber) {
  if (typeof metaText !== 'string') return metaText;

  return metaText.replace(/\d[\d.,]*/g, (raw) => {
    const num = Number(raw.replace(/[.,]/g, ''));
    if (isNaN(num)) return raw;
    return fmtNumber(num);
  });
}

const COLOR_MAP = {
  slate: 'bg-white text-black ring-gray-300',
  emerald: 'bg-white text-black ring-gray-300',
  sky: 'bg-white text-black ring-gray-300',
  amber: 'bg-white text-black ring-gray-300',
  rose: 'bg-white text-black ring-gray-300',
  violet: 'bg-white text-black ring-gray-300',
};

const COLORS = ['#8b5cf6', '#06b6d4', '#34d399', '#f59e0b', '#f43f5e', '#0ea5e9'];

const badge = (text, color = 'slate') => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${COLOR_MAP[color]} ring-1 ring-inset`}>
    {text}
  </span>
);

const chipList = (items, color = 'slate') => (
  <div className="flex flex-wrap gap-2">
    {(items || []).slice(0, 6).map((t, i) => (
      <span key={i} className={`text-sm rounded-xl ring-1 ring-inset p-3 ${COLOR_MAP[color]}`}>
        {t}
      </span>
    ))}
  </div>
);

const probImpactColor = (level) => {
  const v = (level || '').toLowerCase();
  if (v.includes('alto') || v.includes('alta')) return 'rose';
  if (v.includes('medio') || v.includes('media')) return 'amber';
  return 'sky';
};

const renderDonutLabel = (fmtCurrency) => (props) => {
  const { cx, cy, midAngle, outerRadius, value, payload } = props;
  const name = payload?.name ?? '';
  const RAD = Math.PI / 180;
  const r = (outerRadius || 0) + 16;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  const anchor = x > cx ? 'start' : 'end';
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fontSize={12} fill="#000000">
      {name}: {fmtCurrency(Number(value))}
    </text>
  );
};

const Donut = ({ data, fmtCurrency }) => (
  <div className="allow-overflow">
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={95}
          cornerRadius={6}
          paddingAngle={2}
          isAnimationActive={false}
          labelLine
          label={renderDonutLabel(fmtCurrency)}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <ReTooltip formatter={(value) => fmtCurrency(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const Bars = ({ data, fmtCurrency, fmtNumber }) => (
  <ResponsiveContainer width="100%" height={240}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#000' }} />
      <YAxis
        tick={{ fontSize: 12, fill: '#000' }}
        tickFormatter={(value) => fmtNumber(Number(value))}
      />
      <ReTooltip formatter={(value) => fmtCurrency(Number(value))} />
      <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="#06b6d4" isAnimationActive={false} />
    </BarChart>
  </ResponsiveContainer>
);

const Linea = ({ data, fmtNumber }) => (
  <ResponsiveContainer width="100%" height={240}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#000' }} />
      <YAxis
        tick={{ fontSize: 12, fill: '#000' }}
        tickFormatter={(value) => fmtNumber(Number(value))}
      />
      <ReTooltip formatter={(value) => fmtNumber(Number(value))} />
      <Line
        type="monotone"
        dataKey="value"
        stroke="#111111"
        strokeWidth={3}
        dot={{ r: 4, stroke: '#111', fill: '#111' }}
        activeDot={{ r: 6 }}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

const Gauge = ({ percent }) => {
  const val = Math.max(0, Math.min(100, Number(percent) || 0));
  const data = [
    { name: 'margen', value: val },
    { name: 'resto', value: 100 - val },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadialBarChart
        innerRadius="45%"
        outerRadius="100%"
        data={data}
        startAngle={180}
        endAngle={0}>
        <RadialBar
          dataKey="value"
          clockWise
          fill="#111111"
          background
          cornerRadius={8}
          isAnimationActive={false}
        />
        <ReTooltip />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all text-black">
    {icon}
    <span>{label}</span>
    {active && (
      <motion.span
        layoutId="tab-underline"
        className="absolute -bottom-1 left-3 right-3 h-0.5 bg-black rounded-full"
      />
    )}
  </button>
);

export default function MarketAnalysis({ data, showDownloadPDF = false, showTemplate }) {
  const d = showTemplate ? TEMPLATE_DATA : data || {};
  const fmtCurrency = React.useMemo(() => getCurrencyFormatter(d.meta_moneda), [d.meta_moneda]);
  const fmtNumber = React.useMemo(() => getNumberFormatter(d.meta_moneda), [d.meta_moneda]);

  const fin = d.finanzas || {};
  const inv = fin.inversion_inicial || {};
  const costosFijos = fin.costos_fijos_mensuales || [];
  const donutInversion = (inv.rubro || [])
    .slice(0, 6)
    .map((r) => ({ name: r.concepto, value: Number(r.amount || 0) }));
  const barsCostosFijos = (costosFijos || [])
    .slice(0, 6)
    .map((c) => ({ name: c.concepto, value: Number(c.amount || 0) }));
  const lineVolumen = (() => {
    const vol = fin.volumen_mensual_estimado || { min: 0, max: 0 };
    const min = Number(vol.min || 0);
    const max = Number(vol.max || 0);
    const prom = Math.round((min + max) / 2 || 0);
    return [
      { name: 'Min', value: min },
      { name: 'Prom', value: prom },
      { name: 'Max', value: max },
    ];
  })();
  const margenOpPct = (() => {
    const raw = fin?.margen_esperado?.['operativo_%'];
    if (typeof raw === 'number') return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
    return 0;
  })();

  const resumenRef = React.useRef(null);
  const clientesRef = React.useRef(null);
  const competenciaRef = React.useRef(null);
  const canalRef = React.useRef(null);
  const identidadRef = React.useRef(null);
  const finanzasRef = React.useRef(null);
  const riesgosRef = React.useRef(null);

  const [activeTab, setActiveTab] = React.useState('resumen');
  const sections = React.useMemo(
    () => [
      { key: 'resumen', ref: resumenRef },
      { key: 'clientes', ref: clientesRef },
      { key: 'competencia', ref: competenciaRef },
      { key: 'canal', ref: canalRef },
      { key: 'identidad', ref: identidadRef },
      { key: 'finanzas', ref: finanzasRef },
      { key: 'riesgos', ref: riesgosRef },
    ],
    []
  );

  React.useEffect(() => {
    const opts = { root: null, rootMargin: '0px 0px -70% 0px', threshold: [0, 0.2, 0.5, 1] };
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveTab(visible.target.id);
    }, opts);
    sections.forEach(({ ref, key }) => {
      if (ref.current) {
        ref.current.id = key;
        io.observe(ref.current);
      }
    });
    return () => io.disconnect();
  }, [sections]);

  const scrollTo = (ref, key) => {
    setActiveTab(key);
    if (!ref?.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDownloadPdf = () => window.print();

  return (
    <div className="relative w-full mx-auto max-w-7xl print-container py-5 text-black bg-transparent">
      <style>{`
        .allow-overflow .recharts-wrapper { overflow: visible !important; }
        .print-container .recharts-surface text { fill: #000000 !important; }
        html:has(.print-container) { scroll-behavior: smooth; }
        .section-anchor { scroll-margin-top: 96px; }
        @page { margin: 16mm; }
        @media print {
          .print-container { background: #fff !important; color: #000 !important; }
          .print-container * {
            color: #000 !important;
            box-shadow: none !important;
            filter: none !important;
            -webkit-filter: none !important;
            backdrop-filter: none !important;
            background: transparent !important;
          }
          .card-white { background: #ffffff !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .print\\:break-after-page { break-after: page; page-break-after: always; }
          .rounded-3xl, .rounded-2xl, .rounded-xl, .rounded-lg { border-radius: 0 !important; }
          .ring-1 { box-shadow: none !important; }
        }
      `}</style>

      <div className="flex items-center justify-between gap-4 sticky top-0 z-30 bg-white px-1 py-3 print:hidden">
        <h2 className="text-2xl sm:text-3xl font-bold">Análisis de viabilidad</h2>
        {showDownloadPDF && (
          <Button variant="wizard" className="flex py-2 print:hidden" onClick={handleDownloadPdf}>
            <span>
              <Printer className="mr-2" />
            </span>
            <span>Imprimir PDF</span>
          </Button>
        )}
      </div>

      <nav className="mb-6 flex flex-wrap gap-2 sticky top-[56px] z-20 px-1 py-2 print:hidden">
        <TabButton
          active={activeTab === 'resumen'}
          onClick={() => scrollTo(resumenRef, 'resumen')}
          icon={<BookOpenText className="h-4 w-4" />}
          label="Resumen"
        />
        <TabButton
          active={activeTab === 'clientes'}
          onClick={() => scrollTo(clientesRef, 'clientes')}
          icon={<Crosshair className="h-4 w-4" />}
          label="Clientes"
        />
        <TabButton
          active={activeTab === 'competencia'}
          onClick={() => scrollTo(competenciaRef, 'competencia')}
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Competencia"
        />
        <TabButton
          active={activeTab === 'canal'}
          onClick={() => scrollTo(canalRef, 'canal')}
          icon={<MapPin className="h-4 w-4" />}
          label="Ubicación/Canal"
        />
        <TabButton
          active={activeTab === 'identidad'}
          onClick={() => scrollTo(identidadRef, 'identidad')}
          icon={<Landmark className="h-4 w-4" />}
          label="Identidad"
        />
        <TabButton
          active={activeTab === 'finanzas'}
          onClick={() => scrollTo(finanzasRef, 'finanzas')}
          icon={<DollarSign className="h-4 w-4" />}
          label="Finanzas"
        />
        <TabButton
          active={activeTab === 'riesgos'}
          onClick={() => scrollTo(riesgosRef, 'riesgos')}
          icon={<Target className="h-4 w-4" />}
          label="KPIs & Riesgos"
        />
      </nav>

      <div className={`rounded-3xl p-5 space-y-10 ${showTemplate ? 'blur-xs' : ''}`}>
        <section ref={resumenRef} className="section-anchor">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <CardSection className="lg:col-span-2 card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-white ring-1 ring-gray-200">
                  <BookOpenText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Resumen</h2>
              </div>
              <SafeHtml
                html={d?.resumen?.idea}
                className="mb-4 text-base font-medium"
                fallback="Idea no especificada"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                    Puntos fuertes
                  </div>
                  {chipList(d?.resumen?.puntos_fuertes, 'emerald')}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2">Alertas</div>
                  {chipList(d?.resumen?.alertas, 'amber')}
                </div>
              </div>
            </CardSection>
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-white ring-1 ring-gray-200">
                  <BookCheck className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Viabilidad</h2>
              </div>
              <div className="flex flex-col items-center gap-2 mb-3">
                {badge(
                  d?.veredicto?.nivel || '—',
                  d?.veredicto?.nivel?.toLowerCase().includes('alta')
                    ? 'emerald'
                    : d?.veredicto?.nivel?.toLowerCase().includes('moderada')
                      ? 'amber'
                      : 'rose'
                )}
                <span className="text-base font-medium">
                  {d?.veredicto?.conclusion || 'Sin conclusión'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                    Razones clave
                  </div>
                  {chipList(d?.veredicto?.razones_clave, 'sky')}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                    Condiciones para el éxito
                  </div>
                  {chipList(d?.veredicto?.condiciones_para_exito, 'violet')}
                </div>
              </div>
            </CardSection>
          </motion.div>
        </section>

        <section ref={clientesRef} className="section-anchor">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <CardSection className="lg:col-span-2 card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-white ring-1 ring-gray-200">
                  <Crosshair className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Segmentos y Personas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="text-sm font-semibold mb-2">Segmentos</div>
                  <ul className="space-y-3">
                    {(d?.clientes?.segmentos || []).slice(0, 4).map((s, i) => (
                      <li
                        key={i}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="font-medium">{s.nombre}</div>
                        <div className="text-sm my-5 flex flex-col">
                          <span className="flex flex-row items-center">
                            <Users size={15} className="mr-1" />
                            Edad: {s.edad_rango}
                          </span>
                          <span className="flex flex-row items-center">
                            <DollarSign size={15} className="mr-1" />
                            Ingreso: {s.nivel_ingreso}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                            Necesidades
                          </div>
                          {chipList(s.necesidades, 'sky')}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                            Carencias
                          </div>
                          {chipList(s.dolores, 'rose')}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold mb-1">
                      <Store size={15} className="mr-2 inline" />
                      Tamaño de mercado
                    </div>
                    <div className="text-xs">
                      Método: {d?.clientes?.tamaño_mercado?.metodo || '—'}
                    </div>
                    <div className="text-xs">
                      Estimación clientes:{' '}
                      {d?.clientes?.tamaño_mercado?.estimacion_clientes
                        ? `${fmtNumber(
                            d.clientes.tamaño_mercado.estimacion_clientes.min
                          )}–${fmtNumber(d.clientes.tamaño_mercado.estimacion_clientes.max)}`
                        : '—'}
                    </div>
                    <div className="text-xs">
                      Supuesto:{' '}
                      {d?.clientes?.tamaño_mercado?.estimacion_clientes?.supuesto_clave || '—'}
                    </div>
                    <div className="text-xs mt-2">
                      Disposición a pagar:{' '}
                      {d?.clientes?.tamaño_mercado?.disposicion_pagar?.rango
                        ? `${fmtCurrency(
                            d.clientes.tamaño_mercado.disposicion_pagar.rango.min
                          )}–${fmtCurrency(d.clientes.tamaño_mercado.disposicion_pagar.rango.max)}`
                        : '—'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold mb-2">Personas ejemplo</div>
                    <ul className="space-y-2">
                      {(d?.clientes?.personas_ejemplo || []).slice(0, 2).map((p, i) => (
                        <li key={i} className="text-sm">
                          <PersonStanding size={15} className="mr-1 inline" />
                          <span className="font-medium">{p.nombre}</span>{' '}
                          <span>{p.descripcion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardSection>

            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Volumen mensual estimado</h2>
              </div>
              <Linea data={lineVolumen} fmtNumber={fmtNumber} />
            </CardSection>
          </motion.div>
        </section>

        <section ref={competenciaRef} className="section-anchor">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Competidores directos</h2>
              </div>
              <ul className="space-y-3">
                {(d?.escenario_competitivo?.competidores_directos || []).slice(0, 5).map((c, i) => (
                  <li key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{c.nombre}</div>
                      {badge(c.precio_relativo || '—', 'violet')}
                    </div>
                    <div className="text-xs text-gray-700">{c.propuesta}</div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                          <Check size={15} className="inline mr-2" /> Fortalezas
                        </div>
                        {chipList(c.fortalezas, 'emerald')}
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                          <X size={15} className="inline mr-2" /> Debilidades
                        </div>
                        {chipList(c.debilidades, 'rose')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardSection>

            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Indirectos & Barreras</h2>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-4">
                <div className="text-xs font-semibold mb-1">Competidores indirectos</div>
                <ul className="space-y-2 text-sm">
                  {(d?.escenario_competitivo?.competidores_indirectos || [])
                    .slice(0, 5)
                    .map((c, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>
                          {c.tipo} → {c.sustituto_de}
                        </span>
                        {badge(c.riesgo || '—', probImpactColor(c.riesgo))}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                  <Pickaxe size={15} className="inline mr-2" /> Oportunidades de diferenciación
                </div>
                {chipList(d?.escenario_competitivo?.oportunidades_diferenciacion, 'sky')}
                <div className="text-xs font-semibold uppercase tracking-wide mb-2 mt-4">
                  <Construction size={15} className="inline mr-2" /> Barreras de entrada
                </div>
                {chipList(d?.escenario_competitivo?.barreras_entrada, 'amber')}
              </div>
            </CardSection>
          </motion.div>
        </section>

        <section ref={canalRef} className="section-anchor">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-5">
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-white ring-1 ring-gray-200">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Ubicación / Canal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <div className="text-sm font-semibold mb-1">Recomendación</div>
                  <div>
                    {d?.ubicacion_o_canal?.recomendacion?.tipo?.replace('_', ' ')}
                    <br />
                    {d?.ubicacion_o_canal?.recomendacion?.zona_o_plataforma}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                    Justificación
                  </div>
                  {chipList(d?.ubicacion_o_canal?.justificacion, 'violet')}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                    Factores de éxito
                  </div>
                  {chipList(d?.ubicacion_o_canal?.factores_exito, 'emerald')}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                  Alternativas
                </div>
                {chipList(d?.ubicacion_o_canal?.opciones_alternativas, 'slate')}
              </div>
            </CardSection>
          </motion.div>
        </section>

        <section ref={identidadRef} className="section-anchor">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-white ring-1 ring-gray-200">
                  <Landmark className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Propuesta & Promesa</h2>
              </div>
              <div className="text-sm font-semibold mb-1">Propuesta de valor</div>
              <SafeHtml html={d?.identidad_imagen?.propuesta_valor} fallback="—" />
              <div className="text-sm font-semibold mt-3 mb-1">Promesa de marca</div>
              <SafeHtml html={d?.identidad_imagen?.promesa_marca} fallback="—" />
            </CardSection>
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <Shapes className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Estilo & Diferenciadores</h2>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2">
                Tono y estilo
              </div>
              {chipList(d?.identidad_imagen?.tono_y_estilo, 'sky')}
              <div className="text-xs font-semibold uppercase tracking-wide mb-2 mt-4">
                Diferenciadores
              </div>
              {chipList(d?.identidad_imagen?.diferenciadores_clave, 'violet')}
            </CardSection>
          </motion.div>
        </section>

        <section ref={finanzasRef} className="section-anchor">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-3 gap-5 mb-10">
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Inversión inicial</h2>
              </div>
              <Donut data={donutInversion} fmtCurrency={fmtCurrency} />
              <div className="mt-3 text-sm">
                Total: <span className="font-semibold">{fmtCurrency(inv.total)}</span>
              </div>
            </CardSection>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-3 gap-5 mb-10">
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Costos fijos mensuales</h2>
              </div>
              <div className="mx-10">
                <Bars data={barsCostosFijos} fmtCurrency={fmtCurrency} fmtNumber={fmtNumber} />
              </div>
            </CardSection>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Punto de equilibrio mensual</h2>
              </div>
              <div className="text-sm space-y-1">
                <div>
                  Unidades:{' '}
                  <span className="font-semibold">
                    {fin?.punto_equilibrio?.unidades != null
                      ? fmtNumber(fin.punto_equilibrio.unidades)
                      : '—'}
                  </span>
                </div>
                <div>
                  Ventas:{' '}
                  <span className="font-semibold">
                    {fmtCurrency(fin?.punto_equilibrio?.ventas)}
                  </span>
                </div>
                <div className="text-xs">{fin?.punto_equilibrio?.formula}</div>
              </div>
            </CardSection>

            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Margen operativo</h2>
              </div>
              <div className="text-center text-sm -mt-6">
                <h3 className="font-bold text-6xl pt-5">
                  {Number.isFinite(margenOpPct) ? `${margenOpPct}%` : '—'}
                </h3>
              </div>
            </CardSection>
          </motion.div>
        </section>

        <section ref={riesgosRef} className="section-anchor">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <CardSection className="lg:col-span-2 card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Riesgos y mitigantes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(d?.riesgos_y_mitigantes || []).slice(0, 6).map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="font-medium mb-1">
                      <ShieldAlert size={15} className="inline mr-2" />
                      {r.riesgo}
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <div>
                        Prob: {badge(r.probabilidad || '—', probImpactColor(r.probabilidad))}
                      </div>
                      <div>Impacto: {badge(r.impacto || '—', probImpactColor(r.impacto))}</div>
                    </div>
                    <div className="text-sm">{r.mitigacion}</div>
                  </div>
                ))}
              </div>
            </CardSection>
            <CardSection className="card-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-2xl bg-white ring-1 ring-gray-200">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">KPIs sugeridos</h2>
              </div>

              <ul className="space-y-2">
                {(d?.kpis_sugeridos || []).slice(0, 6).map((k, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                    <div>
                      <div className="font-medium">{k.nombre}</div>
                      <div className="text-xs text-gray-700">{k.periodicidad}</div>
                    </div>

                    <div className="ml-r font-semibold">
                      <LocateFixed size={15} className="inline mr-2" />
                      {formatMetaText(k.meta, fmtNumber)}
                    </div>
                  </li>
                ))}
              </ul>
            </CardSection>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
