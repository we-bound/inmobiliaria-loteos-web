import {
 Currency,
 PropertyAvailability,
 PropertyImageInput,
 PropertyOperation,
 PropertyType,
 PropertyUpsertInput,
 PropertyUpdateInput,
} from '@/types';
import { normalizeOptionalString } from '@/lib/server/http';

const propertyTypes: PropertyType[] = ['casa', 'departamento', 'cabana'];
const propertyOperations: PropertyOperation[] = ['alquiler', 'venta'];
const propertyAvailabilities: PropertyAvailability[] = ['disponible', 'reservada', 'cerrada', 'oculta'];
const currencies: Currency[] = ['ARS', 'USD'];
const maxImages = 6;
const maxImageLength = 1_500_000;

function parseNumber(value: unknown) {
 if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
 return value;
 }

 return undefined;
}

function parseBoolean(value: unknown) {
 return typeof value === 'boolean' ? value : undefined;
}

function isValidImageUrl(value: string) {
 return value.startsWith('data:image/') || value.startsWith('https://') || value.startsWith('http://');
}

function sanitizeImages(value: unknown, fallbackAlt: string) {
 if (!Array.isArray(value) || value.length === 0 || value.length > maxImages) {
 return undefined;
 }

 const images: PropertyImageInput[] = value
 .map((entry, index) => {
 const image = entry as Partial<PropertyImageInput>;
 const url = typeof image.url === 'string' ? image.url.trim() : '';

 if (!url || url.length > maxImageLength || !isValidImageUrl(url)) {
 return null;
 }

 return {
 id: typeof image.id === 'string' && image.id.trim() ? image.id.trim() : 'property-image-' + (index + 1),
 url,
 alt: normalizeOptionalString(image.alt, 140) || fallbackAlt,
 isCover: Boolean(image.isCover),
 };
 })
 .filter(Boolean) as PropertyImageInput[];

 if (images.length === 0) {
 return undefined;
 }

 const coverIndex = images.findIndex((image) => image.isCover);
 const normalizedCover = coverIndex >= 0 ? coverIndex : 0;

 return images.map((image, index) => ({
 ...image,
 isCover: index === normalizedCover,
 }));
}

export function sanitizePropertyCreateInput(body: unknown) {
 const payload = (body || {}) as Partial<Record<keyof PropertyUpsertInput, unknown>>;
 const title = normalizeOptionalString(payload.title, 120);

 if (!title) {
 return { error: 'Ingresa un titulo para la propiedad.' } as const;
 }

 const images = sanitizeImages(payload.images, title);
 const input: PropertyUpsertInput = {
 title,
 type: propertyTypes.includes(payload.type as PropertyType) ? (payload.type as PropertyType) : 'casa',
 operation: propertyOperations.includes(payload.operation as PropertyOperation) ? (payload.operation as PropertyOperation) : 'alquiler',
 availability: propertyAvailabilities.includes(payload.availability as PropertyAvailability) ? (payload.availability as PropertyAvailability) : 'disponible',
 location: normalizeOptionalString(payload.location, 120) || '',
 province: normalizeOptionalString(payload.province, 80) || '',
 addressOrZone: normalizeOptionalString(payload.addressOrZone, 140) || '',
 shortDescription: normalizeOptionalString(payload.shortDescription, 180) || '',
 description: normalizeOptionalString(payload.description, 1200) || '',
 surfaceM2: parseNumber(payload.surfaceM2) || 0,
 showPrice: Boolean(payload.showPrice),
 featured: Boolean(payload.featured),
 images: images || [],
 };

 if (!input.location || !input.province || !input.addressOrZone || !input.shortDescription || !input.description || !input.surfaceM2 || input.images.length === 0) {
 return { error: 'Revisa ubicacion, descripcion, superficie e imagenes antes de guardar.' } as const;
 }

 if (typeof parseNumber(payload.coveredM2) === 'number') {
 input.coveredM2 = parseNumber(payload.coveredM2);
 }

 if (typeof parseNumber(payload.bedrooms) === 'number') {
 input.bedrooms = parseNumber(payload.bedrooms);
 }

 if (typeof parseNumber(payload.bathrooms) === 'number') {
 input.bathrooms = parseNumber(payload.bathrooms);
 }

 if (typeof parseBoolean(payload.parking) === 'boolean') {
 input.parking = parseBoolean(payload.parking);
 }

 if (typeof parseNumber(payload.price) === 'number') {
 input.price = parseNumber(payload.price);
 }

 if (currencies.includes(payload.currency as Currency)) {
 input.currency = payload.currency as Currency;
 }

 const slug = normalizeOptionalString(payload.slug, 120);
 if (slug) {
 input.slug = slug;
 }

 const whatsappMessage = normalizeOptionalString(payload.whatsappMessage, 240);
 if (whatsappMessage) {
 input.whatsappMessage = whatsappMessage;
 }

 if (input.featured && input.images.length === 0) {
 return { error: 'Las propiedades destacadas necesitan una portada.' } as const;
 }

 return { data: input } as const;
}

export function sanitizePropertyUpdateInput(body: unknown) {
 const payload = (body || {}) as Partial<Record<keyof PropertyUpdateInput, unknown>>;
 const patch: PropertyUpdateInput = {};

 if (typeof payload.title === 'string') {
 const title = normalizeOptionalString(payload.title, 120);
 if (!title) {
 return { error: 'El titulo no puede quedar vacio.' } as const;
 }
 patch.title = title;
 }

 const slug = normalizeOptionalString(payload.slug, 120);
 if (typeof payload.slug === 'string' && slug) {
 patch.slug = slug;
 }

 if (propertyTypes.includes(payload.type as PropertyType)) {
 patch.type = payload.type as PropertyType;
 }

 if (propertyOperations.includes(payload.operation as PropertyOperation)) {
 patch.operation = payload.operation as PropertyOperation;
 }

 if (propertyAvailabilities.includes(payload.availability as PropertyAvailability)) {
 patch.availability = payload.availability as PropertyAvailability;
 }

 const location = normalizeOptionalString(payload.location, 120);
 if (typeof payload.location === 'string' && location) {
 patch.location = location;
 }

 const province = normalizeOptionalString(payload.province, 80);
 if (typeof payload.province === 'string' && province) {
 patch.province = province;
 }

 const addressOrZone = normalizeOptionalString(payload.addressOrZone, 140);
 if (typeof payload.addressOrZone === 'string' && addressOrZone) {
 patch.addressOrZone = addressOrZone;
 }

 const shortDescription = normalizeOptionalString(payload.shortDescription, 180);
 if (typeof payload.shortDescription === 'string' && shortDescription) {
 patch.shortDescription = shortDescription;
 }

 const description = normalizeOptionalString(payload.description, 1200);
 if (typeof payload.description === 'string' && description) {
 patch.description = description;
 }

 if (typeof parseNumber(payload.surfaceM2) === 'number') {
 patch.surfaceM2 = parseNumber(payload.surfaceM2);
 }

 if (typeof parseNumber(payload.coveredM2) === 'number') {
 patch.coveredM2 = parseNumber(payload.coveredM2);
 }

 if (typeof parseNumber(payload.bedrooms) === 'number') {
 patch.bedrooms = parseNumber(payload.bedrooms);
 }

 if (typeof parseNumber(payload.bathrooms) === 'number') {
 patch.bathrooms = parseNumber(payload.bathrooms);
 }

 if (typeof parseBoolean(payload.parking) === 'boolean') {
 patch.parking = parseBoolean(payload.parking);
 }

 if (typeof parseNumber(payload.price) === 'number') {
 patch.price = parseNumber(payload.price);
 }

 if (currencies.includes(payload.currency as Currency)) {
 patch.currency = payload.currency as Currency;
 }

 if (typeof payload.showPrice === 'boolean') {
 patch.showPrice = payload.showPrice;
 }

 if (typeof payload.featured === 'boolean') {
 patch.featured = payload.featured;
 }

 if (Array.isArray(payload.images)) {
 const images = sanitizeImages(payload.images, patch.title || 'Propiedad');
 if (!images) {
 return { error: 'Revisa la galeria de imagenes antes de guardar.' } as const;
 }
 patch.images = images;
 }

 if (typeof payload.whatsappMessage === 'string') {
 patch.whatsappMessage = normalizeOptionalString(payload.whatsappMessage, 240);
 }

 if (Object.keys(patch).length === 0) {
 return { error: 'No hay cambios validos para aplicar.' } as const;
 }

 if (patch.featured && Array.isArray(patch.images) && patch.images.length === 0) {
 return { error: 'Las propiedades destacadas necesitan una portada.' } as const;
 }

 return { data: patch } as const;
}
