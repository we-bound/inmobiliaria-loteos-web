import { Currency, LeadSource, LotStatus } from '@/types';

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
};

export function formatCurrency(value: number, currency: Currency = 'ARS') {
 return new Intl.NumberFormat('es-AR', {
 style: 'currency',
 currency,
 maximumFractionDigits: 0,
 }).format(value);
}

export function formatArea(value: number) {
 return value.toLocaleString('es-AR') + ' m2';
}

export function capitalize(value: string) {
 return value.charAt(0).toUpperCase() + value.slice(1);
}

export function cn(...classes: Array<string | false | null | undefined>) {
 return classes.filter(Boolean).join(' ');
}
