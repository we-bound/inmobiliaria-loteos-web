'use client';

import Link from 'next/link';

import { cn, formatArea, statusMeta } from '@/lib/format';
import { Development, LotStatus } from '@/types';

function availableCount(development: Development) {
 return development.lots.filter((lot) => lot.status === 'disponible').length;
}

export function StatusBadge({ status }: { status: LotStatus }) {
 return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusMeta[status].tone)}>{statusMeta[status].label}</span>;
}

export function Hero({ developments }: { developments: Development[] }) {
 const totalLots = developments.reduce((acc, development) => acc + development.lots.length, 0);
 const totalAvailable = developments.reduce((acc, development) => acc + availableCount(development), 0);

 return (
 <section data-testid={'home-hero'} className={'relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(135deg,#ffffff,#f6fafe)] px-6 py-8 shadow-[0_36px_80px_-56px_rgba(15,23,42,0.32)] sm:px-8 lg:px-10 lg:py-12'}>
 <div className={'grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center'}>
 <div className={'max-w-2xl'}>
 <p className={'mb-4 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-800'}>Disponibilidad clara y comercial</p>
 <h1 className={'max-w-xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl'}>Encontra tu lote ideal con estados claros y consulta inmediata.</h1>
 <p className={'mt-5 max-w-xl text-lg leading-8 text-slate-600'}>Loteos con financiacion, disponibilidad actualizada y una experiencia pensada para que el cliente entienda rapido que esta disponible y como consultar.</p>
 <div className={'mt-8 flex flex-col gap-3 sm:flex-row'}>
 <Link href={'/loteos'} data-testid={'home-cta-loteos'} className={'inline-flex items-center justify-center rounded-full bg-[#0f4c81] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}>Ver loteos</Link>
 <a data-testid={'home-cta-whatsapp'} href={'https://wa.me/5493515550101?text=Hola%2C%20quiero%20ver%20loteos%20disponibles.'} target={'_blank'} rel={'noopener noreferrer'} className={'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>Consultar por WhatsApp</a>
 </div>
 </div>

 <div className={'grid gap-4 sm:grid-cols-3 lg:grid-cols-1'}>
 <div className={'rounded-[1.75rem] border border-white/90 bg-white/95 p-5 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.2)]'}><p className={'text-sm text-slate-500'}>Loteos activos</p><p className={'mt-2 text-3xl font-semibold text-slate-950'}>{developments.length}</p></div>
 <div className={'rounded-[1.75rem] border border-white/90 bg-white/95 p-5 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.2)]'}><p className={'text-sm text-slate-500'}>Lotes relevados</p><p className={'mt-2 text-3xl font-semibold text-slate-950'}>{totalLots}</p></div>
 <div className={'rounded-[1.75rem] border border-emerald-100 bg-emerald-50/80 p-5 shadow-[0_24px_50px_-40px_rgba(16,185,129,0.25)]'}><p className={'text-sm text-emerald-700'}>Disponibles hoy</p><p className={'mt-2 text-3xl font-semibold text-emerald-800'}>{totalAvailable}</p></div>
 </div>
 </div>
 </section>
 );
}

export function LoteoCard({ development }: { development: Development }) {
 const count = availableCount(development);

 return (
 <article data-testid={'development-card-' + development.slug} className={'group min-w-0 overflow-hidden rounded-[2rem] border border-white/90 bg-white shadow-[0_30px_70px_-48px_rgba(15,23,42,0.25)] transition hover:-translate-y-1 hover:shadow-[0_38px_82px_-50px_rgba(15,23,42,0.28)]'}>
 <div className={'relative h-52 overflow-hidden bg-gradient-to-br ' + development.coverTheme}>
 <div className={'absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_32%)]'} />
 <div className={'absolute bottom-5 left-5 right-5 rounded-[1.6rem] border border-white/80 bg-white/88 p-4 backdrop-blur-sm'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'}>{development.province}</p>
 <h3 className={'mt-2 text-2xl font-semibold text-slate-950'}>{development.name}</h3>
 <p className={'mt-1 text-sm text-slate-600'}>{development.location}</p>
 </div>
 </div>
 <div className={'space-y-5 p-6'}>
 <p className={'text-sm leading-7 text-slate-600'}>{development.shortDescription}</p>
 <div className={'grid grid-cols-2 gap-3 text-sm text-slate-600'}>
 <div className={'rounded-2xl bg-slate-50 px-4 py-3'}><p className={'text-xs uppercase tracking-[0.2em] text-slate-400'}>Disponibles</p><p className={'mt-2 text-lg font-semibold text-emerald-800'}>{count}</p></div>
 <div className={'rounded-2xl bg-slate-50 px-4 py-3'}><p className={'text-xs uppercase tracking-[0.2em] text-slate-400'}>Total lotes</p><p className={'mt-2 text-lg font-semibold text-slate-950'}>{development.lots.length}</p></div>
 </div>
 <div className={'flex flex-wrap gap-2'}>{development.amenities.map((item) => <span key={item} className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600'}>{item}</span>)}</div>
 <Link href={'/loteos/' + development.slug} data-testid={'development-card-link-' + development.slug} className={'inline-flex items-center justify-center rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}>Ver loteo</Link>
 </div>
 </article>
 );
}

export function FilterBar(props: { search: string; location: string; status: string; surface: string; locations: string[]; onSearch: (value: string) => void; onLocation: (value: string) => void; onStatus: (value: string) => void; onSurface: (value: string) => void; }) {
 return (<div data-testid={'developments-filters'} className={'grid gap-4 rounded-[2rem] border border-white/90 bg-white/95 p-5 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.24)] md:grid-cols-2 xl:grid-cols-4'}><label className={'min-w-0 space-y-2'}><span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Buscador</span><input data-testid={'filter-search'} value={props.search} onChange={(event) => props.onSearch(event.target.value)} placeholder={'Buscar por nombre'} className={'w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white'} /></label><label className={'min-w-0 space-y-2'}><span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Ubicacion</span><select data-testid={'filter-location'} value={props.location} onChange={(event) => props.onLocation(event.target.value)} className={'w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white'}><option value={'all'}>Todas</option>{props.locations.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className={'min-w-0 space-y-2'}><span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Disponibilidad</span><select data-testid={'filter-status'} value={props.status} onChange={(event) => props.onStatus(event.target.value)} className={'w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white'}><option value={'all'}>Todos los estados</option><option value={'disponible'}>Disponible</option><option value={'consultado'}>Consultado</option><option value={'reservado'}>Reservado</option><option value={'vendido'}>Vendido</option></select></label><label className={'min-w-0 space-y-2'}><span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Superficie</span><select data-testid={'filter-surface'} value={props.surface} onChange={(event) => props.onSurface(event.target.value)} className={'w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white'}><option value={'all'}>Cualquier rango</option><option value={'300-320'}>300 a 320 m2</option><option value={'321-340'}>321 a 340 m2</option><option value={'341-380'}>341 a 380 m2</option></select></label></div>);
}

export function ViewToggle({ value, onChange }: { value: 'mapa' | 'lista'; onChange: (value: 'mapa' | 'lista') => void; }) {
 return (<div data-testid={'view-toggle'} className={'inline-flex w-full rounded-[1.35rem] border border-slate-200 bg-slate-50 p-1.5 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.25)] sm:w-auto'}><button data-testid={'view-toggle-mapa'} onClick={() => onChange('mapa')} className={'flex-1 rounded-[1rem] px-5 py-2.5 text-sm font-semibold transition sm:flex-none ' + (value === 'mapa' ? 'bg-white text-slate-950 ring-1 ring-slate-200 shadow-[0_12px_22px_-18px_rgba(15,23,42,0.28)]' : 'text-slate-600 hover:text-slate-900')}>Mapa</button><button data-testid={'view-toggle-lista'} onClick={() => onChange('lista')} className={'flex-1 rounded-[1rem] px-5 py-2.5 text-sm font-semibold transition sm:flex-none ' + (value === 'lista' ? 'bg-white text-slate-950 ring-1 ring-slate-200 shadow-[0_12px_22px_-18px_rgba(15,23,42,0.28)]' : 'text-slate-600 hover:text-slate-900')}>Lista</button></div>);
}

export function DevelopmentStats({ development }: { development: Development }) {
 const available = development.lots.filter((lot) => lot.status === 'disponible').length;
 const averageArea = Math.round(development.lots.reduce((acc, lot) => acc + lot.area, 0) / development.lots.length);

 return (<div className={'grid gap-3 sm:grid-cols-3'}><div className={'rounded-3xl border border-slate-200 bg-white px-5 py-4'}><p className={'text-sm text-slate-500'}>Ubicacion</p><p className={'mt-2 font-semibold text-slate-950'}>{development.location}</p></div><div className={'rounded-3xl border border-emerald-100 bg-emerald-50/70 px-5 py-4'}><p className={'text-sm text-emerald-700'}>Disponibles</p><p className={'mt-2 font-semibold text-emerald-800'}>{available}</p></div><div className={'rounded-3xl border border-slate-200 bg-white px-5 py-4'}><p className={'text-sm text-slate-500'}>Superficie promedio</p><p className={'mt-2 font-semibold text-slate-950'}>{formatArea(averageArea)}</p></div></div>);
}
