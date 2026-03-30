import { NextRequest } from 'next/server';

import { patchProperty, removeProperty } from '@/lib/server/catalog';
import { jsonNoStore, readJson, rejectIfUnauthorizedAdmin } from '@/lib/server/http';
import { sanitizePropertyUpdateInput } from '@/lib/server/property-payload';

export const dynamic = 'force-dynamic';

interface RouteContext {
 params: Promise<{ propertyId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-properties-patch',
 limit: 40,
 windowMs: 1000 * 60 * 5,
 });

 if (unauthorized) {
 return unauthorized;
 }

 const body = await readJson<unknown>(request);

 if (!body) {
 return jsonNoStore({ error: 'Payload invalido' }, { status: 400 });
 }

 const parsed = sanitizePropertyUpdateInput(body);

 if ('error' in parsed) {
 return jsonNoStore({ error: parsed.error }, { status: 400 });
 }

 const { propertyId } = await context.params;
 const result = await patchProperty(propertyId, parsed.data);

 if (!result.data) {
 return jsonNoStore({ error: 'Propiedad no encontrada' }, { status: 404 });
 }

 return jsonNoStore({ data: result.data, meta: { source: result.source, fallback: result.fallback } });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-properties-delete',
 limit: 20,
 windowMs: 1000 * 60 * 10,
 });

 if (unauthorized) {
 return unauthorized;
 }

 const { propertyId } = await context.params;
 const result = await removeProperty(propertyId);

 if (!result.data) {
 return jsonNoStore({ error: 'Propiedad no encontrada' }, { status: 404 });
 }

 return jsonNoStore({ data: { deleted: true }, meta: { source: result.source, fallback: result.fallback } });
}
