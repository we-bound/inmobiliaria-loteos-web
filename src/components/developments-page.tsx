'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { InquiryForm } from '@/components/lot-interactions';
import { FilterBar, LoteoCard } from '@/components/loteos-ui';
import { useAppData } from '@/components/providers';

export function DevelopmentsPage() {
 const { developments } = useAppData();
 const pathname = usePathname();
 const router = useRouter();
 const searchParams = useSearchParams();
 const search = searchParams.get('q') || '';
 const location = searchParams.get('location') || 'all';
 const status = searchParams.get('status') || 'all';
 const surface = searchParams.get('surface') || 'all';

 function updateQuery(next: { q?: string; location?: string; status?: string; surface?: string }) {
 const params = new URLSearchParams(searchParams.toString());

 if (typeof next.q === 'string') {
 if (next.q) {
 params.set('q', next.q);
 } else {
 params.delete('q');
 }
 }

 if (typeof next.location === 'string') {
 if (next.location !== 'all') {
 params.set('location', next.location);
 } else {
 params.delete('location');
 }
 }

 if (typeof next.status === 'string') {
 if (next.status !== 'all') {
 params.set('status', next.status);
 } else {
 params.delete('status');
 }
 }

 if (typeof next.surface === 'string') {
 if (next.surface !== 'all') {
 params.set('surface', next.surface);
 } else {
 params.delete('surface');
 }
 }

 const query = params.toString();
 router.replace(query ? pathname + '?' + query : pathname, { scroll: false });
 }

 const locations = Array.from(new Set(developments.map((development) => development.location)));

 const filtered = useMemo(() => {
 return developments.filter((development) => {
 const matchesSearch = development.name.toLowerCase().includes(search.toLowerCase());
 const matchesLocation = location === 'all' || development.location === location;
 const matchesStatus = status === 'all' || development.lots.some((lot) => lot.status === status);

 const matchesSurface = surface === 'all' || development.lots.some((lot) => {
 if (surface === '300-320') return lot.area >= 300 && lot.area <= 320;
 if (surface === '321-340') return lot.area >= 321 && lot.area <= 340;
 return lot.area >= 341 && lot.area <= 380;
 });

 return matchesSearch && matchesLocation && matchesStatus && matchesSurface;
 });
 }, [developments, location, search, status, surface]);

 return (
 <div data-testid={'developments-page'} className={'min-w-0 space-y-8'}>
 <section className={'space-y-3'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Listado general</p>
 <h1 className={'text-4xl font-semibold text-slate-950'}>Loteos y desarrollos disponibles</h1>
 <p className={'max-w-3xl text-lg leading-8 text-slate-600'}>Filtrá por ubicación, estado y rango de superficie para encontrar rápido el desarrollo adecuado y compartir una vista concreta del listado.</p>
 </section>

 <FilterBar
 search={search}
 location={location}
 status={status}
 surface={surface}
 locations={locations}
 onSearch={(value) => updateQuery({ q: value })}
 onLocation={(value) => updateQuery({ location: value })}
 onStatus={(value) => updateQuery({ status: value })}
 onSurface={(value) => updateQuery({ surface: value })}
 />

 <section data-testid={'developments-grid'} className={'grid gap-6 md:grid-cols-2 xl:grid-cols-3'}>
 {filtered.map((development) => (<LoteoCard key={development.slug} development={development} />))}
 </section>

 {filtered.length === 0 ? (
 <div data-testid={'developments-empty'} className={'grid gap-6 rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-6 xl:grid-cols-[0.9fr_1.1fr]'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Sin coincidencias</p>
 <h2 className={'mt-3 text-2xl font-semibold text-slate-950'}>No encontramos loteos con esos filtros.</h2>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>Dejanos tus datos y te avisamos cuando aparezca una opción similar o cuando tengamos novedades comerciales que encajen con tu búsqueda.</p>
 </div>
 <div className={'rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5'}>
 <InquiryForm source={'alerta'} submitLabel={'Recibir alertas'} description={'Te avisamos cuando aparezcan loteos o lotes con características parecidas a esta búsqueda.'} />
 </div>
 </div>
 ) : null}
 </div>
 );
}
