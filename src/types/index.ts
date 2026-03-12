export type Currency = 'ARS' | 'USD';

export type LotStatus = 'disponible' | 'reservado' | 'vendido' | 'consultado';

export type LeadSource = 'lote' | 'contacto' | 'alerta';

export type IntegrationStatus = 'not_connected' | 'validating' | 'connected' | 'error';

export type AirtableProviderMode = 'live' | 'demo';

export interface Financing {
 available: boolean;
 currency: Currency;
 downPayment: number;
 installments: number;
 installmentValue: number;
}

export interface LotMapPosition {
 x: number;
 y: number;
 width: number;
 height: number;
}

export interface Lot {
 id: string;
 lotCode: string;
 number: string;
 block: string;
 street: string;
 area: number;
 orientation: string;
 status: LotStatus;
 price: number;
 currency: Currency;
 financing: Financing;
 description: string;
 notes?: string;
 mapPosition: LotMapPosition;
}

export interface SiteElement {
 id: string;
 type: 'street' | 'green' | 'common';
 x: number;
 y: number;
 width: number;
 height: number;
 label: string;
 labelX?: number;
 labelY?: number;
}

export interface SiteMapData {
 viewBox: string;
 elements: SiteElement[];
}

export interface Development {
 id: string;
 slug: string;
 name: string;
 location: string;
 province: string;
 shortDescription: string;
 heroDescription: string;
 generalStatus: string;
 coverTheme: string;
 baseCurrency: Currency;
 amenities: string[];
 siteMap: SiteMapData;
 lots: Lot[];
}

export interface Lead {
 id: string;
 developmentSlug?: string;
 lotId?: string;
 lotCode?: string;
 lotLabel?: string;
 name: string;
 phone: string;
 email: string;
 message: string;
 source: LeadSource;
 createdAt: string;
 status: 'nuevo' | 'contactado' | 'seguimiento';
}

export interface LeadInput {
 developmentSlug?: string;
 lotId?: string;
 lotCode?: string;
 lotLabel?: string;
 name: string;
 phone: string;
 email: string;
 message: string;
 source: LeadSource;
}

export interface LotUpdateInput {
 status?: LotStatus;
 price?: number;
 downPayment?: number;
 installmentsCount?: number;
 installmentValue?: number;
 notes?: string;
}

export interface AirtableBaseOption {
 id: string;
 name: string;
 permissionLevel?: string;
}

export interface AirtableFieldOption {
 id?: string;
 name: string;
 type?: string;
}

export interface AirtableTableOption {
 id: string;
 name: string;
 fields: AirtableFieldOption[];
}

export type AirtableCanonicalTable = 'developments' | 'lots' | 'inquiries';

export interface AirtableTableMapping {
 developments?: string;
 lots?: string;
 inquiries?: string;
}

export type AirtableDevelopmentFieldKey =
 | 'slug'
 | 'name'
 | 'location'
 | 'province'
 | 'short_description'
 | 'hero_description'
 | 'general_status'
 | 'cover_theme'
 | 'base_currency'
 | 'amenities'
 | 'site_map_json';

export type AirtableLotFieldKey =
 | 'development_slug'
 | 'lot_code'
 | 'lot_number'
 | 'block'
 | 'street'
 | 'surface_m2'
 | 'status'
 | 'price'
 | 'currency'
 | 'down_payment'
 | 'installments_count'
 | 'installment_value'
 | 'notes'
 | 'description'
 | 'orientation'
 | 'financing_available'
 | 'map_x'
 | 'map_y'
 | 'map_width'
 | 'map_height';

export type AirtableInquiryFieldKey =
 | 'development_slug'
 | 'lot_code'
 | 'lot_label'
 | 'name'
 | 'phone'
 | 'email'
 | 'message'
 | 'source'
 | 'status';

export interface AirtableFieldMapping {
 developments: Partial<Record<AirtableDevelopmentFieldKey, string>>;
 lots: Partial<Record<AirtableLotFieldKey, string>>;
 inquiries: Partial<Record<AirtableInquiryFieldKey, string>>;
}

export interface AirtablePreviewResult {
 counts: {
 developments: number;
 lots: number;
 inquiries: number;
 };
 examples: {
 developments: Array<Record<string, string | number | boolean | null>>;
 lots: Array<Record<string, string | number | boolean | null>>;
 inquiries: Array<Record<string, string | number | boolean | null>>;
 };
 warnings: string[];
}

export interface AirtableConnectionSummary {
 provider: 'airtable';
 status: IntegrationStatus;
 source: 'saved' | 'env' | 'mock';
 mode: AirtableProviderMode;
 baseId?: string;
 baseName?: string;
 tokenMasked?: string;
 tablesMapping?: AirtableTableMapping;
 fieldMapping?: AirtableFieldMapping;
 lastTestAt?: string;
 lastSyncAt?: string;
 lastError?: string;
 isPersistent: boolean;
 canDisconnect: boolean;
}

export interface AirtableIntegrationConfig {
 provider: 'airtable';
 status: IntegrationStatus;
 mode: AirtableProviderMode;
 baseId: string;
 baseName: string;
 tokenEncrypted: string;
 tablesMapping: AirtableTableMapping;
 fieldMapping: AirtableFieldMapping;
 lastTestAt?: string;
 lastSyncAt?: string;
 lastError?: string;
 createdAt: string;
 updatedAt: string;
}

export interface AirtableWizardSession {
 id: string;
 provider: 'airtable';
 mode: AirtableProviderMode;
 createdAt: string;
 expiresAt: string;
 tokenEncrypted: string;
 tokenMasked: string;
 validationStatus: IntegrationStatus;
 bases?: AirtableBaseOption[];
 selectedBase?: AirtableBaseOption;
 tableCandidates?: AirtableTableOption[];
 draftTablesMapping?: AirtableTableMapping;
 draftFieldMapping?: AirtableFieldMapping;
 lastError?: string;
}