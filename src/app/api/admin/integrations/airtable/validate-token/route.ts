import { NextRequest } from 'next/server';

import { airtableIntegrationEnabled, airtableIntegrationHiddenMessage } from '@/lib/features';
import { describeIntegrationError, validateAirtableAccess } from '@/lib/server/airtable-integration';
import { jsonNoStore, readJson, rejectIfUnauthorizedAdmin } from '@/lib/server/http';
import { AirtableProviderMode } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
 if (!airtableIntegrationEnabled) {
 return jsonNoStore({ error: airtableIntegrationHiddenMessage }, { status: 404 });
 }

 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-airtable-validate',
 limit: 8,
 windowMs: 1000 * 60 * 10,
 });
 if (unauthorized) return unauthorized;

 const body = await readJson<{ token?: string; mode?: AirtableProviderMode }>(request);
 if (!body) return jsonNoStore({ error: 'No pudimos leer los datos del asistente.' }, { status: 400 });

 try {
 const data = await validateAirtableAccess({ token: body.token, mode: body.mode === 'demo' ? 'demo' : 'live' });
 return jsonNoStore({ data });
 } catch (error) {
 return jsonNoStore({ error: describeIntegrationError(error) }, { status: 400 });
 }
}
