import { NextRequest } from 'next/server';

import { createInquiry } from '@/lib/server/catalog';
import {
 isAllowedOrigin,
 jsonNoStore,
 normalizeEmail,
 normalizeOptionalString,
 normalizePhone,
 readJson,
 rejectIfRateLimited,
} from '@/lib/server/http';
import { LeadInput, LeadSource } from '@/types';

export const dynamic = 'force-dynamic';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedSources: LeadSource[] = ['lote', 'contacto', 'alerta', 'propiedad'];

interface InquiryPayload extends Partial<LeadInput> {
 company?: string;
 startedAt?: number | string;
}

function buildDefaultMessage(source: LeadSource, lotLabel?: string, propertyLabel?: string) {
 if (source === 'alerta') {
 return lotLabel ? 'Quiero recibir una alerta si vuelve a aparecer ' + lotLabel + ' o un lote similar.' : 'Quiero recibir alertas cuando aparezcan lotes similares.';
 }

 if (source === 'lote' && lotLabel) {
 return 'Quiero recibir precio, anticipo y cuotas de ' + lotLabel + '.';
 }

 if (source === 'propiedad' && propertyLabel) {
 return 'Quiero recibir mas informacion y coordinar una visita para ' + propertyLabel + '.';
 }

 return 'Quiero recibir mas informacion comercial.';
}

export async function POST(request: NextRequest) {
 if (!isAllowedOrigin(request)) {
 return jsonNoStore({ error: 'Origen no permitido' }, { status: 403 });
 }

 const rateLimited = rejectIfRateLimited(request, {
 bucket: 'public-inquiries',
 limit: 6,
 windowMs: 1000 * 60 * 10,
 message: 'Recibimos muchas consultas desde esta conexion. Intenta nuevamente en unos minutos.',
 });

 if (rateLimited) {
 return rateLimited;
 }

 const body = await readJson<InquiryPayload>(request);

 if (!body) {
 return jsonNoStore({ error: 'Payload invalido' }, { status: 400 });
 }

 const honeypot = normalizeOptionalString(body.company, 120);
 if (honeypot) {
 return jsonNoStore({ data: { ignored: true } }, { status: 202 });
 }

 const startedAt = typeof body.startedAt === 'number' ? body.startedAt : Number(body.startedAt);
 if (Number.isFinite(startedAt) && Date.now() - startedAt < 1200) {
 return jsonNoStore({ error: 'Tomate un segundo para completar la consulta y vuelve a intentarlo.' }, { status: 400 });
 }

 const name = normalizeOptionalString(body.name, 120);
 const phone = normalizePhone(body.phone, 32);
 const email = normalizeEmail(body.email, 120);
 const source = allowedSources.includes(body.source as LeadSource) ? (body.source as LeadSource) : undefined;
 const lotLabel = normalizeOptionalString(body.lotLabel, 80);
 const propertyLabel = normalizeOptionalString(body.propertyLabel, 120);
 const message = normalizeOptionalString(body.message, 1200) || (source ? buildDefaultMessage(source, lotLabel, propertyLabel) : '');

 if (!name || !phone || !email || !source || !emailPattern.test(email)) {
 return jsonNoStore({ error: 'Revisa nombre, telefono y email antes de enviar la consulta.' }, { status: 400 });
 }

 const input: LeadInput = {
 developmentSlug: normalizeOptionalString(body.developmentSlug, 120),
 lotId: normalizeOptionalString(body.lotId, 120),
 lotCode: normalizeOptionalString(body.lotCode, 120),
 lotLabel,
 propertyId: normalizeOptionalString(body.propertyId, 120),
 propertySlug: normalizeOptionalString(body.propertySlug, 120),
 propertyLabel,
 name,
 phone,
 email,
 message,
 source,
 };

 const result = await createInquiry(input);
 return jsonNoStore({ data: result.data, meta: { source: result.source, fallback: result.fallback } }, { status: 201 });
}
