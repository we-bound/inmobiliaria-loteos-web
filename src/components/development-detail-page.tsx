'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { InquiryForm, LotDetailSheet, SitePlanMap } from '@/components/lot-interactions';
import { StatusBadge, ViewToggle } from '@/components/loteos-ui';
import { useAppData } from '@/components/providers';
import { formatArea, formatCurrency } from '@/lib/format';
import { LotStatus } from '@/types';

const detailStatuses: Array<'all' | LotStatus> = ['all', 'disponible', 'consultado', 'reservado', 'vendido'];

function isDetailStatus(value: string | null): value is 'all' | LotStatus {
 return Boolean(value && detailStatuses.includes(value as 'all' | LotStatus));
}

export function DevelopmentDetailPage({ slug }: { slug: string }) {
 const { getDevelopmentBySlug, showToast } = useAppData();
 const router = useRouter();
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const development = getDevelopmentBySlug(slug);

 if (!development) {
 return (<div className={'rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center'}><h1 className={'text-2xl font-semibold text-slate-950'}>No encontramos ese loteo</h1><p className={'mt-3 text-slate-500'}>Podes volver al listado general y seguir navegando.</p><Link href={'/loteos'} className={'mt-6 inline-flex rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white'}>Volver a loteos</Link></div>);
 }

 const view = searchParams.get('vista') === 'lista' ? 'lista' : 'mapa';
 const statusFilter = isDetailStatus(searchParams.get('estado')) ? (searchParams.get('estado') as 'all' | LotStatus) : 'all';
 const selectedLotCode = searchParams.get('lote') || '';
 const selectedLot = development.lots.find((lot) => lot.lotCode === selectedLotCode);
 const filteredLots = development.lots.filter((lot) => statusFilter === 'all' || lot.status === statusFilter);
 const availableCount = development.lots.filter((lot) => lot.status === 'disponible').length;
 const preferredLot = selectedLot || development.lots.find((lot) => lot.status === 'disponible') || development.lots[0];

 function updateQuery(patch: Record<string, string | null>) {
 const params = new URLSearchParams(searchParams.toString());

 Object.entries(patch).forEach(([key, value]) => {
 if (!value || value === 'all') {
 params.delete(key);
 } else {
 params.set(key, value);
 }
 });

 const next = params.toString();
 router.replace(next ? pathname + '?' + next : pathname, { scroll: false });
 }

 async function copyCurrentView() {
 try {
 await navigator.clipboard.writeText(window.location.href);
 showToast({ title: 'Vista copiada', description: 'Ya puedes compartir este filtro con el cliente.', tone: 'success' });
 } catch {
 showToast({ title: 'No pudimos copiar el enlace', description: 'Puedes copiar la URL manualmente desde el navegador.', tone: 'error' });
 }
 }

 function openPreferredLot() {
 if (!preferredLot) return;
 updateQuery({ lote: preferredLot.lotCode });
 }

 const primaryLabel = preferredLot && (preferredLot.status === 'reservado' || preferredLot.status === 'vendido') ? 'Avisame si aparece uno similar' : 'Ver precio y cuotas';

 return (
 <div data-testid={'development-detail-page'} className={'mx-auto min-w-0 max-w-[1100px] space-y-5'}>
 <section data-testid={'development-access-bar'} className={'rounded-[1.9rem] border border-slate-200/80 bg-white/90 px-5 py-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.18)]'}>
 <div className={'flex flex-wrap items-center justify-between gap-4'}>
 <p className={'text-sm font-semibold uppercase tracking-[0.18em] text-slate-500'}>Acceso publico</p>
 <Link href={'/admin'} data-testid={'development-admin-link'} className={'inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>Admin</Link>
 </div>
 </section>

 <section data-testid={'development-summary-card'} className={'rounded-[2rem] border border-slate-200/80 bg-white px-5 py-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)] sm:px-6'}>
 <div className={'flex flex-col gap-5'}>
 <div className={'max-w-3xl'}>
 <p className={'text-sm text-slate-500'}>{development.location}</p>
 <h1 className={'mt-2 text-4xl font-semibold text-slate-950 sm:text-[2.7rem]'}>{development.name}</h1>
 <p className={'mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base'}>{development.heroDescription}</p>
 </div>
 <div className={'flex flex-wrap gap-2'}>
 <span className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'}>{development.generalStatus}</span>
 <span className={'rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'}>{availableCount} lotes disponibles</span>
 {development.amenities.slice(0, 3).map((item) => <span key={item} className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'}>{item}</span>)}
 </div>
 </div>
 </section>

 <section className={'sticky top-[4.5rem] z-20 sm:top-20'}>
 <div className={'rounded-[2rem] border border-sky-100 bg-white/95 p-4 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.24)] backdrop-blur sm:p-5'}>
 <div className={'grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]'}>
 <div className={'min-w-0 space-y-4'}>
 <div className={'flex flex-wrap items-center gap-3'}>
 <span className={'rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800'}>Resumen comercial</span>
 <span className={'text-sm text-slate-500'}>{filteredLots.length} lotes visibles en esta vista</span>
 </div>
 <div className={'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'}>
 <div className={'rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3'}><p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Disponibles</p><p className={'mt-2 text-lg font-semibold text-emerald-800'}>{availableCount}</p></div>
 <div className={'rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3'}><p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Estado general</p><p className={'mt-2 text-lg font-semibold text-slate-950'}>{development.generalStatus}</p></div>
 <div className={'rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3'}><p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Vista activa</p><p className={'mt-2 text-lg font-semibold text-slate-950'}>{view === 'mapa' ? 'Mapa interactivo' : 'Listado comercial'}</p></div>
 </div>

 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4'}>
 {selectedLot ? (<div className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}><div className={'min-w-0'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>Lote seleccionado</p><div className={'mt-2 flex flex-wrap items-center gap-2'}><p className={'text-lg font-semibold text-slate-950'}>Lote {selectedLot.number}</p><StatusBadge status={selectedLot.status} /></div><p className={'mt-2 text-sm text-slate-600'}>{selectedLot.block} - {selectedLot.street} - {formatArea(selectedLot.area)}</p></div><div className={'text-left sm:text-right'}><p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Precio referencial</p><p className={'mt-2 text-lg font-semibold text-slate-950'}>{formatCurrency(selectedLot.price, selectedLot.currency)}</p></div></div>) : (<div className={'min-w-0'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>Lote sugerido</p><p className={'mt-2 text-lg font-semibold text-slate-950'}>{preferredLot ? 'Lote ' + preferredLot.number : 'Selecciona un lote del plano o del listado'}</p><p className={'mt-2 text-sm text-slate-600'}>{preferredLot ? preferredLot.street + ' - ' + formatArea(preferredLot.area) : 'La vista se puede compartir con filtros activos.'}</p></div>)}
 </div>
 </div>

 <div className={'min-w-0 space-y-3'}>
 <div className={'grid gap-3 sm:grid-cols-2'}>
 <label className={'space-y-2'}><span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Estado</span><select data-testid={'detail-status-filter'} value={statusFilter} onChange={(event) => updateQuery({ estado: event.target.value, lote: null })} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}><option value={'all'}>Todos los estados</option><option value={'disponible'}>Disponible</option><option value={'consultado'}>Consultado</option><option value={'reservado'}>Reservado</option><option value={'vendido'}>Vendido</option></select></label>
 <div className={'space-y-2'}><span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Visualizacion</span><ViewToggle value={view} onChange={(nextView) => updateQuery({ vista: nextView })} /></div>
 </div>

 <div className={'flex flex-col gap-3 sm:flex-row'}>
 <button data-testid={'detail-primary-cta'} type={'button'} onClick={openPreferredLot} className={'inline-flex w-full items-center justify-center rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d] sm:w-auto'}>{primaryLabel}</button>
 <button data-testid={'detail-copy-view'} type={'button'} onClick={copyCurrentView} className={'inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 sm:w-auto'}>Copiar vista</button>
 </div>
 </div>
 </div>
 </div>
 </section>

 {view === 'mapa' ? <SitePlanMap development={development} filteredStatus={statusFilter} selectedLotId={selectedLot?.id} onSelectLot={(lot) => updateQuery({ lote: lot.lotCode })} /> : null}

 {view === 'lista' ? (
 <section data-testid={'lots-list-view'} className={'rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)]'}>
 <div className={'mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'}>
 <div>
 <h2 className={'text-xl font-semibold text-slate-950'}>Listado de lotes</h2>
 <p className={'text-sm text-slate-500'}>La vista respeta el mismo filtro y seleccion que el plano interactivo.</p>
 </div>
 <p className={'text-sm text-slate-500'}>{filteredLots.length} resultados</p>
 </div>

 <div className={'hidden overflow-x-auto lg:block'}>
 <table className={'w-full min-w-[860px] text-left text-sm'}>
 <thead><tr className={'border-b border-slate-200 text-slate-500'}><th className={'pb-3'}>Lote</th><th className={'pb-3'}>Manzana</th><th className={'pb-3'}>Calle</th><th className={'pb-3'}>Superficie</th><th className={'pb-3'}>Estado</th><th className={'pb-3'}>Accion</th></tr></thead>
 <tbody>{filteredLots.map((lot) => (<tr key={lot.id} className={'border-b border-slate-100'}><td className={'py-4 font-semibold text-slate-900'}>{lot.number}</td><td className={'py-4'}>{lot.block}</td><td className={'py-4'}>{lot.street}</td><td className={'py-4'}>{formatArea(lot.area)}</td><td className={'py-4'}><StatusBadge status={lot.status} /></td><td className={'py-4'}><button data-testid={'lot-list-detail-' + lot.lotCode} onClick={() => updateQuery({ lote: lot.lotCode })} className={'rounded-full bg-[#0f4c81] px-4 py-2 text-sm font-semibold text-white'}>{lot.status === 'reservado' || lot.status === 'vendido' ? 'Ver alerta' : 'Ver detalle'}</button></td></tr>))}</tbody>
 </table>
 </div>

 <div className={'grid gap-4 lg:hidden'}>
 {filteredLots.map((lot) => (<article key={lot.id} className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}><div className={'flex items-start justify-between gap-3'}><div><p className={'text-sm text-slate-500'}>Lote {lot.number}</p><p className={'mt-1 text-lg font-semibold text-slate-950'}>{lot.street}</p></div><StatusBadge status={lot.status} /></div><div className={'mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600'}><div><p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Manzana</p><p className={'mt-2 font-semibold text-slate-900'}>{lot.block}</p></div><div><p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Superficie</p><p className={'mt-2 font-semibold text-slate-900'}>{formatArea(lot.area)}</p></div><div><p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Precio</p><p className={'mt-2 font-semibold text-slate-900'}>{formatCurrency(lot.price, lot.currency)}</p></div><div><p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Accion</p><button data-testid={'lot-mobile-detail-' + lot.lotCode} onClick={() => updateQuery({ lote: lot.lotCode })} className={'mt-2 rounded-full bg-[#0f4c81] px-4 py-2 text-sm font-semibold text-white'}>{lot.status === 'reservado' || lot.status === 'vendido' ? 'Alerta' : 'Consultar'}</button></div></div></article>))}
 </div>
 </section>
 ) : null}

 {filteredLots.length === 0 ? (
 <section data-testid={'detail-empty-alert'} className={'rounded-[2rem] border border-amber-200 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)]'}>
 <div className={'grid gap-5 xl:grid-cols-[0.9fr_1.1fr]'}>
 <div className={'rounded-[1.7rem] border border-amber-100 bg-amber-50 p-5'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-amber-700'}>Sin resultados ahora</p><h2 className={'mt-3 text-2xl font-semibold text-slate-950'}>Activa una alerta y seguimos la busqueda por vos</h2><p className={'mt-3 text-sm leading-7 text-slate-700'}>Si hoy no hay lotes con ese filtro, deja tus datos y te avisamos cuando aparezca una opcion similar dentro de este loteo.</p></div>
 <div className={'rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5'}><InquiryForm development={development} source={'alerta'} submitLabel={'Recibir novedades'} description={'Te avisamos cuando aparezca disponibilidad compatible con este filtro.'} /></div>
 </div>
 </section>
 ) : null}

 <LotDetailSheet development={development} lot={selectedLot} open={Boolean(selectedLot)} onClose={() => updateQuery({ lote: null })} />
 </div>
 );
}
