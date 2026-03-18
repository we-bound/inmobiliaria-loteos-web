import { Currency, LeadSource, LotStatus, Property, PropertyAvailability, PropertyOperation, PropertyType } from '@/types';

export const statusMeta: Record<LotStatus, { label: string; tone: string; mapClass: string }> = {
 disponible: {
 label: 'Disponible',
 tone: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
 mapClass: 'fill-emerald-400 stroke-emerald-700',
 },
 reservado: {
 label: 'Reservado',
 tone: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
 mapClass: 'fill-slate-300 stroke-slate-500',
 },
 vendido: {
 label: 'Vendido',
 tone: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
 mapClass: 'fill-rose-300 stroke-rose-700',
 },
 consultado: {
 label: 'Consultado',
 tone: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
 mapClass: 'fill-amber-300 stroke-amber-700',
 },
};

export const leadSourceMeta: Record<LeadSource, { label: string; tone: string }> = {
 lote: { label: 'Lote', tone: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' },
 contacto: { label: 'Contacto', tone: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
 alerta: { label: 'Alerta', tone: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' },
 propiedad: { label: 'Propiedad', tone: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' },
};

export const propertyOperationMeta: Record<PropertyOperation, { label: string; tone: string }> = {
 alquiler: { label: 'Alquiler', tone: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200' },
 venta: { label: 'Venta', tone: 'bg-violet-50 text-violet-800 ring-1 ring-violet-200' },
};

export const propertyTypeMeta: Record<PropertyType, { label: string }> = {
 casa: { label: 'Casa' },
 departamento: { label: 'Departamento' },
 cabana: { label: 'Cabaña' },
};

export const propertyAvailabilityMeta: Record<PropertyAvailability, { tone: string }> = {
 disponible: { tone: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' },
 reservada: { tone: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' },
 cerrada: { tone: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
 oculta: { tone: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
};

export function formatCurrency(value: number, currency: Currency = 'ARS') {
 return new Intl.NumberFormat('es-AR', {
 style: 'currency',
 currency,
 maximumFractionDigits: 0,
 }).format(value);
}

export function formatArea(value: number) {
 return value.toLocaleString('es-AR') + ' m²';
}

export function capitalize(value: string) {
 return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatPropertyAvailability(property: Property) {
 if (property.availability === 'cerrada') {
 return property.operation === 'venta' ? 'Vendida' : 'Alquilada';
 }

 if (property.availability === 'reservada') {
 return 'Reservada';
 }

 if (property.availability === 'oculta') {
 return 'Oculta';
 }

 return 'Disponible';
}

export function cn(...classes: Array<string | false | null | undefined>) {
 return classes.filter(Boolean).join(' ');
}
