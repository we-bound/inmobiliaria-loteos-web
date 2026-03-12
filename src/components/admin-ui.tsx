'use client';

import { formatArea, leadSourceMeta, statusMeta } from '@/lib/format';
import { Development, Lead, LotStatus } from '@/types';

export function AdminSidebar() {
 return (
 <aside data-testid={'admin-sidebar'} className={'rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)]'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'}>Panel comercial</p>
 <h2 className={'mt-3 text-2xl font-semibold text-slate-950'}>Administracion simple y clara</h2>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>Visualiza disponibilidad, condiciones comerciales, alertas y consultas desde una sola pantalla con lectura rapida para el equipo comercial.</p>
 <div className={'mt-6 space-y-3 text-sm text-slate-600'}>
 <div className={'rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3'}>Disponibilidad sincronizada con mapa, lista y detalle del lote.</div>
 <div className={'rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3'}>Condiciones editables para presentar precio, anticipo y cuotas.</div>
 <div className={'rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3'}>Alertas y leads visibles para seguimiento comercial inmediato.</div>
 </div>
 </aside>
 );
}

export function MetricsCards({ developments, leads }: { developments: Development[]; leads: Lead[] }) {
 const lots = developments.flatMap((development) => development.lots);
 const total = lots.length;
 const available = lots.filter((lot) => lot.status === 'disponible').length;
 const reserved = lots.filter((lot) => lot.status === 'reservado').length;
 const sold = lots.filter((lot) => lot.status === 'vendido').length;
 const alerts = leads.filter((lead) => lead.source === 'alerta').length;

 const items = [
 { label: 'Total de lotes', value: total, tone: 'text-slate-950', surface: 'border-slate-200 bg-white' },
 { label: 'Disponibles', value: available, tone: 'text-emerald-700', surface: 'border-emerald-100 bg-emerald-50/70' },
 { label: 'Reservados', value: reserved, tone: 'text-slate-700', surface: 'border-slate-200 bg-slate-50' },
 { label: 'Vendidos', value: sold, tone: 'text-rose-700', surface: 'border-rose-100 bg-rose-50/70' },
 { label: 'Alertas / consultas', value: leads.length + ' (' + alerts + ' alertas)', tone: 'text-sky-700', surface: 'border-sky-100 bg-sky-50/70' },
 ];

 return (
 <div data-testid={'admin-metrics'} className={'grid gap-4 sm:grid-cols-2 xl:grid-cols-5'}>
 {items.map((item) => (
 <article key={item.label} className={'rounded-[1.75rem] border p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] ' + item.surface}>
 <p className={'text-sm text-slate-500'}>{item.label}</p>
 <p className={'mt-3 text-3xl font-semibold ' + item.tone}>{item.value}</p>
 </article>
 ))}
 </div>
 );
}

export function LotsTable(props: { developments: Development[]; selectedDevelopment: string; selectedStatus: string; onChangeDevelopment: (value: string) => void; onChangeStatus: (value: string) => void; onUpdateLot: (developmentSlug: string, lotCode: string, patch: { status?: LotStatus; price?: number; downPayment?: number; installments?: number; installmentValue?: number }) => void; }) {
 const rows = props.developments
 .filter((development) => props.selectedDevelopment === 'all' || development.slug === props.selectedDevelopment)
 .flatMap((development) => development.lots.map((lot) => ({ development, lot })))
 .filter((row) => props.selectedStatus === 'all' || row.lot.status === props.selectedStatus);

 return (
 <section className={'min-w-0 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)]'}>
 <div className={'mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'}>
 <div>
 <h3 className={'text-xl font-semibold text-slate-950'}>Lotes</h3>
 <p className={'text-sm text-slate-500'}>Edicion visual en memoria para demostrar actualizacion de estados y condiciones sin friccion.</p>
 </div>
 <div className={'grid gap-3 sm:grid-cols-2'}>
 <select data-testid={'admin-filter-development'} value={props.selectedDevelopment} onChange={(event) => props.onChangeDevelopment(event.target.value)} className={'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'all'}>Todos los loteos</option>
 {props.developments.map((development) => <option key={development.slug} value={development.slug}>{development.name}</option>)}
 </select>
 <select data-testid={'admin-filter-status'} value={props.selectedStatus} onChange={(event) => props.onChangeStatus(event.target.value)} className={'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'all'}>Todos los estados</option>
 <option value={'disponible'}>Disponible</option>
 <option value={'consultado'}>Consultado</option>
 <option value={'reservado'}>Reservado</option>
 <option value={'vendido'}>Vendido</option>
 </select>
 </div>
 </div>

 <div className={'mb-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between'}>
 <span>{rows.length} lotes visibles con los filtros actuales.</span>
 <span>Los cambios impactan mapa, lista y detalle en esta sesion.</span>
 </div>

 <div className={'-mx-5 overflow-x-auto px-5'}>
 <table data-testid={'admin-lots-table'} className={'w-full min-w-[960px] text-left text-sm'}>
 <thead>
 <tr className={'border-b border-slate-200 text-slate-500'}>
 <th className={'pb-3'}>Loteo</th>
 <th className={'pb-3'}>Lote</th>
 <th className={'pb-3'}>Manzana</th>
 <th className={'pb-3'}>Superficie</th>
 <th className={'pb-3'}>Estado</th>
 <th className={'pb-3'}>Precio</th>
 <th className={'pb-3'}>Anticipo</th>
 <th className={'pb-3'}>Cuotas</th>
 <th className={'pb-3'}>Valor cuota</th>
 </tr>
 </thead>
 <tbody>
 {rows.map(({ development, lot }) => (
 <tr key={lot.id} data-testid={'admin-lot-row-' + lot.lotCode} className={'border-b border-slate-100 align-top'}>
 <td className={'py-4 font-medium text-slate-900'}>{development.name}</td>
 <td className={'py-4'}>{lot.number}</td>
 <td className={'py-4'}>{lot.block}</td>
 <td className={'py-4'}>{formatArea(lot.area)}</td>
 <td className={'py-4'}>
 <select value={lot.status} onChange={(event) => props.onUpdateLot(development.slug, lot.lotCode, { status: event.target.value as LotStatus })} className={'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ' + statusMeta[lot.status].tone}>
 <option value={'disponible'}>Disponible</option>
 <option value={'consultado'}>Consultado</option>
 <option value={'reservado'}>Reservado</option>
 <option value={'vendido'}>Vendido</option>
 </select>
 </td>
 <td className={'py-4'}><input type={'number'} value={lot.price} onChange={(event) => props.onUpdateLot(development.slug, lot.lotCode, { price: Number(event.target.value) })} className={'w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900'} /></td>
 <td className={'py-4'}><input type={'number'} value={lot.financing.downPayment} onChange={(event) => props.onUpdateLot(development.slug, lot.lotCode, { downPayment: Number(event.target.value) })} className={'w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900'} /></td>
 <td className={'py-4'}><input type={'number'} value={lot.financing.installments} onChange={(event) => props.onUpdateLot(development.slug, lot.lotCode, { installments: Number(event.target.value) })} className={'w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900'} /></td>
 <td className={'py-4'}><input type={'number'} value={lot.financing.installmentValue} onChange={(event) => props.onUpdateLot(development.slug, lot.lotCode, { installmentValue: Number(event.target.value) })} className={'w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900'} /></td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>
 );
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
 return (
 <section className={'min-w-0 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)]'}>
 <div className={'mb-5'}>
 <h3 className={'text-xl font-semibold text-slate-950'}>Leads y alertas</h3>
 <p className={'text-sm text-slate-500'}>Consultas publicas y alertas comerciales guardadas localmente para seguimiento del equipo.</p>
 </div>
 <div className={'-mx-5 overflow-x-auto px-5'}>
 <table data-testid={'admin-leads-table'} className={'w-full min-w-[760px] text-left text-sm'}>
 <thead>
 <tr className={'border-b border-slate-200 text-slate-500'}>
 <th className={'pb-3'}>Fecha</th>
 <th className={'pb-3'}>Nombre</th>
 <th className={'pb-3'}>Origen</th>
 <th className={'pb-3'}>Lote</th>
 <th className={'pb-3'}>Contacto</th>
 <th className={'pb-3'}>Estado</th>
 <th className={'pb-3'}>Mensaje</th>
 </tr>
 </thead>
 <tbody>
 {leads.map((lead) => (
 <tr key={lead.id} className={'border-b border-slate-100 align-top'}>
 <td className={'py-4 text-slate-500'}>{new Date(lead.createdAt).toLocaleDateString('es-AR')}</td>
 <td className={'py-4 font-medium text-slate-900'}>{lead.name}</td>
 <td className={'py-4'}><span className={'inline-flex rounded-full px-3 py-1 text-xs font-semibold ' + leadSourceMeta[lead.source].tone}>{leadSourceMeta[lead.source].label}</span></td>
 <td className={'py-4'}>{lead.lotLabel || 'Consulta general'}</td>
 <td className={'py-4'}><div>{lead.phone}</div><div className={'text-slate-500'}>{lead.email}</div></td>
 <td className={'py-4'}><span className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'}>{lead.status}</span></td>
 <td className={'py-4 text-slate-600'}>{lead.message}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>
 );
}
