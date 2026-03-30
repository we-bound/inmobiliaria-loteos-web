'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { mockDevelopments, mockLeads, mockProperties } from '@/data/mock-data';
import { Development, Lead, LeadInput, Lot, Property, PropertyImage, PropertyImageInput, PropertyUpsertInput, PropertyUpdateInput } from '@/types';

type ToastTone = 'success' | 'error';

interface ToastState {
 title: string;
 description: string;
 tone: ToastTone;
}

interface LeadSubmissionMeta {
 startedAt?: number;
 company?: string;
}

interface LotPatch {
 status?: Lot['status'];
 price?: number;
 financing?: Partial<Lot['financing']>;
 notes?: string;
}

interface ProvidersProps extends PropsWithChildren {
 initialDevelopments?: Development[];
 initialProperties?: Property[];
 initialLeads?: Lead[];
}

interface AppDataContextValue {
 developments: Development[];
 properties: Property[];
 leads: Lead[];
 showToast: (toast: ToastState) => void;
 getDevelopmentBySlug: (slug: string) => Development | undefined;
 getPropertyBySlug: (slug: string) => Property | undefined;
 submitLead: (input: LeadInput, meta?: LeadSubmissionMeta) => void;
 updateLot: (developmentSlug: string, lotCode: string, patch: LotPatch) => void;
 createProperty: (input: PropertyUpsertInput) => Promise<Property | null>;
 updateProperty: (propertyId: string, patch: PropertyUpdateInput) => Promise<Property | null>;
 deleteProperty: (propertyId: string) => Promise<boolean>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function patchLot(lot: Lot, patch: LotPatch): Lot {
 return {
 ...lot,
 ...(patch.status ? { status: patch.status } : {}),
 ...(typeof patch.price === 'number' ? { price: patch.price } : {}),
 ...(typeof patch.notes === 'string' ? { notes: patch.notes } : {}),
 ...(patch.financing ? { financing: { ...lot.financing, ...patch.financing } } : {}),
 };
}

function buildOptimisticLead(input: LeadInput, currentLength: number): Lead {
 return {
 id: globalThis.crypto?.randomUUID?.() || 'lead-' + (currentLength + 1),
 createdAt: new Date().toISOString(),
 status: 'nuevo',
 ...input,
 };
}

export function Providers({
 children,
 initialDevelopments = mockDevelopments,
 initialProperties = mockProperties,
 initialLeads = mockLeads,
}: ProvidersProps) {
 const [developments, setDevelopments] = useState(initialDevelopments);
 const [properties, setProperties] = useState(initialProperties);
 const [leads, setLeads] = useState(initialLeads);
 const [toast, setToast] = useState<ToastState | null>(null);

 useEffect(() => {
 setDevelopments(initialDevelopments);
 }, [initialDevelopments]);

 useEffect(() => {
 setProperties(initialProperties);
 }, [initialProperties]);

 useEffect(() => {
 setLeads(initialLeads);
 }, [initialLeads]);

 useEffect(() => {
 if (!toast) {
 return undefined;
 }

 const timeout = window.setTimeout(() => setToast(null), 3200);
 return () => window.clearTimeout(timeout);
 }, [toast]);

 const showToast = (nextToast: ToastState) => setToast(nextToast);

 const submitLead = (input: LeadInput, meta?: LeadSubmissionMeta) => {
 setLeads((current) => {
 const optimisticLead = buildOptimisticLead(input, current.length);
 return [optimisticLead, ...current];
 });

 if (input.source === 'lote' && input.developmentSlug && input.lotCode) {
 setDevelopments((current) =>
 current.map((development) => {
 if (development.slug !== input.developmentSlug) {
 return development;
 }

 return {
 ...development,
 lots: development.lots.map((lot) =>
 lot.lotCode === input.lotCode && lot.status === 'disponible' ? patchLot(lot, { status: 'consultado' }) : lot,
 ),
 };
 }),
 );
 }

 void fetch('/api/inquiries', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 credentials: 'same-origin',
 body: JSON.stringify({
 ...input,
 startedAt: meta?.startedAt,
 company: meta?.company || '',
 }),
 })
 .then(async (response) => {
 if (!response.ok) {
 throw new Error(await response.text());
 }
 })
 .catch((error) => {
 console.error('No se pudo sincronizar la consulta', error);
 });
 };

 const updateLot = (developmentSlug: string, lotCode: string, patch: LotPatch) => {
 setDevelopments((current) =>
 current.map((development) => {
 if (development.slug !== developmentSlug) {
 return development;
 }

 return {
 ...development,
 lots: development.lots.map((lot) => (lot.lotCode === lotCode ? patchLot(lot, patch) : lot)),
 };
 }),
 );

 const payload = {
 ...(patch.status ? { status: patch.status } : {}),
 ...(typeof patch.price === 'number' ? { price: patch.price } : {}),
 ...(typeof patch.notes === 'string' ? { notes: patch.notes } : {}),
 ...(typeof patch.financing?.downPayment === 'number' ? { downPayment: patch.financing.downPayment } : {}),
 ...(typeof patch.financing?.installments === 'number' ? { installmentsCount: patch.financing.installments } : {}),
 ...(typeof patch.financing?.installmentValue === 'number' ? { installmentValue: patch.financing.installmentValue } : {}),
 };

 void fetch('/api/admin/lots/' + encodeURIComponent(lotCode), {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 credentials: 'same-origin',
 body: JSON.stringify(payload),
 })
 .then(async (response) => {
 if (!response.ok) {
 throw new Error(await response.text());
 }
 })
 .catch((error) => {
 console.error('No se pudo sincronizar el lote', error);
 });
 };

 const createProperty = async (input: PropertyUpsertInput) => {
 const optimisticId = globalThis.crypto?.randomUUID?.() || 'property-' + Date.now();
 const optimisticImages: PropertyImage[] = input.images.map((image: PropertyImageInput, index) => ({
 id: image.id || optimisticId + '-image-' + (index + 1),
 url: image.url,
 alt: image.alt || input.title,
 isCover: Boolean(image.isCover),
 }));
 const coverIndex = optimisticImages.findIndex((image) => image.isCover);
 const normalizedImages = optimisticImages.length > 0
 ? optimisticImages.map((image, index) => ({ ...image, isCover: index === (coverIndex >= 0 ? coverIndex : 0) }))
 : [];
 const optimisticProperty: Property = {
 id: optimisticId,
 slug: input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
 title: input.title,
 type: input.type,
 operation: input.operation,
 availability: input.availability,
 location: input.location,
 province: input.province,
 addressOrZone: input.addressOrZone,
 shortDescription: input.shortDescription,
 description: input.description,
 surfaceM2: input.surfaceM2,
 ...(typeof input.coveredM2 === 'number' ? { coveredM2: input.coveredM2 } : {}),
 ...(typeof input.bedrooms === 'number' ? { bedrooms: input.bedrooms } : {}),
 ...(typeof input.bathrooms === 'number' ? { bathrooms: input.bathrooms } : {}),
 ...(typeof input.parking === 'boolean' ? { parking: input.parking } : {}),
 ...(typeof input.price === 'number' ? { price: input.price } : {}),
 ...(input.currency ? { currency: input.currency } : {}),
 showPrice: input.showPrice,
 featured: input.featured,
 images: normalizedImages,
 ...(input.whatsappMessage ? { whatsappMessage: input.whatsappMessage } : {}),
 };

 setProperties((current) => [optimisticProperty, ...current]);

 try {
 const response = await fetch('/api/admin/properties', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 credentials: 'same-origin',
 body: JSON.stringify(input),
 });

 if (!response.ok) {
 throw new Error(await response.text());
 }

 const payload = (await response.json()) as { data: Property };
 setProperties((current) => current.map((property) => (property.id === optimisticId ? payload.data : property)));
 return payload.data;
 } catch (error) {
 setProperties((current) => current.filter((property) => property.id !== optimisticId));
 console.error('No se pudo crear la propiedad', error);
 return null;
 }
 };

 const updateProperty = async (propertyId: string, patch: PropertyUpdateInput) => {
 const previousProperty = properties.find((property) => property.id === propertyId);

 if (!previousProperty) {
 return null;
 }

 const nextImages: PropertyImage[] = patch.images
 ? patch.images.map((image, index) => ({
 id: image.id || previousProperty.id + '-image-' + (index + 1),
 url: image.url,
 alt: image.alt || patch.title || previousProperty.title,
 isCover: Boolean(image.isCover),
 }))
 : previousProperty.images;

 const coverIndex = nextImages.findIndex((image) => image.isCover);
 const normalizedImages = nextImages.length > 0
 ? nextImages.map((image, index) => ({ ...image, isCover: index === (coverIndex >= 0 ? coverIndex : 0) }))
 : [];
 const restPatch: Omit<PropertyUpdateInput, 'images'> = { ...patch };

 const optimisticProperty: Property = {
 ...previousProperty,
 ...restPatch,
 ...(patch.images ? { images: normalizedImages } : {}),
 };

 setProperties((current) => current.map((property) => (property.id === propertyId ? optimisticProperty : property)));

 try {
 const response = await fetch('/api/admin/properties/' + encodeURIComponent(propertyId), {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 credentials: 'same-origin',
 body: JSON.stringify(patch),
 });

 if (!response.ok) {
 throw new Error(await response.text());
 }

 const payload = (await response.json()) as { data: Property };
 setProperties((current) => current.map((property) => (property.id === propertyId ? payload.data : property)));
 return payload.data;
 } catch (error) {
 setProperties((current) => current.map((property) => (property.id === propertyId ? previousProperty : property)));
 console.error('No se pudo actualizar la propiedad', error);
 return null;
 }
 };

 const deleteProperty = async (propertyId: string) => {
 const previousProperty = properties.find((property) => property.id === propertyId);

 if (!previousProperty) {
 return false;
 }

 setProperties((current) => current.filter((property) => property.id !== propertyId));

 try {
 const response = await fetch('/api/admin/properties/' + encodeURIComponent(propertyId), {
 method: 'DELETE',
 credentials: 'same-origin',
 });

 if (!response.ok) {
 throw new Error(await response.text());
 }

 return true;
 } catch (error) {
 setProperties((current) => [previousProperty, ...current]);
 console.error('No se pudo eliminar la propiedad', error);
 return false;
 }
 };

 const value: AppDataContextValue = {
 developments,
 properties,
 leads,
 showToast,
 getDevelopmentBySlug: (slug) => developments.find((development) => development.slug === slug),
 getPropertyBySlug: (slug) => properties.find((property) => property.slug === slug),
 submitLead,
 updateLot,
 createProperty,
 updateProperty,
 deleteProperty,
 };

 return (
 <AppDataContext.Provider value={value}>
 {children}
 <div
 data-testid={'toast-region'}
 className={'pointer-events-none fixed inset-x-4 top-20 z-[80] mx-auto flex max-w-md justify-center md:left-auto md:right-6 md:mx-0'}
 >
 {toast ? (
 <div
 data-testid={'toast-notice'}
 className={'pointer-events-auto w-full rounded-2xl border bg-white/95 px-4 py-3 text-slate-900 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur ' + (toast.tone === 'success' ? 'border-emerald-200' : 'border-rose-200')}
 >
 <div className={'flex items-start gap-3'}>
 <div className={'mt-1 h-2.5 w-2.5 rounded-full ' + (toast.tone === 'success' ? 'bg-emerald-500' : 'bg-rose-500')} />
 <div>
 <p className={'text-sm font-semibold'}>{toast.title}</p>
 <p className={'mt-1 text-sm text-slate-600'}>{toast.description}</p>
 </div>
 </div>
 </div>
 ) : null}
 </div>
 </AppDataContext.Provider>
 );
}

export function useAppData() {
 const context = useContext(AppDataContext);

 if (!context) {
 throw new Error('useAppData debe usarse dentro de Providers');
 }

 return context;
}
