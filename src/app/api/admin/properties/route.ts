import { NextRequest } from 'next/server';

import { createProperty } from '@/lib/server/catalog';
import { jsonNoStore, readJson, rejectIfUnauthorizedAdmin } from '@/lib/server/http';
import { sanitizePropertyCreateInput } from '@/lib/server/property-payload';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-properties-create',
 limit: 20,
 windowMs: 1000 * 60 * 10,
 });

 if (unauthorized) {
 return unauthorized;
 }

 const body = await readJson<unknown>(request);

 if (!body) {
 return jsonNoStore({ error: 'Payload invalido' }, { status: 400 });
 }

 const parsed = sanitizePropertyCreateInput(body);

 if ('error' in parsed) {
 return jsonNoStore({ error: parsed.error }, { status: 400 });
 }

 const result = await createProperty(parsed.data);
 return jsonNoStore({ data: result.data, meta: { source: result.source, fallback: result.fallback } }, { status: 201 });
}
