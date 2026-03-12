'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { useAppData } from '@/components/providers';
import {
 buildEmptyFieldMapping,
 developmentFieldLabels,
 developmentOptionalFields,
 developmentRequiredFields,
 inquiryFieldLabels,
 inquiryOptionalFields,
 inquiryRequiredFields,
 lotFieldLabels,
 lotOptionalFields,
 lotRequiredFields,
 suggestFieldMapping,
 tableLabels,
} from '@/lib/airtable/connection-schema';
import { cn } from '@/lib/format';
import {
 AirtableBaseOption,
 AirtableConnectionSummary,
 AirtableFieldMapping,
 AirtablePreviewResult,
 AirtableProviderMode,
 AirtableTableMapping,
 AirtableTableOption,
 IntegrationStatus,
} from '@/types';

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type MappingSectionKey = keyof AirtableFieldMapping;

const steps: Array<{ step: WizardStep; label: string }> = [
 { step: 1, label: 'Introduccion' },
 { step: 2, label: 'Token' },
 { step: 3, label: 'Validacion' },
 { step: 4, label: 'Base' },
 { step: 5, label: 'Tablas' },
 { step: 6, label: 'Campos' },
 { step: 7, label: 'Preview' },
 { step: 8, label: 'Listo' },
];

const emptySummary: AirtableConnectionSummary = {
 provider: 'airtable',
 status: 'not_connected',
 source: 'mock',
 mode: 'live',
 isPersistent: true,
 canDisconnect: false,
};

const labelsBySection = {
 developments: developmentFieldLabels,
 lots: lotFieldLabels,
 inquiries: inquiryFieldLabels,
} as const;

const requiredBySection = {
 developments: developmentRequiredFields,
 lots: lotRequiredFields,
 inquiries: inquiryRequiredFields,
} as const;

const optionalBySection = {
 developments: developmentOptionalFields,
 lots: lotOptionalFields,
 inquiries: inquiryOptionalFields,
} as const;

function createEmptyMapping(): AirtableFieldMapping {
 return buildEmptyFieldMapping();
}

function formatDate(value?: string) {
 if (!value) return 'Sin registrar';
 return new Date(value).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
}

function statusTone(status: IntegrationStatus) {
 switch (status) {
 case 'connected':
 return { label: 'Conectado', tone: 'bg-emerald-100 text-emerald-800 ring-emerald-200' };
 case 'validating':
 return { label: 'Validando', tone: 'bg-sky-100 text-sky-800 ring-sky-200' };
 case 'error':
 return { label: 'Error', tone: 'bg-rose-100 text-rose-800 ring-rose-200' };
 default:
 return { label: 'No conectado', tone: 'bg-slate-100 text-slate-700 ring-slate-200' };
 }
}

async function requestApi<T>(url: string, init?: RequestInit) {
 const response = await fetch(url, {
 credentials: 'same-origin',
 headers: {
 'Content-Type': 'application/json',
 ...(init?.headers || {}),
 },
 ...init,
 });

 const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

 if (!response.ok) {
 throw new Error(payload?.error || 'No pudimos completar la accion.');
 }

 if (!payload?.data) {
 throw new Error('No recibimos datos utiles del servidor.');
 }

 return payload.data;
}

function StepRail({ step }: { step: WizardStep }) {
 return (
 <ol className={'grid gap-3 md:grid-cols-4 xl:grid-cols-8'}>
 {steps.map((item) => {
 const current = item.step === step;
 const done = item.step < step;

 return (
 <li
 key={item.step}
 data-testid={'airtable-step-pill-' + item.step}
 className={cn(
 'rounded-[1.35rem] border px-4 py-3 text-sm transition',
 current
 ? 'border-sky-300 bg-sky-50 text-sky-950 shadow-[0_18px_40px_-30px_rgba(37,99,235,0.35)]'
 : done
 ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
 : 'border-slate-200 bg-white text-slate-500',
 )}
 >
 <div className={'flex items-center gap-3'}>
 <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-1', current ? 'bg-sky-600 text-white ring-sky-600' : done ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-slate-500 ring-slate-200')}>
 {item.step}
 </span>
 <span className={'font-medium'}>{item.label}</span>
 </div>
 </li>
 );
 })}
 </ol>
 );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
 return (
 <div className={'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>{label}</p>
 <p className={'mt-2 text-sm font-medium text-slate-900'}>{value}</p>
 </div>
 );
}

function PreviewCard({ title, rows }: { title: string; rows: Array<Record<string, string | number | boolean | null>> }) {
 return (
 <article className={'rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.32)]'}>
 <h4 className={'text-sm font-semibold text-slate-900'}>{title}</h4>
 <div className={'mt-4 space-y-3'}>
 {rows.length ? rows.map((row, index) => (
 <div key={title + '-' + index} className={'rounded-2xl bg-slate-50 p-3'}>
 {Object.entries(row).map(([key, value]) => (
 <div key={key} className={'flex items-start justify-between gap-4 border-b border-slate-200/70 py-1.5 last:border-b-0'}>
 <span className={'text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400'}>{key.replace(/_/g, ' ')}</span>
 <span className={'text-right text-sm text-slate-700'}>{value === null ? 'Sin dato' : String(value)}</span>
 </div>
 ))}
 </div>
 )) : <p className={'rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500'}>Sin ejemplos por ahora.</p>}
 </div>
 </article>
 );
}

function FieldMappingSection({
 section,
 table,
 mapping,
 onChange,
}: {
 section: MappingSectionKey;
 table?: AirtableTableOption;
 mapping: AirtableFieldMapping[MappingSectionKey];
 onChange: (fieldKey: string, value: string) => void;
}) {
 const labels = labelsBySection[section] as Record<string, string>;
 const requiredFields = requiredBySection[section] as string[];
 const optionalFields = optionalBySection[section] as string[];
 const options = table?.fields || [];

 return (
 <section className={'rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.32)]'}>
 <div className={'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'}>
 <div>
 <h4 className={'text-lg font-semibold text-slate-950'}>{tableLabels[section]}</h4>
 <p className={'text-sm text-slate-500'}>{table ? 'Tabla: ' + table.name : 'Elige una tabla en el paso anterior.'}</p>
 </div>
 <span className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'}>{requiredFields.length} obligatorios</span>
 </div>

 <div className={'mt-5 grid gap-4 md:grid-cols-2'}>
 {requiredFields.map((fieldKey) => (
 <label key={fieldKey} className={'space-y-2'}>
 <span className={'text-sm font-medium text-slate-700'}>{labels[fieldKey]} <span className={'text-rose-500'}>*</span></span>
 <select
 data-testid={'airtable-field-select-' + section + '-' + fieldKey}
 value={mapping[fieldKey as keyof typeof mapping] || ''}
 onChange={(event) => onChange(fieldKey, event.target.value)}
 className={'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100'}
 >
 <option value={''}>Seleccionar campo</option>
 {options.map((field) => <option key={field.id || field.name} value={field.name}>{field.name}</option>)}
 </select>
 </label>
 ))}
 </div>

 <details className={'mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4'}>
 <summary className={'cursor-pointer text-sm font-semibold text-slate-700'}>Campos opcionales</summary>
 <div className={'mt-4 grid gap-4 md:grid-cols-2'}>
 {optionalFields.map((fieldKey) => (
 <label key={fieldKey} className={'space-y-2'}>
 <span className={'text-sm font-medium text-slate-700'}>{labels[fieldKey]}</span>
 <select
 data-testid={'airtable-field-select-' + section + '-' + fieldKey}
 value={mapping[fieldKey as keyof typeof mapping] || ''}
 onChange={(event) => onChange(fieldKey, event.target.value)}
 className={'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100'}
 >
 <option value={''}>Sin asignar</option>
 {options.map((field) => <option key={field.id || field.name} value={field.name}>{field.name}</option>)}
 </select>
 </label>
 ))}
 </div>
 </details>
 </section>
 );
}

export function AdminAirtablePanel() {
 const router = useRouter();
 const { showToast } = useAppData();
 const [isRefreshing, startRefresh] = useTransition();
 const [summary, setSummary] = useState<AirtableConnectionSummary>(emptySummary);
 const [isLoadingSummary, setIsLoadingSummary] = useState(true);
 const [isBusy, setIsBusy] = useState(false);
 const [step, setStep] = useState<WizardStep>(1);
 const [isWizardOpen, setIsWizardOpen] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [pat, setPat] = useState('');
 const [wizardSessionId, setWizardSessionId] = useState('');
 const [mode, setMode] = useState<AirtableProviderMode>('live');
 const [tokenMasked, setTokenMasked] = useState<string | undefined>(undefined);
 const [bases, setBases] = useState<AirtableBaseOption[]>([]);
 const [selectedBaseId, setSelectedBaseId] = useState('');
 const [selectedBaseName, setSelectedBaseName] = useState('');
 const [tables, setTables] = useState<AirtableTableOption[]>([]);
 const [tablesMapping, setTablesMapping] = useState<AirtableTableMapping>({});
 const [fieldMapping, setFieldMapping] = useState<AirtableFieldMapping>(createEmptyMapping());
 const [preview, setPreview] = useState<AirtablePreviewResult | null>(null);

 useEffect(() => {
 void loadSummary();
 }, []);

 async function loadSummary(showLoader = true) {
 try {
 if (showLoader) setIsLoadingSummary(true);
 const data = await requestApi<AirtableConnectionSummary>('/api/admin/integrations/airtable/connection');
 setSummary(data);
 } catch (requestError) {
 const message = requestError instanceof Error ? requestError.message : 'No pudimos cargar la integracion.';
 setSummary({ ...emptySummary, status: 'error', lastError: message });
 } finally {
 if (showLoader) setIsLoadingSummary(false);
 }
 }

 function resetWizard(nextStep: WizardStep = 1) {
 setStep(nextStep);
 setError(null);
 setPat('');
 setWizardSessionId('');
 setMode('live');
 setTokenMasked(undefined);
 setBases([]);
 setSelectedBaseId('');
 setSelectedBaseName('');
 setTables([]);
 setTablesMapping({});
 setFieldMapping(createEmptyMapping());
 setPreview(null);
 }

 function openWizard() {
 resetWizard(1);
 setIsWizardOpen(true);
 }

 function closeWizard() {
 setIsWizardOpen(false);
 setError(null);
 setIsBusy(false);
 }

 async function handleValidate(nextMode: AirtableProviderMode) {
 try {
 setIsBusy(true);
 setError(null);
 setSummary((current) => ({ ...current, status: 'validating' }));
 const data = await requestApi<{ wizardSessionId: string; mode: AirtableProviderMode; tokenMasked: string }>('/api/admin/integrations/airtable/validate-token', {
 method: 'POST',
 body: JSON.stringify(nextMode === 'demo' ? { mode: 'demo' } : { token: pat, mode: 'live' }),
 });

 const basesData = await requestApi<{ bases: AirtableBaseOption[] }>('/api/admin/integrations/airtable/bases?wizardSessionId=' + encodeURIComponent(data.wizardSessionId));

 setMode(data.mode);
 setWizardSessionId(data.wizardSessionId);
 setTokenMasked(data.tokenMasked);
 setBases(basesData.bases);
 setSelectedBaseId(basesData.bases[0]?.id || '');
 setSelectedBaseName(basesData.bases[0]?.name || '');
 setStep(4);
 showToast({ title: 'Acceso validado', description: nextMode === 'demo' ? 'Se activo el modo guiado con datos de ejemplo.' : 'El token se valido correctamente.', tone: 'success' });
 } catch (requestError) {
 const message = requestError instanceof Error ? requestError.message : 'No pudimos validar el acceso.';
 setSummary((current) => ({ ...current, status: 'error', lastError: message }));
 setError(message);
 } finally {
 setIsBusy(false);
 }
 }

 async function handleLoadSchema() {
 if (!wizardSessionId || !selectedBaseId) {
 setError('Elige una base para continuar.');
 return;
 }

 try {
 setIsBusy(true);
 setError(null);
 const data = await requestApi<{ base: AirtableBaseOption; tables: AirtableTableOption[]; suggestedTablesMapping: AirtableTableMapping; suggestedFieldMapping: AirtableFieldMapping }>(
 '/api/admin/integrations/airtable/schema?wizardSessionId=' + encodeURIComponent(wizardSessionId) + '&baseId=' + encodeURIComponent(selectedBaseId),
 );

 setSelectedBaseId(data.base.id);
 setSelectedBaseName(data.base.name);
 setTables(data.tables);
 setTablesMapping(data.suggestedTablesMapping);
 setFieldMapping(data.suggestedFieldMapping);
 setStep(5);
 } catch (requestError) {
 setError(requestError instanceof Error ? requestError.message : 'No pudimos leer el esquema.');
 } finally {
 setIsBusy(false);
 }
 }

 function handleTableChange(section: keyof AirtableTableMapping, value: string) {
 const nextTablesMapping = { ...tablesMapping, [section]: value || undefined };
 setTablesMapping(nextTablesMapping);
 const suggested = suggestFieldMapping(tables, nextTablesMapping);
 setFieldMapping((current) => ({ ...current, [section]: suggested[section] }));
 }

 function handleFieldChange(section: MappingSectionKey, fieldKey: string, value: string) {
 setFieldMapping((current) => ({
 ...current,
 [section]: {
 ...current[section],
 [fieldKey]: value || undefined,
 },
 }));
 }

 async function handleTestMapping() {
 try {
 setIsBusy(true);
 setError(null);
 const data = await requestApi<{ preview: AirtablePreviewResult; tablesMapping: AirtableTableMapping; fieldMapping: AirtableFieldMapping }>('/api/admin/integrations/airtable/test-mapping', {
 method: 'POST',
 body: JSON.stringify({ wizardSessionId, baseId: selectedBaseId, baseName: selectedBaseName, tablesMapping, fieldMapping }),
 });

 setTablesMapping(data.tablesMapping);
 setFieldMapping(data.fieldMapping);
 setPreview(data.preview);
 setStep(7);
 } catch (requestError) {
 setError(requestError instanceof Error ? requestError.message : 'No pudimos probar el mapping.');
 } finally {
 setIsBusy(false);
 }
 }

 async function handleSaveConnection() {
 try {
 setIsBusy(true);
 setError(null);
 const data = await requestApi<{ summary: AirtableConnectionSummary; preview: AirtablePreviewResult }>('/api/admin/integrations/airtable/connection', {
 method: 'POST',
 body: JSON.stringify({ wizardSessionId, baseId: selectedBaseId, baseName: selectedBaseName, tablesMapping, fieldMapping }),
 });

 setSummary(data.summary);
 setPreview(data.preview);
 setStep(8);
 showToast({ title: 'Conexion guardada', description: 'La integracion quedo activa.', tone: 'success' });
 startRefresh(() => {
 router.refresh();
 });
 } catch (requestError) {
 setError(requestError instanceof Error ? requestError.message : 'No pudimos guardar la conexion.');
 } finally {
 setIsBusy(false);
 }
 }

 async function handleRetestConnection() {
 try {
 setIsBusy(true);
 setError(null);
 const data = await requestApi<{ summary: AirtableConnectionSummary; preview: AirtablePreviewResult }>('/api/admin/integrations/airtable/connection', {
 method: 'POST',
 body: JSON.stringify({ action: 'retest' }),
 });
 setSummary(data.summary);
 setPreview(data.preview);
 showToast({ title: 'Conexion verificada', description: 'La integracion respondio correctamente.', tone: 'success' });
 startRefresh(() => {
 router.refresh();
 });
 } catch (requestError) {
 const message = requestError instanceof Error ? requestError.message : 'No pudimos volver a probar la integracion.';
 setError(message);
 setSummary((current) => ({ ...current, status: 'error', lastError: message }));
 } finally {
 setIsBusy(false);
 }
 }

 async function handleDisconnect() {
 try {
 setIsBusy(true);
 setError(null);
 await requestApi<{ disconnected: boolean }>('/api/admin/integrations/airtable/connection', { method: 'DELETE' });
 await loadSummary(false);
 closeWizard();
 showToast({ title: 'Integracion desconectada', description: 'La app vuelve a usar variables de entorno o mocks.', tone: 'success' });
 startRefresh(() => {
 router.refresh();
 });
 } catch (requestError) {
 setError(requestError instanceof Error ? requestError.message : 'No pudimos desconectar la integracion.');
 } finally {
 setIsBusy(false);
 }
 }

 const tone = statusTone(summary.status);
 const selectedTables = {
 developments: tables.find((table) => table.name === tablesMapping.developments),
 lots: tables.find((table) => table.name === tablesMapping.lots),
 inquiries: tables.find((table) => table.name === tablesMapping.inquiries),
 };

 return (
 <section data-testid={'admin-airtable'} className={'space-y-6'}>
 <div className={'rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_70px_-48px_rgba(15,23,42,0.55)]'}>
 <div className={'flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'}>
 <div className={'max-w-2xl'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Integraciones</p>
 <div className={'mt-3 flex flex-wrap items-center gap-3'}>
 <h2 className={'text-3xl font-semibold text-slate-950'}>Conectar Airtable</h2>
 <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1', tone.tone)}>{tone.label}</span>
 </div>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>Vincula la base del cliente sin tocar codigo y sin exponer el token en el navegador.</p>
 </div>

 <div className={'flex flex-wrap gap-3'}>
 <button type={'button'} data-testid={'admin-airtable-open-wizard'} onClick={openWizard} className={'rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}>
 {summary.status === 'connected' || summary.status === 'error' ? 'Reconfigurar conexion' : 'Iniciar asistente'}
 </button>
 {summary.status !== 'not_connected' ? <button type={'button'} data-testid={'admin-airtable-retest'} onClick={handleRetestConnection} disabled={isBusy} className={'rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60'}>Probar de nuevo</button> : null}
 {summary.canDisconnect ? <button type={'button'} data-testid={'admin-airtable-disconnect'} onClick={handleDisconnect} disabled={isBusy} className={'rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60'}>Desconectar</button> : null}
 </div>
 </div>

 <div className={'mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'}>
 <SummaryBox label={'Fuente activa'} value={summary.source === 'saved' ? 'Conexion guardada desde admin' : summary.source === 'env' ? 'Variables de entorno' : 'Mocks locales'} />
 <SummaryBox label={'Base activa'} value={summary.baseName || 'Sin base seleccionada'} />
 <SummaryBox label={'Token'} value={summary.tokenMasked || 'No almacenado'} />
 <SummaryBox label={'Persistencia'} value={summary.isPersistent ? 'Archivo local del servidor' : 'Temporal para esta sesion'} />
 </div>

 <div className={'mt-4 grid gap-4 xl:grid-cols-3'}>
 <SummaryBox label={'Ultima prueba'} value={formatDate(summary.lastTestAt)} />
 <SummaryBox label={'Ultima sincronizacion'} value={formatDate(summary.lastSyncAt)} />
 <SummaryBox label={'Ultimo error'} value={summary.lastError || 'Sin errores recientes'} />
 </div>

 {!summary.isPersistent ? <div className={'mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900'}>La configuracion esta en modo temporal. Define AIRTABLE_INTEGRATION_SECRET y permite persistir la carpeta .data para conservarla entre reinicios.</div> : null}
 </div>

 {isLoadingSummary ? <div className={'rounded-[2rem] border border-dashed border-slate-200 bg-white/75 p-8 text-sm text-slate-500'}>Cargando estado de la integracion...</div> : null}

 {!isLoadingSummary && !isWizardOpen ? (
 <div data-testid={'airtable-connection-card'} className={'rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_70px_-48px_rgba(15,23,42,0.55)]'}>
 {summary.status === 'connected' ? (
 <div className={'grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'}>
 <div>
 <p className={'text-lg font-semibold text-slate-950'}>Conexion lista para usar</p>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>La web ya puede leer loteos, lotes y consultas desde Airtable. Si la conexion falla, el sistema mantiene el fallback a mocks.</p>
 <div className={'mt-5 flex flex-wrap gap-3 text-sm text-slate-600'}>
 <span className={'rounded-full bg-slate-100 px-3 py-1.5'}>{summary.mode === 'demo' ? 'Modo demo' : 'PAT real validado'}</span>
 <span className={'rounded-full bg-slate-100 px-3 py-1.5'}>{summary.tablesMapping?.developments || 'Sin tabla de loteos'}</span>
 <span className={'rounded-full bg-slate-100 px-3 py-1.5'}>{summary.tablesMapping?.lots || 'Sin tabla de lotes'}</span>
 <span className={'rounded-full bg-slate-100 px-3 py-1.5'}>{summary.tablesMapping?.inquiries || 'Sin tabla de consultas'}</span>
 </div>
 </div>
 <div className={'rounded-[1.5rem] border border-sky-100 bg-[linear-gradient(145deg,#ffffff,#f5fbff)] p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.16)]'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-sky-700'}>Resumen rapido</p>
 <p className={'mt-3 text-2xl font-semibold'}>{summary.baseName || 'Base conectada'}</p>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>{summary.lastError ? 'Hay un error reciente para revisar.' : 'La conexion esta sana y lista para usarse como fuente principal.'}</p>
 </div>
 </div>
 ) : summary.status === 'error' ? (
 <div>
 <p className={'text-lg font-semibold text-slate-950'}>Hay un problema con la integracion guardada</p>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>{summary.lastError || 'No pudimos leer la base conectada. Puedes reconfigurarla desde este mismo panel.'}</p>
 </div>
 ) : (
 <div>
 <p className={'text-lg font-semibold text-slate-950'}>Todavia no hay una conexion guardada</p>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>El asistente te guia para validar el PAT, elegir la base correcta, mapear tablas y revisar registros reales antes de guardar.</p>
 </div>
 )}

 {preview ? <div className={'mt-6 grid gap-4 md:grid-cols-3'}><SummaryBox label={'Loteos encontrados'} value={String(preview.counts.developments)} /><SummaryBox label={'Lotes encontrados'} value={String(preview.counts.lots)} /><SummaryBox label={'Consultas encontradas'} value={String(preview.counts.inquiries)} /></div> : null}
 </div>
 ) : null}

 {isWizardOpen ? (
 <div data-testid={'airtable-wizard'} className={'rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_70px_-48px_rgba(15,23,42,0.55)]'}>
 <div className={'flex flex-col gap-5'}>
 <div className={'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Asistente Airtable</p>
 <h3 className={'mt-2 text-2xl font-semibold text-slate-950'}>Conexion guiada paso a paso</h3>
 <p className={'mt-2 text-sm leading-7 text-slate-600'}>El token solo se usa del lado servidor. En pantalla ves una version enmascarada y el avance del flujo.</p>
 </div>
 <button type={'button'} onClick={closeWizard} className={'self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950'}>Cerrar</button>
 </div>

 <StepRail step={step} />

 {error ? <div className={'rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800'}>{error}</div> : null}

 {step === 1 ? <section data-testid={'airtable-step-1'} className={'grid gap-5 xl:grid-cols-[1.15fr_0.85fr]'}><div className={'rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5'}><p className={'text-sm font-semibold text-slate-900'}>Que resuelve esta conexion</p><div className={'mt-4 space-y-3 text-sm leading-7 text-slate-600'}><p>La web podra leer loteos, lotes y consultas desde Airtable sin que el cliente toque codigo.</p><p>Primero validamos acceso, despues base, tablas, campos y al final mostramos una preview real.</p><p>Si Airtable no esta disponible, la app conserva mocks para no romper la experiencia.</p></div></div><div className={'rounded-[1.6rem] border border-sky-100 bg-[linear-gradient(145deg,#ffffff,#f3f9ff)] p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.16)]'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700'}>Incluye</p><div className={'mt-4 space-y-3 text-sm leading-7 text-slate-600'}><p>Deteccion automatica de bases y tablas.</p><p>Mapping manual si hace falta.</p><p>Vista previa real antes de guardar.</p><p>Persistencia del lado servidor con token cifrado.</p></div></div></section> : null}

 {step === 2 ? <section data-testid={'airtable-step-2'} className={'grid gap-5 xl:grid-cols-[1fr_1fr]'}><div className={'rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5'}><p className={'text-sm font-semibold text-slate-900'}>Como crear el token PAT</p><ol className={'mt-4 space-y-3 text-sm leading-7 text-slate-600'}><li>1. Abre la seccion de tokens personales en Airtable.</li><li>2. Crea un PAT con acceso a la base que quieras conectar.</li><li>3. Habilita permisos de lectura de esquema y lectura/escritura de registros.</li><li>4. Copia el token y vuelve a este panel.</li></ol></div><div className={'rounded-[1.6rem] border border-sky-200 bg-sky-50 p-5'}><p className={'text-sm font-semibold text-slate-900'}>Scopes sugeridos</p><div className={'mt-4 flex flex-wrap gap-2'}><span className={'rounded-full bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-sky-200'}>schema.bases:read</span><span className={'rounded-full bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-sky-200'}>data.records:read</span><span className={'rounded-full bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-sky-200'}>data.records:write</span></div><p className={'mt-4 text-sm leading-7 text-slate-600'}>Si todavia no tienes credenciales, puedes recorrer el flujo completo con el demo guiado.</p></div></section> : null}

 {step === 3 ? <section data-testid={'airtable-step-3'} className={'grid gap-5 xl:grid-cols-[1.1fr_0.9fr]'}><div className={'rounded-[1.6rem] border border-slate-200 bg-white p-5'}><label className={'space-y-2'}><span className={'text-sm font-medium text-slate-700'}>Personal Access Token de Airtable</span><textarea data-testid={'airtable-pat-input'} value={pat} onChange={(event) => setPat(event.target.value)} rows={5} placeholder={'Pega aqui el PAT del cliente'} className={'w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100'} /></label><p className={'mt-3 text-sm text-slate-500'}>El token se envia una sola vez al backend para validacion y guardado cifrado.</p><div className={'mt-5 flex flex-wrap gap-3'}><button type={'button'} data-testid={'airtable-validate-token'} onClick={() => handleValidate('live')} disabled={isBusy} className={'rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60'}>Validar acceso</button><button type={'button'} data-testid={'airtable-use-demo'} onClick={() => handleValidate('demo')} disabled={isBusy} className={'rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60'}>Usar demo guiado</button></div></div><div className={'rounded-[1.6rem] bg-slate-50 p-5'}><p className={'text-sm font-semibold text-slate-900'}>Buenas practicas</p><div className={'mt-4 space-y-3 text-sm leading-7 text-slate-600'}><p>Primero valida el PAT y despues elige la base accesible.</p><p>El demo sirve para presentar el flujo sin bloquear la reunion comercial.</p><p>Una vez guardado, el token queda enmascarado en la interfaz.</p></div></div></section> : null}

 {step === 4 ? <section data-testid={'airtable-step-4'} className={'space-y-5'}><div className={'grid gap-4 md:grid-cols-3'}><SummaryBox label={'Modo'} value={mode === 'demo' ? 'Demo guiado' : 'PAT validado'} /><SummaryBox label={'Token'} value={tokenMasked || 'En validacion'} /><SummaryBox label={'Bases accesibles'} value={String(bases.length)} /></div><div className={'grid gap-4 lg:grid-cols-2'}>{bases.map((base) => { const active = base.id === selectedBaseId; return <button key={base.id} type={'button'} data-testid={'airtable-base-option-' + base.id} onClick={() => { setSelectedBaseId(base.id); setSelectedBaseName(base.name); }} className={cn('rounded-[1.6rem] border p-5 text-left transition', active ? 'border-sky-300 bg-sky-50 shadow-[0_18px_40px_-30px_rgba(37,99,235,0.35)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50')}><p className={'text-lg font-semibold text-slate-950'}>{base.name}</p><p className={'mt-2 text-sm text-slate-500'}>{base.permissionLevel ? 'Permiso: ' + base.permissionLevel : 'Permiso disponible'}</p></button>; })}</div></section> : null}

 {step === 5 ? <section data-testid={'airtable-step-5'} className={'grid gap-4 xl:grid-cols-3'}>{(['developments', 'lots', 'inquiries'] as Array<keyof AirtableTableMapping>).map((section) => <label key={section} className={'space-y-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}><span className={'text-sm font-semibold text-slate-800'}>{tableLabels[section]}</span><select data-testid={'airtable-table-select-' + section} value={tablesMapping[section] || ''} onChange={(event) => handleTableChange(section, event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100'}><option value={''}>Seleccionar tabla</option>{tables.map((table) => <option key={table.id} value={table.name}>{table.name}</option>)}</select><p className={'text-sm text-slate-500'}>{tablesMapping[section] ? 'Puedes cambiarla manualmente si hace falta.' : 'No la detectamos automaticamente. Elige la correcta.'}</p></label>)}</section> : null}

 {step === 6 ? <section data-testid={'airtable-step-6'} className={'space-y-5'}><FieldMappingSection section={'developments'} table={selectedTables.developments} mapping={fieldMapping.developments} onChange={(fieldKey, value) => handleFieldChange('developments', fieldKey, value)} /><FieldMappingSection section={'lots'} table={selectedTables.lots} mapping={fieldMapping.lots} onChange={(fieldKey, value) => handleFieldChange('lots', fieldKey, value)} /><FieldMappingSection section={'inquiries'} table={selectedTables.inquiries} mapping={fieldMapping.inquiries} onChange={(fieldKey, value) => handleFieldChange('inquiries', fieldKey, value)} /></section> : null}

 {step === 7 && preview ? <section data-testid={'airtable-step-7'} className={'space-y-5'}><div className={'grid gap-4 md:grid-cols-3'}><SummaryBox label={'Loteos encontrados'} value={String(preview.counts.developments)} /><SummaryBox label={'Lotes encontrados'} value={String(preview.counts.lots)} /><SummaryBox label={'Consultas encontradas'} value={String(preview.counts.inquiries)} /></div>{preview.warnings.length ? <div className={'rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900'}>{preview.warnings.join(' ')}</div> : null}<div className={'grid gap-4 xl:grid-cols-3'}><PreviewCard title={'Loteos'} rows={preview.examples.developments} /><PreviewCard title={'Lotes'} rows={preview.examples.lots} /><PreviewCard title={'Consultas'} rows={preview.examples.inquiries} /></div></section> : null}

 {step === 8 ? <section data-testid={'airtable-step-8'} className={'grid gap-5 xl:grid-cols-[1.15fr_0.85fr]'}><div className={'rounded-[1.7rem] border border-emerald-200 bg-emerald-50 p-5'}><p className={'text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700'}>Conexion guardada</p><h4 className={'mt-3 text-2xl font-semibold text-slate-950'}>Airtable ya esta listo para alimentar la web</h4><p className={'mt-3 text-sm leading-7 text-slate-700'}>Se guardo la base seleccionada, el mapping de tablas y campos, y la app refresca sus datos automaticamente.</p><div className={'mt-5 grid gap-4 md:grid-cols-2'}><SummaryBox label={'Base'} value={selectedBaseName || summary.baseName || 'Base conectada'} /><SummaryBox label={'Token'} value={summary.tokenMasked || tokenMasked || 'PAT guardado'} /></div></div><div className={'rounded-[1.7rem] border border-emerald-100 bg-[linear-gradient(145deg,#ffffff,#f2fbf8)] p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.16)]'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700'}>Siguiente paso</p><p className={'mt-3 text-xl font-semibold'}>Validar la navegacion publica con QA visual</p><p className={'mt-3 text-sm leading-7 text-slate-600'}>Puedes volver al panel o seguir comprobando Home, loteos y admin con Playwright.</p></div></section> : null}

 <div className={'flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between'}>
 <div className={'text-sm text-slate-500'}>{isBusy || isRefreshing ? 'Procesando la integracion...' : 'Paso ' + step + ' de 8'}</div>
 <div className={'flex flex-wrap gap-3'}>
 {step > 1 && step < 8 ? <button type={'button'} onClick={() => { setError(null); setStep((step - 1) as WizardStep); }} className={'rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>Volver</button> : null}
 {step === 1 ? <button type={'button'} onClick={() => setStep(2)} className={'rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}>Continuar</button> : null}
 {step === 2 ? <button type={'button'} onClick={() => setStep(3)} className={'rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}>Ya tengo el token</button> : null}
 {step === 4 ? <button type={'button'} data-testid={'airtable-next-from-base'} onClick={handleLoadSchema} disabled={isBusy || !selectedBaseId} className={'rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d] disabled:cursor-not-allowed disabled:opacity-60'}>Continuar con tablas</button> : null}
 {step === 5 ? <button type={'button'} data-testid={'airtable-next-from-tables'} onClick={() => { setError(null); setStep(6); }} disabled={!tablesMapping.developments || !tablesMapping.lots || !tablesMapping.inquiries} className={'rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d] disabled:cursor-not-allowed disabled:opacity-60'}>Continuar con campos</button> : null}
 {step === 6 ? <button type={'button'} data-testid={'airtable-test-mapping'} onClick={handleTestMapping} disabled={isBusy} className={'rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60'}>Ver preview real</button> : null}
 {step === 7 ? <button type={'button'} data-testid={'airtable-save-connection'} onClick={handleSaveConnection} disabled={isBusy} className={'rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60'}>Guardar conexion</button> : null}
 {step === 8 ? <button type={'button'} data-testid={'airtable-close-success'} onClick={closeWizard} className={'rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}>Volver a integraciones</button> : null}
 </div>
 </div>
 </div>
 </div>
 ) : null}
 </section>
 );
}
