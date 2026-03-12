const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

export interface AirtableRecord<TFields> {
 id: string;
 createdTime: string;
 fields: TFields;
}

export interface AirtableListResponse<TFields> {
 records: Array<AirtableRecord<TFields>>;
 offset?: string;
}

export interface AirtableClientConfig {
 apiKey: string;
 timeoutMs: number;
}

export interface AirtableConfig extends AirtableClientConfig {
 baseId: string;
 developmentsTable: string;
 lotsTable: string;
 inquiriesTable: string;
}

export interface AirtableMetadataBase {
 id: string;
 name: string;
 permissionLevel?: string;
}

export interface AirtableMetadataField {
 id: string;
 name: string;
 type?: string;
}

export interface AirtableMetadataTable {
 id: string;
 name: string;
 fields: AirtableMetadataField[];
}

interface AirtableBasesResponse {
 bases: AirtableMetadataBase[];
}

interface AirtableTablesResponse {
 tables: AirtableMetadataTable[];
}

export function getAirtableConfig(): AirtableConfig | null {
 const apiKey = process.env.AIRTABLE_API_KEY;
 const baseId = process.env.AIRTABLE_BASE_ID;

 if (!apiKey || !baseId) {
 return null;
 }

 return {
 apiKey,
 baseId,
 developmentsTable: process.env.AIRTABLE_DEVELOPMENTS_TABLE || 'Developments',
 lotsTable: process.env.AIRTABLE_LOTS_TABLE || 'Lots',
 inquiriesTable: process.env.AIRTABLE_INQUIRIES_TABLE || 'Inquiries',
 timeoutMs: Number(process.env.AIRTABLE_TIMEOUT_MS || 10000),
 };
}

export function isAirtableConfigured() {
 return Boolean(getAirtableConfig());
}

export function createAirtableClientConfig(apiKey: string, timeoutMs = 10000): AirtableClientConfig {
 return { apiKey, timeoutMs };
}

function buildBaseUrl(baseId: string, table: string, query?: Record<string, string | number | undefined>) {
 const url = new URL(AIRTABLE_API_BASE + '/' + encodeURIComponent(baseId) + '/' + encodeURIComponent(table));

 if (query) {
 Object.entries(query).forEach(([key, value]) => {
 if (value !== undefined && value !== '') {
 url.searchParams.set(key, String(value));
 }
 });
 }

 return url;
}

function buildMetaUrl(pathname: string, query?: Record<string, string | number | undefined>) {
 const url = new URL(AIRTABLE_API_BASE + pathname);

 if (query) {
 Object.entries(query).forEach(([key, value]) => {
 if (value !== undefined && value !== '') {
 url.searchParams.set(key, String(value));
 }
 });
 }

 return url;
}

async function airtableRequest<TResponse>(config: AirtableClientConfig, url: URL, init?: RequestInit) {
 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

 try {
 const response = await fetch(url, {
 ...init,
 cache: 'no-store',
 signal: controller.signal,
 headers: {
 Authorization: 'Bearer ' + config.apiKey,
 'Content-Type': 'application/json',
 ...(init?.headers || {}),
 },
 });

 if (!response.ok) {
 const body = await response.text();
 throw new Error('Airtable error ' + response.status + ': ' + body);
 }

 return (await response.json()) as TResponse;
 } finally {
 clearTimeout(timeout);
 }
}

export async function listRecordsWithConfig<TFields>(config: AirtableClientConfig & { baseId: string }, table: string, query?: Record<string, string | number | undefined>) {
 return airtableRequest<AirtableListResponse<TFields>>(config, buildBaseUrl(config.baseId, table, query));
}

export async function createRecordWithConfig<TFields>(config: AirtableClientConfig & { baseId: string }, table: string, fields: TFields) {
 return airtableRequest<AirtableRecord<TFields>>(config, buildBaseUrl(config.baseId, table), {
 method: 'POST',
 body: JSON.stringify({ fields }),
 });
}


export async function updateRecordWithConfig<TFields>(config: AirtableClientConfig & { baseId: string }, table: string, recordId: string, fields: Partial<TFields>) {
 const url = buildBaseUrl(config.baseId, table);
 url.pathname += '/' + recordId;

 return airtableRequest<AirtableRecord<TFields>>(config, url, {
 method: 'PATCH',
 body: JSON.stringify({ fields }),
 });
}

export async function listAllRecordsWithConfig<TFields>(config: AirtableClientConfig & { baseId: string }, table: string, query?: Record<string, string | number | undefined>) {
 const records: Array<AirtableRecord<TFields>> = [];
 let offset: string | undefined;

 do {
 const response = await listRecordsWithConfig<TFields>(config, table, {
 ...query,
 ...(offset ? { offset } : {}),
 });

 records.push(...response.records);
 offset = response.offset;
 } while (offset);

 return records;
}

export async function listBasesWithToken(config: AirtableClientConfig) {
 const response = await airtableRequest<AirtableBasesResponse>(config, buildMetaUrl('/meta/bases'));
 return response.bases;
}

export async function listBaseTablesWithToken(config: AirtableClientConfig, baseId: string) {
 const response = await airtableRequest<AirtableTablesResponse>(config, buildMetaUrl('/meta/bases/' + encodeURIComponent(baseId) + '/tables'));
 return response.tables;
}

export async function listRecords<TFields>(table: string, query?: Record<string, string | number | undefined>) {
 const config = getAirtableConfig();

 if (!config) {
 throw new Error('Airtable no configurado');
 }

 return listRecordsWithConfig<TFields>(config, table, query);
}

export async function createRecord<TFields>(table: string, fields: TFields) {
 const config = getAirtableConfig();

 if (!config) {
 throw new Error('Airtable no configurado');
 }

 return createRecordWithConfig<TFields>(config, table, fields);
}

export async function updateRecord<TFields>(table: string, recordId: string, fields: Partial<TFields>) {
 const config = getAirtableConfig();

 if (!config) {
 throw new Error('Airtable no configurado');
 }

 return updateRecordWithConfig<TFields>(config, table, recordId, fields);
}
