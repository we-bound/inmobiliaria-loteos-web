import { unstable_noStore as noStore } from 'next/cache';

import {
 createInquiryInActiveAirtable,
 loadDevelopmentsFromActiveAirtable,
 loadLeadsFromActiveAirtable,
 patchLotInActiveAirtable,
} from '@/lib/server/airtable-integration';
import {
 createMockLead,
 getMockDevelopmentBySlug,
 getMockDevelopments,
 getMockLeads,
 getMockLotByCode,
 getMockLots,
 getMockProperties,
 getMockPropertyById,
 getMockPropertyBySlug,
 createMockProperty,
 updateMockProperty,
 deleteMockProperty,
 updateMockLot,
} from '@/lib/server/mock-store';
import { Development, Lead, LeadInput, Lot, LotUpdateInput, Property, PropertyUpdateInput, PropertyUpsertInput } from '@/types';

export type CatalogSource = 'airtable' | 'mock';

export interface CatalogResult<T> {
 data: T;
 source: CatalogSource;
 fallback: boolean;
}

function logFallback(scope: string, error: unknown) {
 console.error('[catalog] ' + scope + ' -> fallback a mocks', error);
}

export async function loadDevelopments(): Promise<CatalogResult<Development[]>> {
 noStore();

 try {
 const developments = await loadDevelopmentsFromActiveAirtable();

 if (developments) {
 return { data: developments, source: 'airtable', fallback: false };
 }

 return { data: getMockDevelopments(), source: 'mock', fallback: false };
 } catch (error) {
 logFallback('loadDevelopments', error);
 return { data: getMockDevelopments(), source: 'mock', fallback: true };
 }
}

export async function loadLeads(): Promise<CatalogResult<Lead[]>> {
 noStore();

 try {
 const leads = await loadLeadsFromActiveAirtable();

 if (leads) {
 return { data: leads, source: 'airtable', fallback: false };
 }

 return { data: getMockLeads(), source: 'mock', fallback: false };
 } catch (error) {
 logFallback('loadLeads', error);
 return { data: getMockLeads(), source: 'mock', fallback: true };
 }
}

export async function loadDevelopmentBySlug(slug: string): Promise<CatalogResult<Development | undefined>> {
 const result = await loadDevelopments();
 const development = result.data.find((item) => item.slug === slug);

 if (development) {
 return { data: development, source: result.source, fallback: result.fallback };
 }

 const fallback = getMockDevelopmentBySlug(slug);
 return { data: fallback, source: fallback ? 'mock' : result.source, fallback: true };
}

export async function loadLots(developmentSlug?: string): Promise<CatalogResult<Lot[]>> {
 const result = await loadDevelopments();

 return {
 data: developmentSlug ? result.data.find((development) => development.slug === developmentSlug)?.lots || [] : result.data.flatMap((development) => development.lots),
 source: result.source,
 fallback: result.fallback,
 };
}

export async function loadLotByCode(lotCode: string): Promise<CatalogResult<Lot | undefined>> {
 const result = await loadLots();
 const lot = result.data.find((item) => item.lotCode === lotCode);

 if (lot) {
 return { data: lot, source: result.source, fallback: result.fallback };
 }

 const fallback = getMockLotByCode(lotCode);
 return { data: fallback, source: fallback ? 'mock' : result.source, fallback: true };
}

export async function loadAppBootstrapData() {
 noStore();
 const [developmentsResult, propertiesResult, leadsResult] = await Promise.all([loadDevelopments(), loadProperties(), loadLeads()]);

 return {
 developments: developmentsResult.data,
 properties: propertiesResult.data,
 leads: leadsResult.data,
 source: developmentsResult.source === 'airtable' || leadsResult.source === 'airtable' ? 'airtable' : 'mock',
 fallback: developmentsResult.fallback || propertiesResult.fallback || leadsResult.fallback,
 };
}

export async function loadProperties(): Promise<CatalogResult<Property[]>> {
 noStore();
 return { data: getMockProperties(), source: 'mock', fallback: false };
}

export async function loadPropertyBySlug(slug: string): Promise<CatalogResult<Property | undefined>> {
 const result = await loadProperties();
 const property = result.data.find((item) => item.slug === slug);

 if (property) {
 return { data: property, source: result.source, fallback: result.fallback };
 }

 const fallback = getMockPropertyBySlug(slug);
 return { data: fallback, source: fallback ? 'mock' : result.source, fallback: true };
}

export async function createProperty(input: PropertyUpsertInput): Promise<CatalogResult<Property>> {
 return { data: createMockProperty(input), source: 'mock', fallback: false };
}

export async function patchProperty(propertyId: string, patch: PropertyUpdateInput): Promise<CatalogResult<Property | null>> {
 const existing = getMockPropertyById(propertyId);

 if (!existing) {
 return { data: null, source: 'mock', fallback: false };
 }

 const normalizedPatch: PropertyUpdateInput = { ...patch };

 if (patch.slug && patch.slug !== existing.slug) {
 const duplicated = getMockProperties().find((property) => property.slug === patch.slug && property.id !== propertyId);
 if (duplicated) {
 normalizedPatch.slug = patch.slug + '-' + propertyId;
 }
 }

 return { data: updateMockProperty(propertyId, normalizedPatch), source: 'mock', fallback: false };
}

export async function removeProperty(propertyId: string): Promise<CatalogResult<boolean>> {
 return { data: deleteMockProperty(propertyId), source: 'mock', fallback: false };
}

export async function createInquiry(input: LeadInput): Promise<CatalogResult<Lead>> {
 try {
 const lead = await createInquiryInActiveAirtable(input);

 if (lead) {
 return { data: lead, source: 'airtable', fallback: false };
 }

 return { data: createMockLead(input), source: 'mock', fallback: false };
 } catch (error) {
 logFallback('createInquiry', error);
 return { data: createMockLead(input), source: 'mock', fallback: true };
 }
}

export async function patchLot(lotCode: string, patch: LotUpdateInput): Promise<CatalogResult<Lot | null>> {
 try {
 const lot = await patchLotInActiveAirtable(lotCode, patch);

 if (lot) {
 return { data: lot, source: 'airtable', fallback: false };
 }

 return { data: updateMockLot(lotCode, patch), source: 'mock', fallback: false };
 } catch (error) {
 logFallback('patchLot', error);
 return { data: updateMockLot(lotCode, patch), source: 'mock', fallback: true };
 }
}

export function getMockFallbackLots(developmentSlug?: string) {
 return getMockLots(developmentSlug);
}
