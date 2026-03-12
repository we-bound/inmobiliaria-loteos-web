import {
 AirtableCanonicalTable,
 AirtableDevelopmentFieldKey,
 AirtableFieldMapping,
 AirtableInquiryFieldKey,
 AirtableLotFieldKey,
 AirtableTableMapping,
 AirtableTableOption,
} from '@/types';

const tableAliases: Record<AirtableCanonicalTable, string[]> = {
 developments: ['developments', 'development', 'desarrollos', 'desarrollo', 'loteos', 'loteo'],
 lots: ['lots', 'lotes', 'loteso', 'parcelas', 'parcelaslotes', 'parcelas_lotes'],
 inquiries: ['inquiries', 'inquiry', 'consultas', 'consulta', 'leads', 'oportunidades'],
};

export const tableLabels: Record<AirtableCanonicalTable, string> = {
 developments: 'Loteos',
 lots: 'Lotes',
 inquiries: 'Consultas',
};

export const developmentRequiredFields: AirtableDevelopmentFieldKey[] = ['slug', 'name'];
export const developmentOptionalFields: AirtableDevelopmentFieldKey[] = ['location', 'province', 'short_description', 'hero_description', 'general_status', 'cover_theme', 'base_currency', 'amenities', 'site_map_json'];

export const lotRequiredFields: AirtableLotFieldKey[] = ['development_slug', 'lot_code', 'lot_number', 'surface_m2', 'status'];
export const lotOptionalFields: AirtableLotFieldKey[] = ['block', 'street', 'price', 'currency', 'down_payment', 'installments_count', 'installment_value', 'notes', 'description', 'orientation', 'financing_available', 'map_x', 'map_y', 'map_width', 'map_height'];

export const inquiryRequiredFields: AirtableInquiryFieldKey[] = ['name', 'phone', 'email', 'message'];
export const inquiryOptionalFields: AirtableInquiryFieldKey[] = ['development_slug', 'lot_code', 'lot_label', 'source', 'status'];

export const developmentFieldLabels: Record<AirtableDevelopmentFieldKey, string> = {
 slug: 'Slug del loteo',
 name: 'Nombre',
 location: 'Ubicacion',
 province: 'Provincia',
 short_description: 'Descripcion corta',
 hero_description: 'Descripcion principal',
 general_status: 'Estado general',
 cover_theme: 'Tema visual',
 base_currency: 'Moneda base',
 amenities: 'Amenities',
 site_map_json: 'Plano JSON',
};

export const lotFieldLabels: Record<AirtableLotFieldKey, string> = {
 development_slug: 'Slug del loteo',
 lot_code: 'Codigo de lote',
 lot_number: 'Numero de lote',
 block: 'Manzana',
 street: 'Calle',
 surface_m2: 'Superficie m2',
 status: 'Estado',
 price: 'Precio',
 currency: 'Moneda',
 down_payment: 'Anticipo',
 installments_count: 'Cantidad de cuotas',
 installment_value: 'Valor de cuota',
 notes: 'Notas',
 description: 'Descripcion',
 orientation: 'Orientacion',
 financing_available: 'Financiacion disponible',
 map_x: 'Plano X',
 map_y: 'Plano Y',
 map_width: 'Plano ancho',
 map_height: 'Plano alto',
};

export const inquiryFieldLabels: Record<AirtableInquiryFieldKey, string> = {
 development_slug: 'Slug del loteo',
 lot_code: 'Codigo de lote',
 lot_label: 'Etiqueta del lote',
 name: 'Nombre',
 phone: 'Telefono',
 email: 'Email',
 message: 'Mensaje',
 source: 'Origen',
 status: 'Estado',
};

const developmentFieldAliases: Record<AirtableDevelopmentFieldKey, string[]> = {
 slug: ['slug', 'codigo', 'codigo_loteo', 'loteo_slug', 'desarrollo_slug'],
 name: ['name', 'nombre', 'loteo', 'desarrollo'],
 location: ['location', 'ubicacion', 'localidad', 'zona'],
 province: ['province', 'provincia'],
 short_description: ['shortdescription', 'descripcioncorta', 'descripcion_corta', 'resumen'],
 hero_description: ['herodescription', 'descripcionprincipal', 'descripcion_principal', 'descripcionlarga'],
 general_status: ['generalstatus', 'estadogeneral', 'estado_general'],
 cover_theme: ['covertheme', 'tema', 'tema_portada'],
 base_currency: ['basecurrency', 'monedabase', 'moneda_base', 'currency'],
 amenities: ['amenities', 'amenity', 'amenidades', 'servicios'],
 site_map_json: ['sitemapjson', 'site_map_json', 'planojson', 'plano_json'],
};

const lotFieldAliases: Record<AirtableLotFieldKey, string[]> = {
 development_slug: ['developmentslug', 'desarrollo_slug', 'loteo_slug', 'loteo', 'desarrollo'],
 lot_code: ['lotcode', 'codigo', 'codigo_lote', 'id_lote'],
 lot_number: ['lotnumber', 'numero', 'numero_lote', 'nrolote', 'lote'],
 block: ['block', 'manzana'],
 street: ['street', 'calle'],
 surface_m2: ['surfacem2', 'surface_m2', 'superficie', 'superficie_m2', 'm2'],
 status: ['status', 'estado'],

 price: ['price', 'precio', 'valor'],
 currency: ['currency', 'moneda'],
 down_payment: ['downpayment', 'down_payment', 'anticipo'],
 installments_count: ['installmentscount', 'installments_count', 'cuotas', 'cantidadcuotas'],
 installment_value: ['installmentvalue', 'installment_value', 'valorcuota', 'valor_cuota'],
 notes: ['notes', 'nota', 'notas'],
 description: ['description', 'descripcion'],
 orientation: ['orientation', 'orientacion'],
 financing_available: ['financingavailable', 'financing_available', 'financiaciondisponible', 'financiacion_disponible'],
 map_x: ['mapx', 'map_x', 'plano_x'],
 map_y: ['mapy', 'map_y', 'plano_y'],
 map_width: ['mapwidth', 'map_width', 'plano_ancho'],
 map_height: ['mapheight', 'map_height', 'plano_alto'],
};

const inquiryFieldAliases: Record<AirtableInquiryFieldKey, string[]> = {
 development_slug: ['developmentslug', 'desarrollo_slug', 'loteo_slug'],
 lot_code: ['lotcode', 'codigo', 'codigo_lote'],
 lot_label: ['lotlabel', 'etiquetalote', 'lotelabel'],
 name: ['name', 'nombre'],
 phone: ['phone', 'telefono', 'whatsapp'],
 email: ['email', 'correo'],
 message: ['message', 'mensaje', 'consulta'],
 source: ['source', 'origen'],
 status: ['status', 'estado'],
};

export function normalizeAirtableLabel(value: string) {
 return value
 .normalize('NFD')
 .replace(/[\u0300-\u036f]/g, '')
 .replace(/[^a-zA-Z0-9]+/g, '')
 .toLowerCase();
}

export function buildEmptyFieldMapping(): AirtableFieldMapping {
 return { developments: {}, lots: {}, inquiries: {} };
}

export function buildIdentityFieldMapping(): AirtableFieldMapping {
 return {
 developments: Object.fromEntries([...developmentRequiredFields, ...developmentOptionalFields].map((field) => [field, field])) as AirtableFieldMapping['developments'],
 lots: Object.fromEntries([...lotRequiredFields, ...lotOptionalFields].map((field) => [field, field])) as AirtableFieldMapping['lots'],
 inquiries: Object.fromEntries([...inquiryRequiredFields, ...inquiryOptionalFields].map((field) => [field, field])) as AirtableFieldMapping['inquiries'],
 };
}

export function buildIdentityTableMapping(developmentsTable = 'Developments', lotsTable = 'Lots', inquiriesTable = 'Inquiries'): AirtableTableMapping {
 return { developments: developmentsTable, lots: lotsTable, inquiries: inquiriesTable };
}

export function suggestTableMapping(tables: AirtableTableOption[]): AirtableTableMapping {
 const mapping: AirtableTableMapping = {};

 (Object.keys(tableAliases) as AirtableCanonicalTable[]).forEach((tableKey) => {
 const match = tables.find((table) => tableAliases[tableKey].includes(normalizeAirtableLabel(table.name)));
 if (match) {
 mapping[tableKey] = match.name;
 }
 });

 return mapping;
}

function findFieldMatch(table: AirtableTableOption | undefined, aliases: string[]) {
 if (!table) {
 return undefined;
 }

 const normalizedAliases = aliases.map(normalizeAirtableLabel);
 return table.fields.find((field) => normalizedAliases.includes(normalizeAirtableLabel(field.name)))?.name;
}

export function suggestFieldMapping(tables: AirtableTableOption[], tablesMapping: AirtableTableMapping): AirtableFieldMapping {
 const developmentTable = tables.find((table) => table.name === tablesMapping.developments);
 const lotsTable = tables.find((table) => table.name === tablesMapping.lots);
 const inquiriesTable = tables.find((table) => table.name === tablesMapping.inquiries);

 return {
 developments: Object.fromEntries([...developmentRequiredFields, ...developmentOptionalFields].map((field) => [field, findFieldMatch(developmentTable, developmentFieldAliases[field])]).filter((entry) => entry[1])) as AirtableFieldMapping['developments'],
 lots: Object.fromEntries([...lotRequiredFields, ...lotOptionalFields].map((field) => [field, findFieldMatch(lotsTable, lotFieldAliases[field])]).filter((entry) => entry[1])) as AirtableFieldMapping['lots'],
 inquiries: Object.fromEntries([...inquiryRequiredFields, ...inquiryOptionalFields].map((field) => [field, findFieldMatch(inquiriesTable, inquiryFieldAliases[field])]).filter((entry) => entry[1])) as AirtableFieldMapping['inquiries'],
 };
}

export const airtableFieldGroups = {
 developments: { required: developmentRequiredFields, optional: developmentOptionalFields },
 lots: { required: lotRequiredFields, optional: lotOptionalFields },
 inquiries: { required: inquiryRequiredFields, optional: inquiryOptionalFields },
};
