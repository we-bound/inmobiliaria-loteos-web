'use client';
/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react';

import { LeadsTable } from '@/components/admin-ui';
import { PropertyOperationBadge, PropertyStatusBadge } from '@/components/properties-ui';
import { useAppData } from '@/components/providers';
import { formatCurrency, propertyTypeMeta } from '@/lib/format';
import { Lead, Property, PropertyImageInput, PropertyUpsertInput } from '@/types';

interface PropertyFormState {
 title: string;
 type: 'casa' | 'departamento' | 'cabana';
 operation: 'alquiler' | 'venta';
 availability: 'disponible' | 'reservada' | 'cerrada' | 'oculta';
 location: string;
 province: string;
 addressOrZone: string;
 shortDescription: string;
 description: string;
 surfaceM2: string;
 coveredM2: string;
 bedrooms: string;
 bathrooms: string;
 parking: boolean;
 price: string;
 currency: 'ARS' | 'USD';
 showPrice: boolean;
 featured: boolean;
 whatsappMessage: string;
 images: PropertyImageInput[];
}

function emptyForm(): PropertyFormState {
 return {
 title: '',
 type: 'casa',
 operation: 'alquiler',
 availability: 'disponible',
 location: '',
 province: 'Córdoba',
 addressOrZone: '',
 shortDescription: '',
 description: '',
 surfaceM2: '',
 coveredM2: '',
 bedrooms: '',
 bathrooms: '',
 parking: false,
 price: '',
 currency: 'ARS',
 showPrice: true,
 featured: false,
 whatsappMessage: '',
 images: [],
 };
}

function propertyToForm(property: Property): PropertyFormState {
 return {
 title: property.title,
 type: property.type,
 operation: property.operation,
 availability: property.availability,
 location: property.location,
 province: property.province,
 addressOrZone: property.addressOrZone,
 shortDescription: property.shortDescription,
 description: property.description,
 surfaceM2: String(property.surfaceM2),
 coveredM2: typeof property.coveredM2 === 'number' ? String(property.coveredM2) : '',
 bedrooms: typeof property.bedrooms === 'number' ? String(property.bedrooms) : '',
 bathrooms: typeof property.bathrooms === 'number' ? String(property.bathrooms) : '',
 parking: Boolean(property.parking),
 price: typeof property.price === 'number' ? String(property.price) : '',
 currency: property.currency || 'ARS',
 showPrice: property.showPrice,
 featured: property.featured,
 whatsappMessage: property.whatsappMessage || '',
 images: property.images.map((image) => ({ id: image.id, url: image.url, alt: image.alt, isCover: image.isCover })),
 };
}

function formToPayload(form: PropertyFormState): PropertyUpsertInput {
 return {
 title: form.title.trim(),
 type: form.type,
 operation: form.operation,
 availability: form.availability,
 location: form.location.trim(),
 province: form.province.trim(),
 addressOrZone: form.addressOrZone.trim(),
 shortDescription: form.shortDescription.trim(),
 description: form.description.trim(),
 surfaceM2: Number(form.surfaceM2),
 ...(form.coveredM2 ? { coveredM2: Number(form.coveredM2) } : {}),
 ...(form.bedrooms ? { bedrooms: Number(form.bedrooms) } : {}),
 ...(form.bathrooms ? { bathrooms: Number(form.bathrooms) } : {}),
 parking: form.parking,
 ...(form.price ? { price: Number(form.price) } : {}),
 currency: form.currency,
 showPrice: form.showPrice,
 featured: form.featured,
 images: form.images,
 ...(form.whatsappMessage.trim() ? { whatsappMessage: form.whatsappMessage.trim() } : {}),
 };
}

function formatPropertyPrice(property: Property) {
 if (!property.showPrice || typeof property.price !== 'number') {
 return 'Consultar valor';
 }

 return formatCurrency(property.price, property.currency || 'ARS');
}

function mainImage(property: Property) {
 return property.images.find((image) => image.isCover) || property.images[0];
}

async function readFileAsDataUrl(file: File) {
 return await new Promise<string>((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = () => resolve(String(reader.result || ''));
 reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
 reader.readAsDataURL(file);
 });
}

export function AdminPropertiesPanel(props: { leads: Lead[] }) {
 const { properties, createProperty, updateProperty, deleteProperty, showToast } = useAppData();
 const [search, setSearch] = useState('');
 const [operation, setOperation] = useState('all');
 const [type, setType] = useState('all');
 const [availability, setAvailability] = useState('all');
 const [editorOpen, setEditorOpen] = useState(false);
 const [editingProperty, setEditingProperty] = useState<Property | null>(null);
 const activeProperties = properties.filter((property) => property.availability === 'disponible').length;
 const rentalProperties = properties.filter((property) => property.operation === 'alquiler').length;
 const saleProperties = properties.filter((property) => property.operation === 'venta').length;

 const filteredProperties = useMemo(() => {
 return properties.filter((property) => {
 const haystack = [property.title, property.location, property.addressOrZone, property.shortDescription].join(' ').toLowerCase();
 const matchesSearch = haystack.includes(search.toLowerCase());
 const matchesOperation = operation === 'all' || property.operation === operation;
 const matchesType = type === 'all' || property.type === type;
 const matchesAvailability = availability === 'all' || property.availability === availability;
 return matchesSearch && matchesOperation && matchesType && matchesAvailability;
 });
 }, [availability, operation, properties, search, type]);

 async function handleDelete(property: Property) {
 const confirmed = window.confirm('Vas a quitar "' + property.title + '" del catálogo mock. ¿Continuar?');

 if (!confirmed) {
 return;
 }

 const ok = await deleteProperty(property.id);

 if (ok) {
 showToast({ title: 'Propiedad quitada', description: 'La propiedad se removió del catálogo de la sesión actual.', tone: 'success' });
 } else {
 showToast({ title: 'No pudimos quitar la propiedad', description: 'Intenta nuevamente en unos segundos.', tone: 'error' });
 }
 }

 return (
 <section data-testid={'admin-properties-view'} className={'space-y-6'}>
 <section className={'rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)]'}>
 <div className={'grid gap-6 xl:grid-cols-[0.95fr_1.05fr]'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'}>Dashboard de propiedades</p>
 <h2 className={'mt-3 text-3xl font-semibold text-slate-950'}>Alquileres y ventas con carga simple</h2>
 <p className={'mt-3 text-lg leading-8 text-slate-600'}>Esta sección de la demo muestra cómo cargar propiedades, decidir si se publica el precio, elegir portada y recibir leads por WhatsApp o solicitud de contacto.</p>
 </div>
 <div className={'grid gap-3 sm:grid-cols-3'}>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>1. Publicación</p>
 <p className={'mt-2'}>Cargá casa, departamento o cabaña con operación, estado, ubicación y descripción comercial.</p>
 </div>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>2. Precio opcional</p>
 <p className={'mt-2'}>Elegí si querés mostrar el valor o dejar “Consultar valor” para una gestión más personalizada.</p>
 </div>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>3. Captación</p>
 <p className={'mt-2'}>Los leads de propiedades quedan separados de los leads de lotes para una lectura comercial más ordenada.</p>
 </div>
 </div>
 </div>
 </section>

 <div className={'grid gap-4 sm:grid-cols-2 xl:grid-cols-5'}>
 <Metric label={'Propiedades'} value={String(properties.length)} tone={'text-slate-950'} surface={'border-slate-200 bg-white'} />
 <Metric label={'Disponibles'} value={String(activeProperties)} tone={'text-emerald-700'} surface={'border-emerald-100 bg-emerald-50/70'} />
 <Metric label={'Alquiler'} value={String(rentalProperties)} tone={'text-sky-700'} surface={'border-sky-100 bg-sky-50/70'} />
 <Metric label={'Venta'} value={String(saleProperties)} tone={'text-violet-700'} surface={'border-violet-100 bg-violet-50/70'} />
 <Metric label={'Leads'} value={String(props.leads.length)} tone={'text-amber-700'} surface={'border-amber-100 bg-amber-50/80'} />
 </div>

 <section className={'rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)]'}>
 <div className={'flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'}>
 <div>
 <h3 className={'text-2xl font-semibold text-slate-950'}>Propiedades</h3>
 <p className={'mt-2 text-sm text-slate-500'}>Administrá casas, departamentos y cabañas para alquiler o venta con carga simple de imágenes y precio opcional.</p>
 </div>
 <button data-testid={'admin-properties-add'} type={'button'} onClick={() => { setEditingProperty(null); setEditorOpen(true); }} className={'inline-flex items-center justify-center rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}>
 Agregar propiedad
 </button>
 </div>

 <div data-testid={'admin-properties-filters'} className={'mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'}>
 <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={'Buscar por título o ubicación'} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 <select value={operation} onChange={(event) => setOperation(event.target.value)} className={'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'all'}>Alquiler y venta</option>
 <option value={'alquiler'}>Alquiler</option>
 <option value={'venta'}>Venta</option>
 </select>
 <select value={type} onChange={(event) => setType(event.target.value)} className={'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'all'}>Todos los tipos</option>
 <option value={'casa'}>Casa</option>
 <option value={'departamento'}>Departamento</option>
 <option value={'cabana'}>Cabaña</option>
 </select>
 <select value={availability} onChange={(event) => setAvailability(event.target.value)} className={'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'all'}>Todos los estados</option>
 <option value={'disponible'}>Disponible</option>
 <option value={'reservada'}>Reservada</option>
 <option value={'cerrada'}>Cerrada</option>
 <option value={'oculta'}>Oculta</option>
 </select>
 </div>

 <div className={'mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3'}>
 {filteredProperties.map((property) => (
 <article key={property.id} data-testid={'admin-property-card-' + property.id} className={'overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]'}>
 <div className={'aspect-[4/3] overflow-hidden bg-slate-100'}>
 <img src={mainImage(property)?.url} alt={mainImage(property)?.alt || property.title} className={'h-full w-full object-cover'} />
 </div>
 <div className={'space-y-4 p-5'}>
 <div className={'flex flex-wrap items-center gap-2'}>
 <PropertyOperationBadge operation={property.operation} />
 <PropertyStatusBadge property={property} />
 {property.featured ? <span className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'}>Destacada</span> : null}
 </div>
 <div>
 <h4 className={'text-lg font-semibold text-slate-950'}>{property.title}</h4>
 <p className={'mt-2 text-sm text-slate-500'}>{property.addressOrZone} - {property.location}</p>
 </div>
 <div className={'grid grid-cols-2 gap-3 text-sm text-slate-600'}>
 <div className={'rounded-2xl bg-slate-50 px-4 py-3'}>
 <p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Tipo</p>
 <p className={'mt-2 font-semibold text-slate-950'}>{propertyTypeMeta[property.type].label}</p>
 </div>
 <div className={'rounded-2xl bg-slate-50 px-4 py-3'}>
 <p className={'text-xs uppercase tracking-[0.18em] text-slate-400'}>Precio</p>
 <p className={'mt-2 font-semibold text-slate-950'}>{formatPropertyPrice(property)}</p>
 </div>
 </div>
 <div className={'flex flex-col gap-3 sm:flex-row'}>
 <button data-testid={'admin-property-edit-' + property.id} type={'button'} onClick={() => { setEditingProperty(property); setEditorOpen(true); }} className={'inline-flex items-center justify-center rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d]'}>
 Editar
 </button>
 <button data-testid={'admin-property-delete-' + property.id} type={'button'} onClick={() => void handleDelete(property)} className={'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>
 Quitar
 </button>
 </div>
 </div>
 </article>
 ))}
 </div>

 {filteredProperties.length === 0 ? (
 <div className={'mt-5 rounded-[1.8rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500'}>
 No hay propiedades con los filtros actuales.
 </div>
 ) : null}
 </section>

 <LeadsTable
 leads={props.leads}
 title={'Leads de propiedades'}
 description={'Consultas originadas desde la grilla, el modal rápido y las solicitudes de contacto del catálogo de propiedades.'}
 testId={'admin-property-leads-table'}
 />

 <PropertyEditor
 open={editorOpen}
 property={editingProperty}
 onClose={() => { setEditorOpen(false); setEditingProperty(null); }}
 onCreate={async (input) => {
 const created = await createProperty(input);

 if (!created) {
 showToast({ title: 'No pudimos guardar la propiedad', description: 'Revisá la carga e intentá nuevamente.', tone: 'error' });
 return false;
 }

 showToast({ title: 'Propiedad guardada', description: 'La propiedad ya aparece en la sección pública y en admin.', tone: 'success' });
 return true;
 }}
 onUpdate={async (propertyId, input) => {
 const updated = await updateProperty(propertyId, input);

 if (!updated) {
 showToast({ title: 'No pudimos actualizar la propiedad', description: 'Intenta nuevamente en unos segundos.', tone: 'error' });
 return false;
 }

 showToast({ title: 'Propiedad actualizada', description: 'Los cambios ya impactan en el catálogo de esta sesión.', tone: 'success' });
 return true;
 }}
 onValidationError={(message) => showToast({ title: 'Revisa el formulario', description: message, tone: 'error' })}
 />
 </section>
 );
}

function PropertyEditor(props: {
 open: boolean;
 property: Property | null;
 onClose: () => void;
 onCreate: (input: PropertyUpsertInput) => Promise<boolean>;
 onUpdate: (propertyId: string, input: PropertyUpsertInput) => Promise<boolean>;
 onValidationError: (message: string) => void;
}) {
 if (!props.open) {
 return null;
 }

 return (
 <PropertyEditorBody
 key={props.property?.id || 'new-property'}
 property={props.property}
 onClose={props.onClose}
 onCreate={props.onCreate}
 onUpdate={props.onUpdate}
 onValidationError={props.onValidationError}
 />
 );
}

function PropertyEditorBody(props: {
 property: Property | null;
 onClose: () => void;
 onCreate: (input: PropertyUpsertInput) => Promise<boolean>;
 onUpdate: (propertyId: string, input: PropertyUpsertInput) => Promise<boolean>;
 onValidationError: (message: string) => void;
}) {
 const [form, setForm] = useState<PropertyFormState>(() => props.property ? propertyToForm(props.property) : emptyForm());
 const [isSaving, setIsSaving] = useState(false);

 useEffect(() => {
 const previous = document.body.style.overflow;
 document.body.style.overflow = 'hidden';
 return () => {
 document.body.style.overflow = previous;
 };
 }, []);

 function updateField<K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) {
 setForm((current) => ({ ...current, [key]: value }));
 }

 function setCover(imageId: string) {
 setForm((current) => ({
 ...current,
 images: current.images.map((image) => ({ ...image, isCover: image.id === imageId })),
 }));
 }

 function removeImage(imageId: string) {
 setForm((current) => {
 const nextImages = current.images.filter((image) => image.id !== imageId);
 return {
 ...current,
 images: nextImages.map((image, index) => ({ ...image, isCover: nextImages.some((candidate) => candidate.isCover) ? image.isCover : index === 0 })),
 };
 });
 }

 async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
 const files = Array.from(event.target.files || []);

 if (files.length === 0) {
 return;
 }

 if (form.images.length + files.length > 6) {
 props.onValidationError('La galería admite hasta 6 imágenes.');
 event.target.value = '';
 return;
 }

 const validFiles = files.filter((file) => file.type.startsWith('image/') && file.size <= 900_000);

 if (validFiles.length !== files.length) {
 props.onValidationError('Cada imagen debe ser un archivo válido de hasta 900 KB.');
 event.target.value = '';
 return;
 }

 const nextImages = await Promise.all(validFiles.map(async (file, index) => ({
 id: (props.property?.id || 'draft-property') + '-upload-' + Date.now() + '-' + index,
 url: await readFileAsDataUrl(file),
 alt: form.title || file.name.replace(/\.[a-z0-9]+$/i, ''),
 isCover: form.images.length === 0 && index === 0,
 })));

 setForm((current) => ({
 ...current,
 images: [...current.images, ...nextImages].map((image, index, all) => ({
 ...image,
 isCover: all.some((candidate) => candidate.isCover) ? image.isCover : index === 0,
 })),
 }));
 event.target.value = '';
 }

 async function handleSubmit() {
 if (!form.title.trim() || !form.location.trim() || !form.addressOrZone.trim() || !form.shortDescription.trim() || !form.description.trim() || !form.surfaceM2.trim()) {
 props.onValidationError('Completá título, ubicación, zona, descripciones y superficie.');
 return;
 }

 if (form.images.length === 0) {
 props.onValidationError('Agregá al menos una imagen para la propiedad.');
 return;
 }

 setIsSaving(true);
 const payload = formToPayload(form);
 const ok = props.property ? await props.onUpdate(props.property.id, payload) : await props.onCreate(payload);
 setIsSaving(false);

 if (ok) {
 props.onClose();
 }
 }

 return (
 <div className={'fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm md:items-center md:p-6'}>
 <button aria-label={'Cerrar formulario'} className={'absolute inset-0'} onClick={props.onClose} />
 <div data-testid={'admin-property-form'} className={'relative z-10 max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-4 shadow-2xl sm:p-5 md:max-w-[1080px] md:rounded-[2rem] md:p-6'}>
 <div className={'mb-5 flex items-start justify-between gap-4'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'}>{props.property ? 'Editar propiedad' : 'Nueva propiedad'}</p>
 <h3 className={'mt-2 text-3xl font-semibold text-slate-950'}>{props.property ? props.property.title : 'Carga comercial de propiedades'}</h3>
 </div>
 <button type={'button'} onClick={props.onClose} className={'inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900'}>×</button>
 </div>

 <div className={'grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'}>
 <div className={'space-y-4'}>
 <div className={'grid gap-4 sm:grid-cols-2'}>
 <Field label={'Título'}>
 <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 <Field label={'Ubicación'}>
 <input value={form.location} onChange={(event) => updateField('location', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 <Field label={'Tipo'}>
 <select value={form.type} onChange={(event) => updateField('type', event.target.value as PropertyFormState['type'])} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'casa'}>Casa</option>
 <option value={'departamento'}>Departamento</option>
 <option value={'cabana'}>Cabaña</option>
 </select>
 </Field>
 <Field label={'Operación'}>
 <select value={form.operation} onChange={(event) => updateField('operation', event.target.value as PropertyFormState['operation'])} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'alquiler'}>Alquiler</option>
 <option value={'venta'}>Venta</option>
 </select>
 </Field>
 <Field label={'Estado'}>
 <select value={form.availability} onChange={(event) => updateField('availability', event.target.value as PropertyFormState['availability'])} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'disponible'}>Disponible</option>
 <option value={'reservada'}>Reservada</option>
 <option value={'cerrada'}>Cerrada</option>
 <option value={'oculta'}>Oculta</option>
 </select>
 </Field>
 <Field label={'Provincia'}>
 <input value={form.province} onChange={(event) => updateField('province', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 </div>

 <Field label={'Zona / dirección comercial'}>
 <input value={form.addressOrZone} onChange={(event) => updateField('addressOrZone', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>

 <Field label={'Descripción corta'}>
 <textarea rows={3} value={form.shortDescription} onChange={(event) => updateField('shortDescription', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>

 <Field label={'Descripción completa'}>
 <textarea rows={5} value={form.description} onChange={(event) => updateField('description', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>

 <div className={'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'}>
 <Field label={'m² terreno'}>
 <input type={'number'} value={form.surfaceM2} onChange={(event) => updateField('surfaceM2', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 <Field label={'m² cubiertos'}>
 <input type={'number'} value={form.coveredM2} onChange={(event) => updateField('coveredM2', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 <Field label={'Dormitorios'}>
 <input type={'number'} value={form.bedrooms} onChange={(event) => updateField('bedrooms', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 <Field label={'Baños'}>
 <input type={'number'} value={form.bathrooms} onChange={(event) => updateField('bathrooms', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 </div>

 <div className={'grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_160px_1fr]'}>
 <Field label={'Precio'}>
 <input type={'number'} value={form.price} onChange={(event) => updateField('price', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 <Field label={'Moneda'}>
 <select value={form.currency} onChange={(event) => updateField('currency', event.target.value as PropertyFormState['currency'])} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'}>
 <option value={'ARS'}>ARS</option>
 <option value={'USD'}>USD</option>
 </select>
 </Field>
 <Field label={'WhatsApp sugerido'}>
 <input value={form.whatsappMessage} onChange={(event) => updateField('whatsappMessage', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 </Field>
 </div>

 <div className={'grid gap-3 sm:grid-cols-3'}>
 <label className={'flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700'}>
 <input type={'checkbox'} checked={form.showPrice} onChange={(event) => updateField('showPrice', event.target.checked)} />
 Mostrar precio
 </label>
 <label className={'flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700'}>
 <input type={'checkbox'} checked={form.featured} onChange={(event) => updateField('featured', event.target.checked)} />
 Destacada
 </label>
 <label className={'flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700'}>
 <input type={'checkbox'} checked={form.parking} onChange={(event) => updateField('parking', event.target.checked)} />
 Cochera
 </label>
 </div>
 </div>

 <div className={'space-y-4'}>
 <div className={'rounded-[1.8rem] border border-slate-200 bg-slate-50 p-5'}>
 <p className={'text-sm font-semibold text-slate-900'}>Mini galería</p>
 <p className={'mt-2 text-sm leading-6 text-slate-500'}>Cargá hasta 6 imágenes. Podés elegir una portada para la ficha pública y el modal rápido.</p>
 <label className={'mt-4 inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>
 <input data-testid={'admin-property-image-upload'} type={'file'} accept={'image/*'} multiple className={'hidden'} onChange={(event) => void handleFiles(event)} />
 Cargar imágenes
 </label>
 </div>

 <div className={'grid gap-3 sm:grid-cols-2'}>
 {form.images.map((image) => (
 <div key={image.id} className={'overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white'}>
 <img src={image.url} alt={image.alt || form.title || 'Imagen de propiedad'} className={'aspect-[4/3] w-full object-cover'} />
 <div className={'space-y-3 p-4'}>
 <input value={image.alt || ''} onChange={(event) => {
 setForm((current) => ({
 ...current,
 images: current.images.map((item) => item.id === image.id ? { ...item, alt: event.target.value } : item),
 }));
 }} placeholder={'Texto alternativo'} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900'} />
 <div className={'flex gap-2'}>
 <button type={'button'} onClick={() => setCover(image.id || '')} className={'inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700'}>
 {image.isCover ? 'Portada activa' : 'Usar como portada'}
 </button>
 <button type={'button'} onClick={() => removeImage(image.id || '')} className={'inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700'}>
 Quitar
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>

 {form.images.length === 0 ? (
 <div className={'rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500'}>
 Aún no cargaste imágenes para esta propiedad.
 </div>
 ) : null}

 <div className={'rounded-[1.8rem] border border-sky-100 bg-[linear-gradient(180deg,#f7fbff,#ffffff)] p-5 shadow-[0_20px_45px_-36px_rgba(37,99,235,0.28)]'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>Preview comercial</p>
 <h4 className={'mt-2 text-xl font-semibold text-slate-950'}>{form.title || 'Título de la propiedad'}</h4>
 <p className={'mt-2 text-sm text-slate-500'}>{form.addressOrZone || 'Zona'} - {form.location || 'Ubicación'}</p>
 <p className={'mt-4 text-lg font-semibold text-slate-950'}>
 {form.showPrice && form.price ? formatCurrency(Number(form.price), form.currency) : 'Consultar valor'}
 </p>
 <p className={'mt-3 text-sm leading-6 text-slate-600'}>{form.shortDescription || 'La descripción corta aparece aquí para validar rápidamente la ficha.'}</p>
 </div>
 </div>
 </div>

 <div className={'mt-6 flex flex-col gap-3 sm:flex-row'}>
 <button type={'button'} onClick={() => void handleSubmit()} disabled={isSaving} className={'inline-flex items-center justify-center rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d] disabled:cursor-not-allowed disabled:opacity-70'}>
 {isSaving ? 'Guardando...' : props.property ? 'Guardar cambios' : 'Agregar propiedad'}
 </button>
 <button type={'button'} onClick={props.onClose} className={'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>
 Cancelar
 </button>
 </div>
 </div>
 </div>
 );
}

function Metric(props: { label: string; value: string; tone: string; surface: string }) {
 return (
 <article className={'rounded-[1.75rem] border p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] ' + props.surface}>
 <p className={'text-sm text-slate-500'}>{props.label}</p>
 <p className={'mt-3 text-3xl font-semibold ' + props.tone}>{props.value}</p>
 </article>
 );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
 return (
 <label className={'space-y-2'}>
 <span className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'}>{label}</span>
 {children}
 </label>
 );
}
