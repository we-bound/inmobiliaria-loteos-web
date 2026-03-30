'use client';
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { InquiryForm } from '@/components/lot-interactions';
import {
 cn,
 formatArea,
 formatCurrency,
 formatPropertyAvailability,
 propertyAvailabilityMeta,
 propertyOperationMeta,
 propertyTypeMeta,
} from '@/lib/format';
import { buildPropertyWhatsAppLink } from '@/lib/whatsapp';
import { Property, PropertyOperation } from '@/types';

function propertyPriceLabel(property: Property) {
 if (!property.showPrice || typeof property.price !== 'number') {
 return 'Consultar valor';
 }

 return formatCurrency(property.price, property.currency || 'ARS');
}

function primaryImage(property: Property) {
 return property.images.find((image) => image.isCover) || property.images[0];
}

export function PropertyOperationBadge({ operation }: { operation: PropertyOperation }) {
 return (
 <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', propertyOperationMeta[operation].tone)}>
 {propertyOperationMeta[operation].label}
 </span>
 );
}

export function PropertyStatusBadge({ property }: { property: Property }) {
 return (
 <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', propertyAvailabilityMeta[property.availability].tone)}>
 {formatPropertyAvailability(property)}
 </span>
 );
}

export function PropertyFilters(props: {
 search: string;
 operation: string;
 type: string;
 location: string;
 locations: string[];
 onSearch: (value: string) => void;
 onOperation: (value: string) => void;
 onType: (value: string) => void;
 onLocation: (value: string) => void;
}) {
 return (
 <div data-testid={'properties-filters'} className={'grid gap-4 rounded-[2rem] border border-white/90 bg-white/95 p-5 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.24)] md:grid-cols-2 xl:grid-cols-4'}>
 <label className={'min-w-0 space-y-2'}>
 <span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Buscador</span>
 <input data-testid={'properties-filter-search'} value={props.search} onChange={(event) => props.onSearch(event.target.value)} placeholder={'Buscar por título o ubicación'} className={'w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white'} />
 </label>
 <label className={'min-w-0 space-y-2'}>
 <span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Operación</span>
 <select data-testid={'properties-filter-operation'} value={props.operation} onChange={(event) => props.onOperation(event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'all'}>Alquiler y venta</option>
 <option value={'alquiler'}>Alquiler</option>
 <option value={'venta'}>Venta</option>
 </select>
 </label>
 <label className={'min-w-0 space-y-2'}>
 <span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Tipo</span>
 <select data-testid={'properties-filter-type'} value={props.type} onChange={(event) => props.onType(event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'all'}>Todos los tipos</option>
 <option value={'casa'}>Casa</option>
 <option value={'departamento'}>Departamento</option>
 <option value={'cabana'}>Cabaña</option>
 </select>
 </label>
 <label className={'min-w-0 space-y-2'}>
 <span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>Ubicación</span>
 <select data-testid={'properties-filter-location'} value={props.location} onChange={(event) => props.onLocation(event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'all'}>Todas</option>
 {props.locations.map((item) => <option key={item} value={item}>{item}</option>)}
 </select>
 </label>
 </div>
 );
}

export function PropertyCard(props: {
 property: Property;
 onOpen?: () => void;
 href?: string;
}) {
 const image = primaryImage(props.property);

 return (
 <article data-testid={'property-card-' + props.property.slug} className={'group flex h-full min-w-0 flex-col overflow-hidden rounded-[2rem] border border-white/90 bg-white shadow-[0_30px_70px_-48px_rgba(15,23,42,0.24)] transition hover:-translate-y-1 hover:shadow-[0_38px_82px_-50px_rgba(15,23,42,0.26)]'}>
 <div className={'relative aspect-[4/3] overflow-hidden bg-slate-100'}>
 <img src={image?.url} alt={image?.alt || props.property.title} className={'h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]'} />
 <div className={'absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_40%,rgba(15,23,42,0.12))]'} />
 <div className={'absolute inset-x-4 top-4 flex flex-wrap gap-2'}>
 <PropertyOperationBadge operation={props.property.operation} />
 <PropertyStatusBadge property={props.property} />
 </div>
 </div>

 <div className={'flex flex-1 flex-col gap-5 p-6'}>
 <div className={'space-y-3'}>
 <div className={'flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>
 <span>{propertyTypeMeta[props.property.type].label}</span>
 <span className={'h-1 w-1 rounded-full bg-slate-300'} />
 <span>{props.property.location}</span>
 </div>
 <h3 className={'text-[1.75rem] font-semibold leading-tight text-slate-950'}>{props.property.title}</h3>
 <p className={'text-sm leading-7 text-slate-600'}>{props.property.shortDescription}</p>
 </div>

 <div className={'grid grid-cols-2 gap-3 text-sm text-slate-600'}>
 <div className={'rounded-[1.35rem] bg-slate-50 px-4 py-4'}>
 <p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Superficie</p>
 <p className={'mt-2 font-semibold text-slate-950'}>{formatArea(props.property.surfaceM2)}</p>
 </div>
 <div className={'rounded-[1.35rem] bg-slate-50 px-4 py-4'}>
 <p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>{props.property.showPrice ? 'Precio' : 'Valor'}</p>
 <p className={'mt-2 font-semibold text-slate-950'}>{propertyPriceLabel(props.property)}</p>
 </div>
 </div>

 <div className={'flex flex-wrap gap-2 text-sm text-slate-600'}>
 {typeof props.property.bedrooms === 'number' ? <span className={'rounded-full bg-slate-100 px-3 py-1'}>{props.property.bedrooms} dorm.</span> : null}
 {typeof props.property.bathrooms === 'number' ? <span className={'rounded-full bg-slate-100 px-3 py-1'}>{props.property.bathrooms} baños</span> : null}
 {props.property.parking ? <span className={'rounded-full bg-slate-100 px-3 py-1'}>Cochera</span> : null}
 </div>

 <div className={'mt-auto grid gap-3 sm:grid-cols-2'}>
 {props.href ? (
 <Link
 href={props.href}
 data-testid={'property-open-' + props.property.slug}
 className={'inline-flex min-h-[3.35rem] items-center justify-center rounded-[1.4rem] bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}
 >
 Ver propiedad
 </Link>
 ) : (
 <button
 type={'button'}
 onClick={props.onOpen}
 data-testid={'property-open-' + props.property.slug}
 className={'inline-flex min-h-[3.35rem] items-center justify-center rounded-[1.4rem] bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}
 >
 Ver propiedad
 </button>
 )}
 <a
 data-testid={'property-whatsapp-' + props.property.slug}
 href={buildPropertyWhatsAppLink(props.property)}
 target={'_blank'}
 rel={'noopener noreferrer'}
 className={'inline-flex min-h-[3.35rem] items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}
 >
 Consultar por WhatsApp
 </a>
 </div>
 </div>
 </article>
 );
}

export function PropertyQuickViewModal(props: {
 property?: Property;
 open: boolean;
 onClose: () => void;
}) {
 const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
 const contactFormRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
 if (!props.open) {
 return undefined;
 }

 const previous = document.body.style.overflow;
 document.body.style.overflow = 'hidden';
 return () => {
 document.body.style.overflow = previous;
 };
 }, [props.open]);

 const resolvedImageId = props.property?.images.some((image) => image.id === selectedImageId)
 ? selectedImageId
 : (props.property ? primaryImage(props.property)?.id || null : null);

 const activeImage = useMemo(() => {
 if (!props.property) {
 return undefined;
 }

 return props.property.images.find((image) => image.id === resolvedImageId) || primaryImage(props.property);
 }, [props.property, resolvedImageId]);

 function scrollToContactForm() {
 if (!contactFormRef.current) {
 return;
 }

 contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
 const firstInput = contactFormRef.current.querySelector<HTMLInputElement>('input[data-testid="inquiry-name-input"]');
 firstInput?.focus();
 }

 if (!props.open || !props.property) {
 return null;
 }

 return (
 <div className={'fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm md:items-center md:p-6'}>
 <button aria-label={'Cerrar'} className={'absolute inset-0'} onClick={props.onClose} />
 <div data-testid={'property-quick-view'} className={'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-4 shadow-2xl sm:p-5 md:max-w-[1120px] md:rounded-[2rem] md:p-6 lg:p-7'}>
 <div className={'mb-5 flex items-start justify-between gap-4'}>
 <div className={'min-w-0'}>
 <div className={'flex flex-wrap items-center gap-2'}>
 <PropertyOperationBadge operation={props.property.operation} />
 <PropertyStatusBadge property={props.property} />
 <span className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'}>{propertyTypeMeta[props.property.type].label}</span>
 </div>
 <h3 className={'mt-3 text-3xl font-semibold text-slate-950'}>{props.property.title}</h3>
 <p className={'mt-2 text-sm text-slate-500'}>{props.property.addressOrZone} - {props.property.location}</p>
 </div>
 <button data-testid={'property-quick-view-close'} onClick={props.onClose} className={'inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900'}>
 ×
 </button>
 </div>

 <div className={'grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px]'}>
 <div className={'space-y-4 self-start lg:sticky lg:top-0'}>
 <div className={'overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-100'}>
 <img src={activeImage?.url} alt={activeImage?.alt || props.property.title} className={'aspect-[4/3] w-full object-cover'} />
 </div>

 <div className={'grid grid-cols-3 gap-3'}>
 {props.property.images.map((image) => (
 <button
 key={image.id}
 type={'button'}
 data-testid={'property-thumbnail-' + image.id}
 onClick={() => setSelectedImageId(image.id)}
 className={cn('overflow-hidden rounded-[1.2rem] border bg-slate-100', image.id === activeImage?.id ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200')}
 >
 <img src={image.url} alt={image.alt} className={'aspect-[4/3] w-full object-cover'} />
 </button>
 ))}
 </div>
 </div>

 <div className={'space-y-5'}>
 <div className={'rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-sky-700'}>Ficha destacada</p>
 <p className={'mt-2 text-sm leading-7 text-slate-600'}>Información clara, datos relevantes y contacto inmediato en un solo recorrido visual.</p>
 </div>

 <div className={'rounded-[1.8rem] border border-sky-100 bg-[linear-gradient(180deg,#f7fbff,#ffffff)] p-5 shadow-[0_20px_45px_-36px_rgba(37,99,235,0.28)]'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>{props.property.showPrice ? 'Precio comercial' : 'Valor referencial'}</p>
 <p className={'mt-3 text-3xl font-semibold text-slate-950'}>{propertyPriceLabel(props.property)}</p>
 <p className={'mt-3 text-sm leading-7 text-slate-600'}>{props.property.shortDescription}</p>
 </div>

 <div className={'grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2'}>
 <Info label={'Ubicación'} value={props.property.location} />
 <Info label={'Zona'} value={props.property.addressOrZone} />
 <Info label={'Superficie'} value={formatArea(props.property.surfaceM2)} />
 <Info label={'Cubiertos'} value={props.property.coveredM2 ? formatArea(props.property.coveredM2) : 'No informado'} />
 <Info label={'Dormitorios'} value={typeof props.property.bedrooms === 'number' ? String(props.property.bedrooms) : 'No informado'} />
 <Info label={'Baños'} value={typeof props.property.bathrooms === 'number' ? String(props.property.bathrooms) : 'No informado'} />
 </div>

 <div className={'rounded-[1.75rem] border border-slate-200 bg-white p-5'}>
 <p className={'text-sm leading-7 text-slate-600'}>{props.property.description}</p>
 </div>

 <div className={'grid gap-3 sm:grid-cols-2'}>
 <a
 data-testid={'property-modal-whatsapp'}
 href={buildPropertyWhatsAppLink(props.property)}
 target={'_blank'}
 rel={'noopener noreferrer'}
 className={'inline-flex min-h-[3.35rem] w-full items-center justify-center rounded-[1.4rem] bg-[#0f4c81] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}
 >
 Contactar por WhatsApp
 </a>
 <button
 type={'button'}
 data-testid={'property-modal-contact-request'}
 onClick={scrollToContactForm}
 className={'inline-flex min-h-[3.35rem] w-full items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}
 >
 Solicitar contacto
 </button>
 </div>

 <p className={'text-xs leading-6 text-slate-500'}>La segunda opción abre el formulario para que el equipo comercial responda por llamada, email o WhatsApp.</p>

 <div ref={contactFormRef} className={'rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5'}>
 <InquiryForm
 property={props.property}
 source={'propiedad'}
 submitLabel={'Solicitar contacto'}
 description={'Dejanos tus datos y te respondemos por llamada, email o WhatsApp con disponibilidad, condiciones y próximos pasos.'}
 showWhatsAppButton={false}
 />
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

function Info({ label, value }: { label: string; value: string }) {
 return (
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>{label}</p>
 <p className={'mt-2 text-sm font-semibold text-slate-900'}>{value}</p>
 </div>
 );
}
