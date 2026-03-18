import { Development, Lead, LeadInput, Lot, LotStatus, LotUpdateInput } from '@/types';

import { AirtableRecord } from '@/lib/airtable/client';

export interface AirtableDevelopmentFields {
 slug?: string;
 name?: string;
 location?: string;
 province?: string;
 short_description?: string;
 hero_description?: string;
 general_status?: string;
 cover_theme?: string;
 base_currency?: 'ARS' | 'USD';
 amenities?: string | string[];
 site_map_json?: string;
}

export interface AirtableLotFields {
 development_slug?: string;
 lot_code?: string;
 lot_number?: string | number;
 block?: string;
 street?: string;
 surface_m2?: number;
 status?: LotStatus;
 price?: number;
 currency?: 'ARS' | 'USD';
 down_payment?: number;
 installments_count?: number;
 installment_value?: number;
 notes?: string;
 description?: string;
 orientation?: string;
 financing_available?: boolean;
 map_x?: number;
 map_y?: number;
 map_width?: number;
 map_height?: number;
}

export interface AirtableInquiryFields {
 development_slug?: string;
 lot_code?: string;
 lot_label?: string;
 name?: string;
 phone?: string;
 email?: string;
 message?: string;
 source?: 'lote' | 'contacto' | 'alerta' | 'propiedad';
 status?: 'nuevo' | 'contactado' | 'seguimiento';
}

function parseArray(value: string | string[] | undefined, fallback: string[]) {
 if (Array.isArray(value)) return value.filter(Boolean);
 if (!value) return fallback;
 try {
 const parsed = JSON.parse(value);
 if (Array.isArray(parsed)) return parsed.map(String);
 } catch {}
 return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function parseSiteMap(value: string | undefined, fallback: Development['siteMap']) {
 if (!value) return fallback;
 try {
 return JSON.parse(value) as Development['siteMap'];
 } catch {
 return fallback;
 }
}

export function mapLotRecord(record: AirtableRecord<AirtableLotFields>, template?: Lot): Lot {
 const fields = record.fields;
 const number = String(fields.lot_number ?? template?.number ?? '00').padStart(2, '0');
 const lotCode = fields.lot_code || template?.lotCode || number;
 return {
 id: record.id,
 lotCode,
 number,
 block: fields.block || template?.block || 'A',
 street: fields.street || template?.street || 'Sin calle',
 area: Number(fields.surface_m2 ?? template?.area ?? 0),
 orientation: fields.orientation || template?.orientation || 'Este',
 status: fields.status || template?.status || 'consultado',
 price: Number(fields.price ?? template?.price ?? 0),
 currency: fields.currency || template?.currency || 'ARS',
 financing: {
 available: typeof fields.financing_available === 'boolean' ? fields.financing_available : (template?.financing.available ?? true),
 currency: fields.currency || template?.financing.currency || 'ARS',
 downPayment: Number(fields.down_payment ?? template?.financing.downPayment ?? 0),
 installments: Number(fields.installments_count ?? template?.financing.installments ?? 0),
 installmentValue: Number(fields.installment_value ?? template?.financing.installmentValue ?? 0),
 },
 description: fields.description || template?.description || 'Lote con informacion comercial cargada desde Airtable.',
 notes: fields.notes || template?.notes,
 mapPosition: {
 x: Number(fields.map_x ?? template?.mapPosition.x ?? 0),
 y: Number(fields.map_y ?? template?.mapPosition.y ?? 0),
 width: Number(fields.map_width ?? template?.mapPosition.width ?? 120),
 height: Number(fields.map_height ?? template?.mapPosition.height ?? 60),
 },
 };
}

export function mapDevelopmentRecord(record: AirtableRecord<AirtableDevelopmentFields>, lots: Lot[], template?: Development): Development {
 const fields = record.fields;
 return {
 id: record.id,
 slug: fields.slug || template?.slug || record.id,
 name: fields.name || template?.name || 'Loteo',
 location: fields.location || template?.location || 'Argentina',
 province: fields.province || template?.province || 'Cordoba',
 shortDescription: fields.short_description || template?.shortDescription || 'Desarrollo comercial.',
 heroDescription: fields.hero_description || template?.heroDescription || 'Desarrollo cargado desde Airtable.',
 generalStatus: fields.general_status || template?.generalStatus || 'Comercializacion activa',
 coverTheme: fields.cover_theme || template?.coverTheme || 'from-sky-50 via-white to-emerald-50',
 baseCurrency: fields.base_currency || template?.baseCurrency || 'ARS',
 amenities: parseArray(fields.amenities, template?.amenities || []),
 siteMap: parseSiteMap(fields.site_map_json, template?.siteMap || { viewBox: '0 0 100 100', elements: [] }),
 lots,
 };
}

export function mapInquiryRecord(record: AirtableRecord<AirtableInquiryFields>): Lead {
 const fields = record.fields;
 return {
 id: record.id,
 createdAt: record.createdTime,
 developmentSlug: fields.development_slug,
 lotCode: fields.lot_code,
 lotLabel: fields.lot_label,
 name: fields.name || 'Sin nombre',
 phone: fields.phone || '',
 email: fields.email || '',
 message: fields.message || '',
 source: fields.source || 'contacto',
 status: fields.status || 'nuevo',
 };
}

export function toAirtableInquiryFields(input: LeadInput): AirtableInquiryFields {
 return {
 development_slug: input.developmentSlug,
 lot_code: input.lotCode,
 lot_label: input.lotLabel,
 name: input.name,
 phone: input.phone,
 email: input.email,
 message: input.message,
 source: input.source,
 status: 'nuevo',
 };
}

export function toAirtableLotPatch(input: LotUpdateInput): Partial<AirtableLotFields> {
 return {
 ...(input.status ? { status: input.status } : {}),
 ...(typeof input.price === 'number' ? { price: input.price } : {}),
 ...(typeof input.downPayment === 'number' ? { down_payment: input.downPayment } : {}),
 ...(typeof input.installmentsCount === 'number' ? { installments_count: input.installmentsCount } : {}),
 ...(typeof input.installmentValue === 'number' ? { installment_value: input.installmentValue } : {}),
 ...(typeof input.notes === 'string' ? { notes: input.notes } : {}),
 };
}
