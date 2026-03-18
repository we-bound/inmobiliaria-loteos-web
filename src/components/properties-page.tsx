'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { InquiryForm } from '@/components/lot-interactions';
import { PropertyCard, PropertyFilters, PropertyQuickViewModal } from '@/components/properties-ui';
import { useAppData } from '@/components/providers';

export function PropertiesPage() {
 const { properties } = useAppData();
 const pathname = usePathname();
 const router = useRouter();
 const searchParams = useSearchParams();
 const search = searchParams.get('q') || '';
 const operation = searchParams.get('operacion') || 'all';
 const type = searchParams.get('tipo') || 'all';
 const location = searchParams.get('ubicacion') || 'all';
 const selectedSlug = searchParams.get('propiedad') || '';

 const publicProperties = properties.filter((property) => property.availability !== 'oculta');
 const selectedProperty = publicProperties.find((property) => property.slug === selectedSlug);
 const locations = Array.from(new Set(publicProperties.map((property) => property.location)));

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

 const filtered = useMemo(() => {
 return publicProperties.filter((property) => {
 const haystack = [property.title, property.location, property.addressOrZone, property.shortDescription].join(' ').toLowerCase();
 const matchesSearch = haystack.includes(search.toLowerCase());
 const matchesOperation = operation === 'all' || property.operation === operation;
 const matchesType = type === 'all' || property.type === type;
 const matchesLocation = location === 'all' || property.location === location;

 return matchesSearch && matchesOperation && matchesType && matchesLocation;
 });
 }, [location, operation, publicProperties, search, type]);

 return (
 <div data-testid={'properties-page'} className={'min-w-0 space-y-8'}>
 <section className={'rounded-[2.2rem] border border-white/80 bg-[radial-gradient(circle_at_top_left,rgba(15,76,129,0.1),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_28%),linear-gradient(145deg,#ffffff,#f5f9fd)] px-6 py-8 shadow-[0_30px_70px_-48px_rgba(15,23,42,0.28)] sm:px-8'}>
 <div className={'grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'}>Catálogo de propiedades</p>
 <h1 className={'mt-3 text-4xl font-semibold text-slate-950 sm:text-5xl'}>Alquileres y ventas con lectura clara</h1>
 <p className={'mt-4 max-w-3xl text-lg leading-8 text-slate-600'}>Una selección de casas, departamentos y cabañas con ficha rápida, precio opcional y contacto inmediato para acompañar cada consulta comercial.</p>
 </div>
 <div className={'grid gap-3 sm:grid-cols-3'}>
 <div className={'rounded-[1.6rem] border border-white/90 bg-white/90 p-4 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.2)]'}>
 <p className={'text-sm text-slate-500'}>Publicadas</p>
 <p className={'mt-2 text-3xl font-semibold text-slate-950'}>{publicProperties.length}</p>
 </div>
 <div className={'rounded-[1.6rem] border border-sky-100 bg-sky-50/80 p-4 shadow-[0_20px_45px_-36px_rgba(14,165,233,0.24)]'}>
 <p className={'text-sm text-sky-700'}>En alquiler</p>
 <p className={'mt-2 text-3xl font-semibold text-sky-900'}>{publicProperties.filter((property) => property.operation === 'alquiler').length}</p>
 </div>
 <div className={'rounded-[1.6rem] border border-violet-100 bg-violet-50/80 p-4 shadow-[0_20px_45px_-36px_rgba(124,58,237,0.2)]'}>
 <p className={'text-sm text-violet-700'}>En venta</p>
 <p className={'mt-2 text-3xl font-semibold text-violet-900'}>{publicProperties.filter((property) => property.operation === 'venta').length}</p>
 </div>
 </div>
 </div>
 </section>

 <section data-testid={'properties-demo-guide'} className={'grid gap-4 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.18)] lg:grid-cols-3'}>
 <article className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-sky-700'}>Selección curada</p>
 <h2 className={'mt-2 text-lg font-semibold text-slate-950'}>Filtrá por operación, tipo y ubicación</h2>
 <p className={'mt-2 text-sm leading-7 text-slate-600'}>La grilla prioriza lectura rápida para encontrar oportunidades de alquiler y venta según cada búsqueda.</p>
 </article>
 <article className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-sky-700'}>Presentación flexible</p>
 <h2 className={'mt-2 text-lg font-semibold text-slate-950'}>Mostrá valor o derivá la consulta</h2>
 <p className={'mt-2 text-sm leading-7 text-slate-600'}>Cada propiedad puede publicar precio o invitar a consultar, manteniendo siempre una ficha prolija y clara.</p>
 </article>
 <article className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-sky-700'}>Contacto ágil</p>
 <h2 className={'mt-2 text-lg font-semibold text-slate-950'}>Convertí desde la misma ficha</h2>
 <p className={'mt-2 text-sm leading-7 text-slate-600'}>WhatsApp y solicitud de contacto conviven en un flujo simple para no perder oportunidades.</p>
 </article>
 </section>

 <PropertyFilters
 search={search}
 operation={operation}
 type={type}
 location={location}
 locations={locations}
 onSearch={(value) => updateQuery({ q: value })}
 onOperation={(value) => updateQuery({ operacion: value, propiedad: null })}
 onType={(value) => updateQuery({ tipo: value, propiedad: null })}
 onLocation={(value) => updateQuery({ ubicacion: value, propiedad: null })}
 />

 <section data-testid={'properties-grid'} className={'grid gap-6 md:grid-cols-2 xl:grid-cols-3'}>
 {filtered.map((property) => (
 <PropertyCard key={property.id} property={property} onOpen={() => updateQuery({ propiedad: property.slug })} />
 ))}
 </section>

 {filtered.length === 0 ? (
 <section data-testid={'properties-empty'} className={'grid gap-6 rounded-[2rem] border border-dashed border-slate-300 bg-white/95 p-6 xl:grid-cols-[0.9fr_1.1fr]'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Sin coincidencias</p>
 <h2 className={'mt-3 text-2xl font-semibold text-slate-950'}>No encontramos propiedades con esos filtros.</h2>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>Dejanos tus datos y te ayudamos a encontrar una opción similar para alquiler o venta.</p>
 </div>
 <div className={'rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5'}>
 <InquiryForm source={'propiedad'} submitLabel={'Quiero ayuda con una propiedad'} description={'Te respondemos con opciones similares y seguimiento comercial simple por WhatsApp, llamada o email.'} />
 </div>
 </section>
 ) : null}

 <PropertyQuickViewModal property={selectedProperty} open={Boolean(selectedProperty)} onClose={() => updateQuery({ propiedad: null })} />
 </div>
 );
}
