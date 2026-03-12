import crypto from 'node:crypto';
import path from 'node:path';
import { promises as fs } from 'node:fs';

import { airtableIntegrationEnabled } from '@/lib/features';
import {
 AirtableClientConfig,
 AirtableMetadataTable,
 AirtableRecord,
 createAirtableClientConfig,
 createRecordWithConfig,
 getAirtableConfig as getEnvAirtableConfig,
 listAllRecordsWithConfig,
 listBaseTablesWithToken,
 listBasesWithToken,
 listRecordsWithConfig,
 updateRecordWithConfig,
} from '@/lib/airtable/client';
import {
 airtableFieldGroups,
 buildEmptyFieldMapping,
 buildIdentityFieldMapping,
 buildIdentityTableMapping,
 developmentOptionalFields,
 developmentRequiredFields,
 inquiryOptionalFields,
 inquiryRequiredFields,
 lotOptionalFields,
 lotRequiredFields,
 suggestFieldMapping,
 suggestTableMapping,
} from '@/lib/airtable/connection-schema';
import { mockDevelopments, mockLeads } from '@/data/mock-data';
import {
 AirtableBaseOption,
 AirtableConnectionSummary, AirtableFieldMapping,
 AirtableIntegrationConfig, AirtablePreviewResult,
 AirtableProviderMode,
 AirtableTableMapping,
 AirtableTableOption,
 AirtableWizardSession,
 Development,
 Lead,
 LeadInput,
 Lot,
 LotStatus,
 LotUpdateInput,
} from '@/types';

type RawFields = Record<string, unknown>;
type RawRecord = AirtableRecord<RawFields>;

interface StoredIntegrationState {
 connection: AirtableIntegrationConfig | null;
 sessions: AirtableWizardSession[];
 updatedAt: string;
}

interface ActiveConnectionSource {
 source: 'saved' | 'env';
 mode: AirtableProviderMode;
 baseId: string;
 baseName: string;
 tokenMasked: string;
 clientConfig?: AirtableClientConfig;
 tablesMapping: AirtableTableMapping;
 fieldMapping: AirtableFieldMapping;
 isPersistent: boolean;
}

const STORE_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(STORE_DIR, 'airtable-integration.json');
const KEY_FILE = path.join(STORE_DIR, 'airtable-integration.key');
const SESSION_TTL_MS = 1000 * 60 * 30;
const SYNC_WRITE_THROTTLE_MS = 1000 * 60 * 5;

const defaultState: StoredIntegrationState = {
 connection: null,
 sessions: [],
 updatedAt: new Date().toISOString(),
};

let memoryState: StoredIntegrationState = defaultState;
let memorySecret: string | null = null;

const developmentTemplateBySlug = new Map(mockDevelopments.map((development) => [development.slug, development]));
const lotTemplateByCode = new Map(mockDevelopments.flatMap((development) => development.lots.map((lot) => [lot.lotCode, lot])));

const demoBase: AirtableBaseOption = {
 id: 'demo-base',
 name: 'Base demo de loteos',
 permissionLevel: 'create',
};

const demoTables: AirtableTableOption[] = [
 { id: 'demo-developments', name: 'Loteos', fields: [...developmentRequiredFields, ...developmentOptionalFields].map((field) => ({ id: 'demo-development-' + field, name: field })) },
 { id: 'demo-lots', name: 'Lotes', fields: [...lotRequiredFields, ...lotOptionalFields].map((field) => ({ id: 'demo-lot-' + field, name: field })) },
 { id: 'demo-inquiries', name: 'Consultas', fields: [...inquiryRequiredFields, ...inquiryOptionalFields].map((field) => ({ id: 'demo-inquiry-' + field, name: field })) },
];

const demoTableMapping = suggestTableMapping(demoTables);
const demoFieldMapping = suggestFieldMapping(demoTables, demoTableMapping);

const demoRecords = buildDemoRecords();


function buildDemoRecords() {
 return {
 developments: mockDevelopments.map((development) => ({
 id: 'demo-development-' + development.slug,
 createdTime: new Date().toISOString(),
 fields: {
 slug: development.slug,
 name: development.name,
 location: development.location,
 province: development.province,
 short_description: development.shortDescription,
 hero_description: development.heroDescription,
 general_status: development.generalStatus,
 cover_theme: development.coverTheme,
 base_currency: development.baseCurrency,
 amenities: development.amenities,
 site_map_json: JSON.stringify(development.siteMap),
 },
 })),
 lots: mockDevelopments.flatMap((development) =>
 development.lots.map((lot) => ({
 id: 'demo-lot-' + lot.lotCode,
 createdTime: new Date().toISOString(),
 fields: {
 development_slug: development.slug,
 lot_code: lot.lotCode,
 lot_number: lot.number,
 block: lot.block,
 street: lot.street,
 surface_m2: lot.area,
 status: lot.status,
 price: lot.price,
 currency: lot.currency,
 down_payment: lot.financing.downPayment,
 installments_count: lot.financing.installments,
 installment_value: lot.financing.installmentValue,
 notes: lot.notes,
 description: lot.description,
 orientation: lot.orientation,
 financing_available: lot.financing.available,
 map_x: lot.mapPosition.x,
 map_y: lot.mapPosition.y,
 map_width: lot.mapPosition.width,
 map_height: lot.mapPosition.height,
 },
 })),
 ),
 inquiries: mockLeads.map((lead) => ({
 id: 'demo-inquiry-' + lead.id,
 createdTime: lead.createdAt,
 fields: {
 development_slug: lead.developmentSlug,
 lot_code: lead.lotCode,
 lot_label: lead.lotLabel,
 name: lead.name,
 phone: lead.phone,
 email: lead.email,
 message: lead.message,
 source: lead.source,
 status: lead.status,
 },
 })),
 };
}

function cleanupExpiredSessions(state: StoredIntegrationState) {
 const now = Date.now();
 return {
 ...state,
 sessions: state.sessions.filter((session) => new Date(session.expiresAt).getTime() > now),
 };
}

async function getSecretMaterial() {
 if (process.env.AIRTABLE_INTEGRATION_SECRET) {
 return { value: process.env.AIRTABLE_INTEGRATION_SECRET, isPersistent: true };
 }

 try {
 const fromDisk = await fs.readFile(KEY_FILE, 'utf8');
 return { value: fromDisk.trim(), isPersistent: true };
 } catch {}

 const generated = crypto.randomBytes(32).toString('hex');

 try {
 await fs.mkdir(STORE_DIR, { recursive: true });
 await fs.writeFile(KEY_FILE, generated, 'utf8');
 return { value: generated, isPersistent: true };
 } catch {
 if (!memorySecret) {
 memorySecret = generated;
 }
 return { value: memorySecret, isPersistent: false };
 }
}

function toCipherKey(secret: string) {
 return crypto.createHash('sha256').update(secret).digest();
}

async function encryptSecret(value: string) {
 const secret = await getSecretMaterial();
 const iv = crypto.randomBytes(12);
 const cipher = crypto.createCipheriv('aes-256-gcm', toCipherKey(secret.value), iv);
 const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
 const tag = cipher.getAuthTag();

 return {
 encrypted: [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join('.'),
 isPersistent: secret.isPersistent,
 };
}

async function decryptSecret(value: string) {
 const [ivPart, tagPart, encryptedPart] = value.split('.');
 const secret = await getSecretMaterial();
 const decipher = crypto.createDecipheriv('aes-256-gcm', toCipherKey(secret.value), Buffer.from(ivPart, 'base64'));
 decipher.setAuthTag(Buffer.from(tagPart, 'base64'));
 return Buffer.concat([decipher.update(Buffer.from(encryptedPart, 'base64')), decipher.final()]).toString('utf8');
}

async function readStoredState() {
 try {
 const raw = await fs.readFile(STORE_FILE, 'utf8');
 const parsed = cleanupExpiredSessions(JSON.parse(raw) as StoredIntegrationState);
 memoryState = parsed;
 return { state: parsed, isPersistent: true };
 } catch {
 memoryState = cleanupExpiredSessions(memoryState);
 return { state: memoryState, isPersistent: false };
 }
}

async function writeStoredState(nextState: StoredIntegrationState) {
 const normalized = cleanupExpiredSessions({
 ...nextState,
 updatedAt: new Date().toISOString(),
 });

 memoryState = normalized;

 try {
 await fs.mkdir(STORE_DIR, { recursive: true });
 await fs.writeFile(STORE_FILE, JSON.stringify(normalized, null, 2), 'utf8');
 return { state: normalized, isPersistent: true };
 } catch {
 return { state: normalized, isPersistent: false };
 }
}

function maskToken(token: string) {
 if (token.length <= 8) {
 return '********';
 }

 return token.slice(0, 4) + '******' + token.slice(-4);
}

function quoteFormulaValue(value: string) {
 return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function equalsFormula(fieldName: string, value: string) {
 return '{' + fieldName + '}=' + quoteFormulaValue(value);
}

function friendlyError(error: unknown, fallback = 'No pudimos completar la conexion ahora. Intenta nuevamente en unos minutos.') {
 const message = error instanceof Error ? error.message : String(error || '');

 if (message.includes('401') || message.includes('403')) {
 return 'No pudimos validar el token. Revisa los permisos del PAT e intenta nuevamente.';
 }

 if (message.toLowerCase().includes('fetch failed') || message.toLowerCase().includes('network') || message.includes('ENOTFOUND')) {
 return 'No pudimos comunicarnos con Airtable en este momento. Revisa tu conexion e intenta nuevamente.';
 }

 if (message.toLowerCase().includes('expir')) {
 return 'La sesion del asistente vencio. Volve a validar el token para continuar.';
 }

 return fallback;
}


function readMappedValue(fields: RawFields, fieldName?: string) {
 return fieldName ? fields[fieldName] : undefined;
}

function readStringValue(fields: RawFields, fieldName?: string) {
 const value = readMappedValue(fields, fieldName);

 if (Array.isArray(value)) {
 return value.length ? String(value[0]) : undefined;
 }

 if (value === undefined || value === null) {
 return undefined;
 }

 return String(value).trim() || undefined;
}

function readNumberValue(fields: RawFields, fieldName?: string) {
 const value = readMappedValue(fields, fieldName);
 const numberValue = typeof value === 'number' ? value : Number(value);
 return Number.isFinite(numberValue) ? numberValue : undefined;
}

function readBooleanValue(fields: RawFields, fieldName?: string) {
 const value = readMappedValue(fields, fieldName);

 if (typeof value === 'boolean') {
 return value;
 }

 if (typeof value === 'string') {
 const normalized = value.trim().toLowerCase();
 if (['si', 'true', '1', 'yes'].includes(normalized)) return true;
 if (['no', 'false', '0'].includes(normalized)) return false;
 }

 return undefined;
}

function readArrayValue(fields: RawFields, fieldName?: string) {
 const value = readMappedValue(fields, fieldName);

 if (Array.isArray(value)) {
 return value.map((item) => String(item));
 }

 if (typeof value === 'string') {
 try {
 const parsed = JSON.parse(value);
 if (Array.isArray(parsed)) {
 return parsed.map((item) => String(item));
 }
 } catch {}

 return value.split(',').map((item) => item.trim()).filter(Boolean);
 }

 return undefined;
}

function normalizeLotStatus(value?: string): LotStatus | undefined {
 if (!value) {
 return undefined;
 }

 const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
 if (normalized.includes('reserv')) return 'reservado';
 if (normalized.includes('vend')) return 'vendido';
 if (normalized.includes('consult')) return 'consultado';
 if (normalized.includes('dispon')) return 'disponible';
 return undefined;
}

function parseSiteMapValue(value: string | undefined, fallback: Development['siteMap']) {
 if (!value) {
 return fallback;
 }

 try {
 return JSON.parse(value) as Development['siteMap'];
 } catch {
 return fallback;
 }
}

function serializePreviewValue(value: unknown) {
 if (value === undefined || value === null) return null;
 if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
 if (Array.isArray(value)) return value.join(', ');
 return JSON.stringify(value);
}

function mapDevelopmentRecordWithMapping(record: RawRecord, mapping: AirtableFieldMapping['developments'], template?: Development): Development {
 const slug = readStringValue(record.fields, mapping.slug) || template?.slug || record.id;
 return {
 id: record.id,
 slug,
 name: readStringValue(record.fields, mapping.name) || template?.name || 'Loteo',
 location: readStringValue(record.fields, mapping.location) || template?.location || 'Argentina',
 province: readStringValue(record.fields, mapping.province) || template?.province || 'Cordoba',
 shortDescription: readStringValue(record.fields, mapping.short_description) || template?.shortDescription || 'Desarrollo comercial.',
 heroDescription: readStringValue(record.fields, mapping.hero_description) || template?.heroDescription || 'Desarrollo cargado desde Airtable.',
 generalStatus: readStringValue(record.fields, mapping.general_status) || template?.generalStatus || 'Comercializacion activa',
 coverTheme: readStringValue(record.fields, mapping.cover_theme) || template?.coverTheme || 'from-slate-900 via-sky-900 to-emerald-900',
 baseCurrency: (readStringValue(record.fields, mapping.base_currency) as Development['baseCurrency']) || template?.baseCurrency || 'ARS',
 amenities: readArrayValue(record.fields, mapping.amenities) || template?.amenities || [],
 siteMap: parseSiteMapValue(readStringValue(record.fields, mapping.site_map_json), template?.siteMap || { viewBox: '0 0 100 100', elements: [] }),
 lots: [],
 };
}

function mapLotRecordWithMapping(record: RawRecord, mapping: AirtableFieldMapping['lots'], template?: Lot): Lot {
 const lotCode = readStringValue(record.fields, mapping.lot_code) || template?.lotCode || record.id;
 return {
 id: record.id,
 lotCode,
 number: String(readStringValue(record.fields, mapping.lot_number) || template?.number || '00').padStart(2, '0'),
 block: readStringValue(record.fields, mapping.block) || template?.block || 'A',
 street: readStringValue(record.fields, mapping.street) || template?.street || 'Sin calle',
 area: readNumberValue(record.fields, mapping.surface_m2) || template?.area || 0,
 orientation: readStringValue(record.fields, mapping.orientation) || template?.orientation || 'Este',
 status: normalizeLotStatus(readStringValue(record.fields, mapping.status)) || template?.status || 'consultado',
 price: readNumberValue(record.fields, mapping.price) || template?.price || 0,
 currency: (readStringValue(record.fields, mapping.currency) as Lot['currency']) || template?.currency || 'ARS',
 financing: {
 available: readBooleanValue(record.fields, mapping.financing_available) ?? template?.financing.available ?? true,
 currency: (readStringValue(record.fields, mapping.currency) as Lot['currency']) || template?.financing.currency || 'ARS',
 downPayment: readNumberValue(record.fields, mapping.down_payment) || template?.financing.downPayment || 0,
 installments: readNumberValue(record.fields, mapping.installments_count) || template?.financing.installments || 0,
 installmentValue: readNumberValue(record.fields, mapping.installment_value) || template?.financing.installmentValue || 0,
 },
 description: readStringValue(record.fields, mapping.description) || template?.description || 'Lote con informacion comercial cargada desde Airtable.',
 notes: readStringValue(record.fields, mapping.notes) || template?.notes,
 mapPosition: {
 x: readNumberValue(record.fields, mapping.map_x) || template?.mapPosition.x || 0,
 y: readNumberValue(record.fields, mapping.map_y) || template?.mapPosition.y || 0,
 width: readNumberValue(record.fields, mapping.map_width) || template?.mapPosition.width || 120,
 height: readNumberValue(record.fields, mapping.map_height) || template?.mapPosition.height || 60,
 },
 };
}


function mapInquiryRecordWithMapping(record: RawRecord, mapping: AirtableFieldMapping['inquiries']): Lead {
 return {
 id: record.id,
 createdAt: record.createdTime,
 developmentSlug: readStringValue(record.fields, mapping.development_slug),
 lotCode: readStringValue(record.fields, mapping.lot_code),
 lotLabel: readStringValue(record.fields, mapping.lot_label),
 name: readStringValue(record.fields, mapping.name) || 'Sin nombre',
 phone: readStringValue(record.fields, mapping.phone) || '',
 email: readStringValue(record.fields, mapping.email) || '',
 message: readStringValue(record.fields, mapping.message) || '',
 source: (readStringValue(record.fields, mapping.source) as Lead['source']) || 'contacto',
 status: (readStringValue(record.fields, mapping.status) as Lead['status']) || 'nuevo',
 };
}

function buildDevelopmentsFromRecords(developmentRecords: RawRecord[], lotRecords: RawRecord[], fieldMapping: AirtableFieldMapping) {
 const lotsByDevelopment = new Map<string, Lot[]>();

 lotRecords.forEach((record) => {
 const lotCode = readStringValue(record.fields, fieldMapping.lots.lot_code) || record.id;
 const developmentSlug = readStringValue(record.fields, fieldMapping.lots.development_slug);
 const template = lotTemplateByCode.get(lotCode);
 const lot = mapLotRecordWithMapping(record, fieldMapping.lots, template);

 if (!developmentSlug) {
 return;
 }

 const bucket = lotsByDevelopment.get(developmentSlug) || [];
 bucket.push(lot);
 lotsByDevelopment.set(developmentSlug, bucket);
 });

 return developmentRecords.map((record) => {
 const slug = readStringValue(record.fields, fieldMapping.developments.slug) || record.id;
 const template = developmentTemplateBySlug.get(slug);
 return {
 ...mapDevelopmentRecordWithMapping(record, fieldMapping.developments, template),
 lots: lotsByDevelopment.get(slug) || template?.lots || [],
 };
 });
}

function buildLeadsFromRecords(records: RawRecord[], fieldMapping: AirtableFieldMapping) {
 return records.map((record) => mapInquiryRecordWithMapping(record, fieldMapping.inquiries));
}

function buildPreview(developmentRecords: RawRecord[], lotRecords: RawRecord[], inquiryRecords: RawRecord[], fieldMapping: AirtableFieldMapping): AirtablePreviewResult {
 const developments = developmentRecords.slice(0, 3).map((record) => {
 const mapped = mapDevelopmentRecordWithMapping(record, fieldMapping.developments, developmentTemplateBySlug.get(readStringValue(record.fields, fieldMapping.developments.slug) || ''));
 return { slug: serializePreviewValue(mapped.slug), name: serializePreviewValue(mapped.name), location: serializePreviewValue(mapped.location) };
 });

 const lots = lotRecords.slice(0, 3).map((record) => {
 const lotCode = readStringValue(record.fields, fieldMapping.lots.lot_code) || record.id;
 const mapped = mapLotRecordWithMapping(record, fieldMapping.lots, lotTemplateByCode.get(lotCode));
 return { lot_code: serializePreviewValue(mapped.lotCode), lot_number: serializePreviewValue(mapped.number), street: serializePreviewValue(mapped.street), surface_m2: serializePreviewValue(mapped.area), status: serializePreviewValue(mapped.status) };
 });

 const inquiries = inquiryRecords.slice(0, 3).map((record) => {
 const mapped = mapInquiryRecordWithMapping(record, fieldMapping.inquiries);
 return { name: serializePreviewValue(mapped.name), phone: serializePreviewValue(mapped.phone), email: serializePreviewValue(mapped.email), message: serializePreviewValue(mapped.message) };
 });

 const warnings: string[] = [];
 if (!developmentRecords.length) warnings.push('No encontramos registros en la tabla de loteos con el mapping actual.');
 if (!lotRecords.length) warnings.push('No encontramos registros en la tabla de lotes con el mapping actual.');

 return {
 counts: { developments: developmentRecords.length, lots: lotRecords.length, inquiries: inquiryRecords.length },
 examples: { developments, lots, inquiries },
 warnings,
 };
}

async function getWizardSession(sessionId: string) {
 const { state, isPersistent } = await readStoredState();
 const session = state.sessions.find((item) => item.id === sessionId);

 if (!session) {
 throw new Error('wizard-session-expired');
 }

 return { state, session, isPersistent };
}

async function buildConnectionSummary(config: AirtableIntegrationConfig, isPersistent: boolean): Promise<AirtableConnectionSummary> {
 const tokenMasked = config.mode === 'demo' ? 'Modo demo' : await decryptSecret(config.tokenEncrypted).then(maskToken).catch(() => 'PAT guardado');

 return {
 provider: 'airtable',
 status: config.status,
 source: 'saved',
 mode: config.mode,
 baseId: config.baseId,
 baseName: config.baseName,
 tokenMasked,
 tablesMapping: config.tablesMapping,
 fieldMapping: config.fieldMapping,
 lastTestAt: config.lastTestAt,
 lastSyncAt: config.lastSyncAt,
 lastError: config.lastError,
 isPersistent,
 canDisconnect: true,
 };
}

function buildEnvSummary(): AirtableConnectionSummary | null {
 const envConfig = getEnvAirtableConfig();

 if (!envConfig) {
 return null;
 }

 return {
 provider: 'airtable',
 status: 'connected',
 source: 'env',
 mode: 'live',
 baseId: envConfig.baseId,
 baseName: envConfig.baseId,
 tokenMasked: 'Configurado en el servidor',
 tablesMapping: buildIdentityTableMapping(envConfig.developmentsTable, envConfig.lotsTable, envConfig.inquiriesTable),
 fieldMapping: buildIdentityFieldMapping(),
 isPersistent: true,
 canDisconnect: false,
 };
}

async function getSavedConnection() {
 const { state, isPersistent } = await readStoredState();
 return { config: state.connection, state, isPersistent };
}

async function getActiveConnectionSource(): Promise<ActiveConnectionSource | null> {
 if (!airtableIntegrationEnabled) {
 return null;
 }

 const saved = await getSavedConnection();

 if (saved.config && saved.config.status === 'connected') {
 return {
 source: 'saved',
 mode: saved.config.mode,
 baseId: saved.config.baseId,
 baseName: saved.config.baseName,
 tokenMasked: saved.config.mode === 'demo' ? 'Modo demo' : 'PAT guardado',
 clientConfig: saved.config.mode === 'live' ? createAirtableClientConfig(await decryptSecret(saved.config.tokenEncrypted), Number(process.env.AIRTABLE_TIMEOUT_MS || 10000)) : undefined,
 tablesMapping: saved.config.tablesMapping,
 fieldMapping: saved.config.fieldMapping,
 isPersistent: saved.isPersistent,
 };
 }

 const envConfig = getEnvAirtableConfig();

 if (!envConfig) {
 return null;
 }

 return {
 source: 'env',
 mode: 'live',
 baseId: envConfig.baseId,
 baseName: envConfig.baseId,
 tokenMasked: 'Configurado en el servidor',
 clientConfig: createAirtableClientConfig(envConfig.apiKey, envConfig.timeoutMs),
 tablesMapping: buildIdentityTableMapping(envConfig.developmentsTable, envConfig.lotsTable, envConfig.inquiriesTable),
 fieldMapping: buildIdentityFieldMapping(),
 isPersistent: true,
 };
}

async function recordConnectionHealth(update: { status?: 'connected' | 'error'; lastError?: string; clearError?: boolean }) {
 const { config, state } = await getSavedConnection();

 if (!config) {
 return;
 }

 const nextConfig: AirtableIntegrationConfig = {
 ...config,
 ...(update.status ? { status: update.status } : {}),
 ...(update.clearError ? { lastError: undefined } : {}),
 ...(typeof update.lastError === 'string' ? { lastError: update.lastError } : {}),
 ...(update.status === 'connected' ? { lastSyncAt: new Date().toISOString() } : {}),
 updatedAt: new Date().toISOString(),
 };

 const shouldWriteSync = !config.lastSyncAt || Date.now() - new Date(config.lastSyncAt).getTime() > SYNC_WRITE_THROTTLE_MS;
 const shouldWriteError = update.status === 'error' && update.lastError !== config.lastError;

 if (update.status === 'connected' && !shouldWriteSync && !config.lastError) {
 return;
 }

 if (update.status === 'error' && !shouldWriteError) {
 return;
 }

 await writeStoredState({ ...state, connection: nextConfig });
}

async function listRecordsForSource(source: ActiveConnectionSource, tableName: string, tableKey: keyof AirtablePreviewResult['counts']) {
 if (source.mode === 'demo') {
 if (tableKey === 'developments') return demoRecords.developments;
 if (tableKey === 'lots') return demoRecords.lots;
 return demoRecords.inquiries;
 }

 if (!source.clientConfig) {
 return [];
 }

 return listAllRecordsWithConfig({ ...source.clientConfig, baseId: source.baseId }, tableName);
}

async function updateWizardSession(sessionId: string, updater: (session: AirtableWizardSession) => AirtableWizardSession) {
 const { state } = await getWizardSession(sessionId);
 const nextState = {
 ...state,
 sessions: state.sessions.map((session) => (session.id === sessionId ? updater(session) : session)),
 };

 return writeStoredState(nextState);
}


function ensureMappingIsComplete(tablesMapping: AirtableTableMapping, fieldMapping: AirtableFieldMapping) {
 const errors: string[] = [];

 if (!tablesMapping.developments) errors.push('Elegi la tabla que contiene los loteos.');
 if (!tablesMapping.lots) errors.push('Elegi la tabla que contiene los lotes.');
 if (!tablesMapping.inquiries) errors.push('Elegi la tabla que contiene las consultas.');
 developmentRequiredFields.forEach((field) => { if (!fieldMapping.developments[field]) errors.push('Completa el campo obligatorio ' + field + ' en loteos.'); });
 lotRequiredFields.forEach((field) => { if (!fieldMapping.lots[field]) errors.push('Completa el campo obligatorio ' + field + ' en lotes.'); });
 inquiryRequiredFields.forEach((field) => { if (!fieldMapping.inquiries[field]) errors.push('Completa el campo obligatorio ' + field + ' en consultas.'); });

 if (errors.length) {
 throw new Error(errors[0]);
 }
}

export async function getIntegrationConnectionSummary(): Promise<AirtableConnectionSummary> {
 if (!airtableIntegrationEnabled) {
 return { provider: 'airtable', status: 'not_connected', source: 'mock', mode: 'live', isPersistent: true, canDisconnect: false };
 }

 const { config, isPersistent } = await getSavedConnection();
 const secretState = await getSecretMaterial();

 if (config) {
 return await buildConnectionSummary(config, isPersistent && secretState.isPersistent);
 }

 return buildEnvSummary() || { provider: 'airtable', status: 'not_connected', source: 'mock', mode: 'live', isPersistent: true, canDisconnect: false };
}

export async function validateAirtableAccess(input: { token?: string; mode?: AirtableProviderMode }) {
 const mode = input.mode || 'live';
 let bases: AirtableBaseOption[] = [];
 let tokenMasked = 'Modo demo';
 let tokenEncrypted = (await encryptSecret('demo-token')).encrypted;

 if (mode === 'live') {
 const token = input.token?.trim();

 if (!token) {
 throw new Error('Pega el token de Airtable para continuar.');
 }

 const client = createAirtableClientConfig(token, Number(process.env.AIRTABLE_TIMEOUT_MS || 10000));
 bases = (await listBasesWithToken(client)).map((base) => ({ id: base.id, name: base.name, permissionLevel: base.permissionLevel }));

 if (!bases.length) {
 throw new Error('El token no tiene bases accesibles. Revisa los permisos e intenta nuevamente.');
 }

 tokenMasked = maskToken(token);
 tokenEncrypted = (await encryptSecret(token)).encrypted;
 } else {
 bases = [demoBase];
 }

 const session: AirtableWizardSession = {
 id: crypto.randomUUID(),
 provider: 'airtable',
 mode,
 createdAt: new Date().toISOString(),
 expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
 tokenEncrypted,
 tokenMasked,
 validationStatus: 'connected',
 bases,
 draftTablesMapping: mode === 'demo' ? demoTableMapping : undefined,
 draftFieldMapping: mode === 'demo' ? demoFieldMapping : buildEmptyFieldMapping(),
};

 const { state } = await readStoredState();
 await writeStoredState({ ...state, sessions: [session, ...state.sessions.filter((item) => item.id !== session.id)] });
 return { wizardSessionId: session.id, mode, tokenMasked, baseCount: bases.length };
}

export async function listAirtableWizardBases(wizardSessionId: string) {
 const { session } = await getWizardSession(wizardSessionId);

 if (session.mode === 'demo') {
 return { wizardSessionId: session.id, mode: session.mode, tokenMasked: session.tokenMasked, bases: session.bases || [demoBase] };
 }

 const token = await decryptSecret(session.tokenEncrypted);
 const client = createAirtableClientConfig(token, Number(process.env.AIRTABLE_TIMEOUT_MS || 10000));
 const bases = (await listBasesWithToken(client)).map((base) => ({ id: base.id, name: base.name, permissionLevel: base.permissionLevel }));
 await updateWizardSession(session.id, (current) => ({ ...current, bases }));
 return { wizardSessionId: session.id, mode: session.mode, tokenMasked: session.tokenMasked, bases };
}

export async function getAirtableWizardSchema(wizardSessionId: string, baseId: string) {
 const { session } = await getWizardSession(wizardSessionId);
 const base = (session.bases || [demoBase]).find((item) => item.id === baseId) || { id: baseId, name: baseId };

 const tables = session.mode === 'demo' ? demoTables : (await listBaseTablesWithToken(createAirtableClientConfig(await decryptSecret(session.tokenEncrypted), Number(process.env.AIRTABLE_TIMEOUT_MS || 10000)), baseId)).map((table: AirtableMetadataTable) => ({ id: table.id, name: table.name, fields: table.fields.map((field) => ({ id: field.id, name: field.name, type: field.type })) }));
 const tablesMapping = Object.keys(session.draftTablesMapping || {}).length ? session.draftTablesMapping || demoTableMapping : suggestTableMapping(tables);
 const hasDraftFields = Object.keys(session.draftFieldMapping?.developments || {}).length || Object.keys(session.draftFieldMapping?.lots || {}).length || Object.keys(session.draftFieldMapping?.inquiries || {}).length;
 const fieldMapping = hasDraftFields ? session.draftFieldMapping || buildEmptyFieldMapping() : suggestFieldMapping(tables, tablesMapping);

 await updateWizardSession(session.id, (current) => ({ ...current, selectedBase: base, tableCandidates: tables, draftTablesMapping: tablesMapping, draftFieldMapping: fieldMapping }));
 return { wizardSessionId: session.id, base, tables, suggestedTablesMapping: tablesMapping, suggestedFieldMapping: fieldMapping, fieldGroups: airtableFieldGroups };
}


export async function testAirtableMapping(input: { wizardSessionId: string; baseId: string; baseName?: string; tablesMapping: AirtableTableMapping; fieldMapping: AirtableFieldMapping }) {
 ensureMappingIsComplete(input.tablesMapping, input.fieldMapping);
 const { session } = await getWizardSession(input.wizardSessionId);
 const base = { id: input.baseId, name: input.baseName || session.selectedBase?.name || input.baseId };
 const source = session.mode === 'demo' ? ({ mode: 'demo', baseId: base.id } as const) : ({ mode: 'live', clientConfig: createAirtableClientConfig(await decryptSecret(session.tokenEncrypted), Number(process.env.AIRTABLE_TIMEOUT_MS || 10000)), baseId: base.id } as const);

 const developmentRecords = source.mode === 'demo' ? demoRecords.developments : await listAllRecordsWithConfig({ ...source.clientConfig, baseId: source.baseId }, input.tablesMapping.developments || '');
 const lotRecords = source.mode === 'demo' ? demoRecords.lots : await listAllRecordsWithConfig({ ...source.clientConfig, baseId: source.baseId }, input.tablesMapping.lots || '');
 const inquiryRecords = source.mode === 'demo' ? demoRecords.inquiries : await listAllRecordsWithConfig({ ...source.clientConfig, baseId: source.baseId }, input.tablesMapping.inquiries || '');

 const preview = buildPreview(developmentRecords as RawRecord[], lotRecords as RawRecord[], inquiryRecords as RawRecord[], input.fieldMapping);
 await updateWizardSession(session.id, (current) => ({ ...current, selectedBase: base, draftTablesMapping: input.tablesMapping, draftFieldMapping: input.fieldMapping, lastError: undefined }));
 return { wizardSessionId: session.id, base, tablesMapping: input.tablesMapping, fieldMapping: input.fieldMapping, preview };
}

export async function saveAirtableConnection(input: { wizardSessionId: string; baseId: string; baseName?: string; tablesMapping: AirtableTableMapping; fieldMapping: AirtableFieldMapping }) {
 const previewResult = await testAirtableMapping(input);
 const { state, session } = await getWizardSession(input.wizardSessionId);
 const now = new Date().toISOString();
 const nextConfig: AirtableIntegrationConfig = {
 provider: 'airtable',
 status: 'connected',
 mode: session.mode,
 baseId: input.baseId,
 baseName: input.baseName || session.selectedBase?.name || input.baseId,
 tokenEncrypted: session.tokenEncrypted,
 tablesMapping: input.tablesMapping,
 fieldMapping: input.fieldMapping,
 lastTestAt: now,
 lastSyncAt: now,
 lastError: undefined,
 createdAt: state.connection?.createdAt || now,
 updatedAt: now,
 };

 const writeResult = await writeStoredState({ ...state, connection: nextConfig, sessions: state.sessions.filter((item) => item.id !== session.id) });
 const secretState = await getSecretMaterial();
 return { summary: await buildConnectionSummary(nextConfig, writeResult.isPersistent && secretState.isPersistent), preview: previewResult.preview };
}

export async function retestSavedAirtableConnection() {
 const saved = await getSavedConnection();

 if (!saved.config) {
 throw new Error('Todavia no hay una conexion guardada para probar.');
 }

 try {
 ensureMappingIsComplete(saved.config.tablesMapping, saved.config.fieldMapping);

 const clientConfig = saved.config.mode === 'live'
 ? createAirtableClientConfig(await decryptSecret(saved.config.tokenEncrypted), Number(process.env.AIRTABLE_TIMEOUT_MS || 10000))
 : undefined;
 const liveClientConfig = clientConfig as AirtableClientConfig | undefined;

 const developmentRecords = saved.config.mode === 'demo'
 ? demoRecords.developments
 : await listAllRecordsWithConfig({ ...liveClientConfig!, baseId: saved.config.baseId }, saved.config.tablesMapping.developments || '');
 const lotRecords = saved.config.mode === 'demo'
 ? demoRecords.lots
 : await listAllRecordsWithConfig({ ...liveClientConfig!, baseId: saved.config.baseId }, saved.config.tablesMapping.lots || '');
 const inquiryRecords = saved.config.mode === 'demo'
 ? demoRecords.inquiries
 : await listAllRecordsWithConfig({ ...liveClientConfig!, baseId: saved.config.baseId }, saved.config.tablesMapping.inquiries || '');

 const preview = buildPreview(developmentRecords as RawRecord[], lotRecords as RawRecord[], inquiryRecords as RawRecord[], saved.config.fieldMapping);
 const now = new Date().toISOString();
 const nextConfig: AirtableIntegrationConfig = {
 ...saved.config,
 status: 'connected',
 lastTestAt: now,
 lastSyncAt: now,
 lastError: undefined,
 updatedAt: now,
 };

 const writeResult = await writeStoredState({ ...saved.state, connection: nextConfig });
 const secretState = await getSecretMaterial();
 return { summary: await buildConnectionSummary(nextConfig, writeResult.isPersistent && secretState.isPersistent), preview };
 } catch (error) {
 const now = new Date().toISOString();
 const nextConfig: AirtableIntegrationConfig = {
 ...saved.config,
 status: 'error',
 lastTestAt: now,
 lastError: friendlyError(error),
 updatedAt: now,
 };

 await writeStoredState({ ...saved.state, connection: nextConfig });
 throw new Error(nextConfig.lastError || 'No pudimos probar la conexion.');
 }
}

export async function disconnectAirtableConnection() {
 const { state } = await readStoredState();
 await writeStoredState({ ...state, connection: null });
 return { disconnected: true };
}


function buildMappedInquiryFields(input: LeadInput, mapping: AirtableFieldMapping['inquiries']) {
 const fields: RawFields = {};
 if (mapping.development_slug && input.developmentSlug) fields[mapping.development_slug] = input.developmentSlug;
 if (mapping.lot_code && input.lotCode) fields[mapping.lot_code] = input.lotCode;
 if (mapping.lot_label && input.lotLabel) fields[mapping.lot_label] = input.lotLabel;
 if (mapping.name) fields[mapping.name] = input.name;
 if (mapping.phone) fields[mapping.phone] = input.phone;
 if (mapping.email) fields[mapping.email] = input.email;
 if (mapping.message) fields[mapping.message] = input.message;
 if (mapping.source) fields[mapping.source] = input.source;
 if (mapping.status) fields[mapping.status] = 'nuevo';
 return fields;
}

function buildMappedLotPatch(patch: LotUpdateInput, mapping: AirtableFieldMapping['lots']) {
 const fields: RawFields = {};
 if (mapping.status && patch.status) fields[mapping.status] = patch.status;
 if (mapping.price && typeof patch.price === 'number') fields[mapping.price] = patch.price;
 if (mapping.down_payment && typeof patch.downPayment === 'number') fields[mapping.down_payment] = patch.downPayment;
 if (mapping.installments_count && typeof patch.installmentsCount === 'number') fields[mapping.installments_count] = patch.installmentsCount;
 if (mapping.installment_value && typeof patch.installmentValue === 'number') fields[mapping.installment_value] = patch.installmentValue;
 if (mapping.notes && typeof patch.notes === 'string') fields[mapping.notes] = patch.notes;
 return fields;
}

export async function loadDevelopmentsFromActiveAirtable() {
 const source = await getActiveConnectionSource();

 if (!source || !source.tablesMapping.developments || !source.tablesMapping.lots) {
 return null;
 }

 try {
 const developmentRecords = await listRecordsForSource(source, source.tablesMapping.developments, 'developments');
 const lotRecords = await listRecordsForSource(source, source.tablesMapping.lots, 'lots');
 const data = buildDevelopmentsFromRecords(developmentRecords as RawRecord[], lotRecords as RawRecord[], source.fieldMapping);
 if (source.source === 'saved') await recordConnectionHealth({ status: 'connected', clearError: true });
 return data;
 } catch (error) {
 if (source.source === 'saved') await recordConnectionHealth({ status: 'error', lastError: friendlyError(error) });
 throw error;
 }
}

export async function loadLeadsFromActiveAirtable() {
 const source = await getActiveConnectionSource();

 if (!source || !source.tablesMapping.inquiries) {
 return null;
 }

 try {
 const inquiryRecords = await listRecordsForSource(source, source.tablesMapping.inquiries, 'inquiries');
 const data = buildLeadsFromRecords(inquiryRecords as RawRecord[], source.fieldMapping);
 if (source.source === 'saved') await recordConnectionHealth({ status: 'connected', clearError: true });
 return data;
 } catch (error) {
 if (source.source === 'saved') await recordConnectionHealth({ status: 'error', lastError: friendlyError(error) });
 throw error;
 }
}

export async function createInquiryInActiveAirtable(input: LeadInput) {
 const source = await getActiveConnectionSource();

 if (!source || source.mode !== 'live' || !source.clientConfig || !source.tablesMapping.inquiries) {
 return null;
 }

 try {
 const created = await createRecordWithConfig({ ...source.clientConfig, baseId: source.baseId }, source.tablesMapping.inquiries, buildMappedInquiryFields(input, source.fieldMapping.inquiries));

 if (input.lotCode && source.tablesMapping.lots && source.fieldMapping.lots.lot_code) {
 const lotRecords = await listRecordsWithConfig<RawFields>({ ...source.clientConfig, baseId: source.baseId }, source.tablesMapping.lots, { filterByFormula: equalsFormula(source.fieldMapping.lots.lot_code, input.lotCode), pageSize: 1 });
 const lotRecord = lotRecords.records[0];
 if (lotRecord && source.fieldMapping.lots.status) {
 await updateRecordWithConfig({ ...source.clientConfig, baseId: source.baseId }, source.tablesMapping.lots, lotRecord.id, { [source.fieldMapping.lots.status]: 'consultado' });
 }
 }

 if (source.source === 'saved') await recordConnectionHealth({ status: 'connected', clearError: true });
 return mapInquiryRecordWithMapping(created as RawRecord, source.fieldMapping.inquiries);
 } catch (error) {
 if (source.source === 'saved') await recordConnectionHealth({ status: 'error', lastError: friendlyError(error) });
 throw error;
 }
}

export async function patchLotInActiveAirtable(lotCode: string, patch: LotUpdateInput) {
 const source = await getActiveConnectionSource();

 if (!source || source.mode !== 'live' || !source.clientConfig || !source.tablesMapping.lots || !source.fieldMapping.lots.lot_code) {
 return null;
 }

 try {
 const response = await listRecordsWithConfig<RawFields>({ ...source.clientConfig, baseId: source.baseId }, source.tablesMapping.lots, { filterByFormula: equalsFormula(source.fieldMapping.lots.lot_code, lotCode), pageSize: 1 });
 const record = response.records[0];
 if (!record) return null;
 const updated = await updateRecordWithConfig({ ...source.clientConfig, baseId: source.baseId }, source.tablesMapping.lots, record.id, buildMappedLotPatch(patch, source.fieldMapping.lots));
 if (source.source === 'saved') await recordConnectionHealth({ status: 'connected', clearError: true });
 return mapLotRecordWithMapping(updated as RawRecord, source.fieldMapping.lots, lotTemplateByCode.get(lotCode));
 } catch (error) {
 if (source.source === 'saved') await recordConnectionHealth({ status: 'error', lastError: friendlyError(error) });
 throw error;
 }
}


export function describeIntegrationError(error: unknown) {
 return friendlyError(error);
}
