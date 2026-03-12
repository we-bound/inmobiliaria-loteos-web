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
 updateMockLot,
} from '@/lib/server/mock-store';
import { Development, Lead, LeadInput, Lot, LotUpdateInput } from '@/types';

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
 const [developmentsResult, leadsResult] = await Promise.all([loadDevelopments(), loadLeads()]);

 return {
 developments: developmentsResult.data,
 leads: leadsResult.data,
 source: developmentsResult.source === 'airtable' || leadsResult.source === 'airtable' ? 'airtable' : 'mock',
 fallback: developmentsResult.fallback || leadsResult.fallback,
 };
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
