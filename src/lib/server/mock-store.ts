import { mockDevelopments, mockLeads } from '@/data/mock-data';
import { Development, Lead, LeadInput, LotUpdateInput } from '@/types';

function clone<T>(value: T): T {
 return structuredClone(value);
}

let developmentsState: Development[] = clone(mockDevelopments);
let leadsState: Lead[] = clone(mockLeads);

export function getMockDevelopments() {
 return clone(developmentsState);
}

export function getMockLeads() {
 return clone(leadsState);
}

export function getMockDevelopmentBySlug(slug: string) {
 return getMockDevelopments().find((development) => development.slug === slug);
}

export function getMockLots(developmentSlug?: string) {
 const developments = getMockDevelopments();
 return developmentSlug ? (developments.find((item) => item.slug === developmentSlug)?.lots ?? []) : developments.flatMap((item) => item.lots);
}

export function getMockLotByCode(lotCode: string) {
 return getMockLots().find((lot) => lot.lotCode === lotCode);
}

export function createMockLead(input: LeadInput) {
 const lead: Lead = {
 id: 'lead-' + (leadsState.length + 1),
 createdAt: new Date().toISOString(),
 status: 'nuevo',
 ...input,
 };

 leadsState = [lead, ...leadsState];

 if (input.source === 'lote' && input.developmentSlug && input.lotCode) {
 developmentsState = developmentsState.map((development) => ({
 ...development,
 lots: development.lots.map((lot) =>
 development.slug === input.developmentSlug && lot.lotCode === input.lotCode && lot.status === 'disponible'
 ? { ...lot, status: 'consultado' }
 : lot,
 ),
 }));
 }

 return clone(lead);
}

export function updateMockLot(lotCode: string, patch: LotUpdateInput) {
 let updated = null as null | Development['lots'][number];

 developmentsState = developmentsState.map((development) => ({
 ...development,
 lots: development.lots.map((lot) => {
 if (lot.lotCode !== lotCode) return lot;

 updated = {
 ...lot,
 ...(patch.status ? { status: patch.status } : {}),
 ...(typeof patch.price === 'number' ? { price: patch.price } : {}),
 ...(typeof patch.notes === 'string' ? { notes: patch.notes } : {}),
 financing: {
 ...lot.financing,
 ...(typeof patch.downPayment === 'number' ? { downPayment: patch.downPayment } : {}),
 ...(typeof patch.installmentsCount === 'number' ? { installments: patch.installmentsCount } : {}),
 ...(typeof patch.installmentValue === 'number' ? { installmentValue: patch.installmentValue } : {}),
 },
 };

 return updated;
 }),
 }));

 return updated ? clone(updated) : null;
}
