'use client';

import Link from 'next/link';

import { Hero, LoteoCard } from '@/components/loteos-ui';
import { PropertyCard } from '@/components/properties-ui';
import { useAppData } from '@/components/providers';

export function HomePage() {
 const { developments, properties } = useAppData();
 const featuredProperties = properties.filter((property) => property.featured && property.availability !== 'oculta').slice(0, 3);

 return (
 <div data-testid={'home-page'} className={'min-w-0 space-y-12'}>
 <Hero developments={developments} />

 <section className={'space-y-6'}>
 <div className={'flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Loteos destacados</p>
 <h2 className={'mt-2 text-3xl font-semibold text-slate-950'}>Disponibilidad ordenada para presentar, filtrar y consultar.</h2>
 </div>
 <Link href={'/loteos'} className={'inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>Ver todos los loteos</Link>
 </div>

 <div data-testid={'featured-developments'} className={'grid gap-6 md:grid-cols-2 xl:grid-cols-3'}>
 {developments.map((development) => (<LoteoCard key={development.slug} development={development} />))}
 </div>
 </section>

 {featuredProperties.length > 0 ? (
 <section className={'space-y-6'}>
 <div className={'flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Propiedades destacadas</p>
 <h2 className={'mt-2 text-3xl font-semibold text-slate-950'}>Casas, departamentos y cabanas listas para presentar en grilla.</h2>
 </div>
 <Link href={'/propiedades'} className={'inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>Ver propiedades</Link>
 </div>

 <div data-testid={'featured-properties'} className={'grid gap-6 md:grid-cols-2 xl:grid-cols-3'}>
 {featuredProperties.map((property) => (
 <PropertyCard key={property.id} property={property} href={'/propiedades?propiedad=' + property.slug} />
 ))}
 </div>
 </section>
 ) : null}

 <section className={'grid gap-6 lg:grid-cols-[0.95fr_1.05fr]'}>
 <article className={'rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_70px_-48px_rgba(15,23,42,0.3)]'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Como se usa</p>
 <h3 className={'mt-3 text-2xl font-semibold text-slate-950'}>Un flujo simple para operacion interna y presentacion comercial.</h3>
 <div className={'mt-6 space-y-4 text-sm leading-7 text-slate-600'}>
 <div className={'rounded-2xl bg-slate-50 px-4 py-4'}>1. Elegi un loteo y revisa la disponibilidad en modo mapa o lista.</div>
 <div className={'rounded-2xl bg-slate-50 px-4 py-4'}>2. Toca un lote para abrir detalle, estado, superficie, anticipo y cuotas.</div>
 <div className={'rounded-2xl bg-slate-50 px-4 py-4'}>3. Captura consultas o alertas desde el formulario y deriva a WhatsApp con mensaje precargado.</div>
 </div>
 </article>

 <article className={'rounded-[2rem] border border-sky-100 bg-[linear-gradient(145deg,#ffffff,#f6fbff)] p-6 shadow-[0_36px_80px_-56px_rgba(15,23,42,0.22)]'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'}>Valor del mock</p>
 <h3 className={'mt-3 text-2xl font-semibold text-slate-950'}>Pensado para mostrar rapido que lotes siguen activos y disparar la consulta correcta.</h3>
 <p className={'mt-4 max-w-xl text-sm leading-7 text-slate-600'}>La propuesta combina una landing sobria, filtros utiles, plano interactivo, alertas comerciales y un panel admin creible. Todo comparte datos locales para que la demo se sienta consistente de punta a punta.</p>
 <div className={'mt-8 flex flex-wrap gap-3'}>
 <span className={'rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800'}>Responsive real</span>
 <span className={'rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800'}>Mapa interactivo</span>
 <span className={'rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800'}>Alertas comerciales</span>
 <span className={'rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700'}>Admin visual</span>
 </div>
 </article>
 </section>
 </div>
 );
}
