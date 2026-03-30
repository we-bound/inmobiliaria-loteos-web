import { mockDevelopments, mockLeads, mockProperties } from '@/data/mock-data';
import { Development, Lead, LeadInput, LotUpdateInput, Property, PropertyImage, PropertyUpsertInput, PropertyUpdateInput } from '@/types';

function clone<T>(value: T): T {
 return structuredClone(value);
}

let developmentsState: Development[] = clone(mockDevelopments);
let leadsState: Lead[] = clone(mockLeads);
let propertiesState: Property[] = clone(mockProperties);

function slugify(value: string) {
 return value
 .normalize('NFD')
 .replace(/[\u0300-\u036f]/g, '')
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/^-+|-+$/g, '')
 .slice(0, 72) || 'propiedad';
}

function sanitizePropertyImages(images: PropertyUpsertInput['images'], title: string): PropertyImage[] {
 const nextImages = images.map((image, index) => ({
 id: image.id || 'property-image-' + (index + 1) + '-' + Math.random().toString(36).slice(2, 8),
 url: image.url,
 alt: image.alt?.trim() || title,
 isCover: Boolean(image.isCover),
 }));

 if (nextImages.length === 0) {
 return [];
 }

 const coverIndex = nextImages.findIndex((image) => image.isCover);
 const normalizedCover = coverIndex >= 0 ? coverIndex : 0;

 return nextImages.map((image, index) => ({
 ...image,
 isCover: index === normalizedCover,
 }));
}

export function getMockDevelopments() {
 return clone(developmentsState);
}

export function getMockLeads() {
 return clone(leadsState);
}

export function getMockProperties() {
 return clone(propertiesState);
}

export function getMockDevelopmentBySlug(slug: string) {
 return getMockDevelopments().find((development) => development.slug === slug);
}

export function getMockPropertyBySlug(slug: string) {
 return getMockProperties().find((property) => property.slug === slug);
}

export function getMockPropertyById(propertyId: string) {
 return getMockProperties().find((property) => property.id === propertyId);
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

export function createMockProperty(input: PropertyUpsertInput) {
 const slugBase = input.slug?.trim() || slugify(input.title);
 const existingSlugs = new Set(propertiesState.map((property) => property.slug));
 let slug = slugBase;
 let suffix = 2;

 while (existingSlugs.has(slug)) {
 slug = slugBase + '-' + suffix;
 suffix += 1;
 }

 const property: Property = {
 id: 'property-' + (propertiesState.length + 1),
 slug,
 title: input.title,
 type: input.type,
 operation: input.operation,
 availability: input.availability,
 location: input.location,
 province: input.province,
 addressOrZone: input.addressOrZone,
 shortDescription: input.shortDescription,
 description: input.description,
 surfaceM2: input.surfaceM2,
 ...(typeof input.coveredM2 === 'number' ? { coveredM2: input.coveredM2 } : {}),
 ...(typeof input.bedrooms === 'number' ? { bedrooms: input.bedrooms } : {}),
 ...(typeof input.bathrooms === 'number' ? { bathrooms: input.bathrooms } : {}),
 ...(typeof input.parking === 'boolean' ? { parking: input.parking } : {}),
 ...(typeof input.price === 'number' ? { price: input.price } : {}),
 ...(input.currency ? { currency: input.currency } : {}),
 showPrice: input.showPrice,
 featured: input.featured,
 images: sanitizePropertyImages(input.images, input.title),
 ...(input.whatsappMessage ? { whatsappMessage: input.whatsappMessage } : {}),
 };

 propertiesState = [property, ...propertiesState];
 return clone(property);
}

export function updateMockProperty(propertyId: string, patch: PropertyUpdateInput) {
 let updated: Property | null = null;

 propertiesState = propertiesState.map((property) => {
 if (property.id !== propertyId) {
 return property;
 }

 const title = patch.title?.trim() || property.title;
 const nextImages = patch.images ? sanitizePropertyImages(patch.images, title) : property.images;

 updated = {
 ...property,
 ...(patch.slug?.trim() ? { slug: slugify(patch.slug) } : {}),
 ...(patch.title?.trim() ? { title: patch.title.trim() } : {}),
 ...(patch.type ? { type: patch.type } : {}),
 ...(patch.operation ? { operation: patch.operation } : {}),
 ...(patch.availability ? { availability: patch.availability } : {}),
 ...(patch.location?.trim() ? { location: patch.location.trim() } : {}),
 ...(patch.province?.trim() ? { province: patch.province.trim() } : {}),
 ...(patch.addressOrZone?.trim() ? { addressOrZone: patch.addressOrZone.trim() } : {}),
 ...(patch.shortDescription?.trim() ? { shortDescription: patch.shortDescription.trim() } : {}),
 ...(patch.description?.trim() ? { description: patch.description.trim() } : {}),
 ...(typeof patch.surfaceM2 === 'number' ? { surfaceM2: patch.surfaceM2 } : {}),
 ...(typeof patch.coveredM2 === 'number' ? { coveredM2: patch.coveredM2 } : patch.coveredM2 === undefined ? {} : {}),
 ...(typeof patch.bedrooms === 'number' ? { bedrooms: patch.bedrooms } : patch.bedrooms === undefined ? {} : {}),
 ...(typeof patch.bathrooms === 'number' ? { bathrooms: patch.bathrooms } : patch.bathrooms === undefined ? {} : {}),
 ...(typeof patch.parking === 'boolean' ? { parking: patch.parking } : {}),
 ...(typeof patch.price === 'number' ? { price: patch.price } : patch.price === undefined ? {} : { price: undefined }),
 ...(patch.currency ? { currency: patch.currency } : {}),
 ...(typeof patch.showPrice === 'boolean' ? { showPrice: patch.showPrice } : {}),
 ...(typeof patch.featured === 'boolean' ? { featured: patch.featured } : {}),
 ...(patch.images ? { images: nextImages } : {}),
 ...(typeof patch.whatsappMessage === 'string' ? { whatsappMessage: patch.whatsappMessage } : patch.whatsappMessage === undefined ? {} : { whatsappMessage: undefined }),
 };

 return updated;
 });

 return updated ? clone(updated) : null;
}

export function deleteMockProperty(propertyId: string) {
 const exists = propertiesState.some((property) => property.id === propertyId);

 if (!exists) {
 return false;
 }

 propertiesState = propertiesState.filter((property) => property.id !== propertyId);
 return true;
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
