import { NextRequest } from 'next/server';

import { airtableIntegrationEnabled, airtableIntegrationHiddenMessage } from '@/lib/features';
import { describeIntegrationError, testAirtableMapping } from '@/lib/server/airtable-integration';
import { jsonNoStore, readJson, rejectIfUnauthorizedAdmin } from '@/lib/server/http';
import { AirtableFieldMapping, AirtableTableMapping } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
 if (!airtableIntegrationEnabled) {
 return jsonNoStore({ error: airtableIntegrationHiddenMessage }, { status: 404 });
 }

 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-airtable-test-mapping',
 limit: 15,
 windowMs: 1000 * 60 * 10,
 });
 if (unauthorized) return unauthorized;

 const body = await readJson<{ wizardSessionId?: string; baseId?: string; baseName?: string; tablesMapping?: AirtableTableMapping; fieldMapping?: AirtableFieldMapping }>(request);

 if (!body?.wizardSessionId || !body.baseId || !body.tablesMapping || !body.fieldMapping) {
 return jsonNoStore({ error: 'Faltan datos del asistente para probar el mapping.' }, { status: 400 });
 }

 try {
 const data = await testAirtableMapping({ wizardSessionId: body.wizardSessionId, baseId: body.baseId, baseName: body.baseName, tablesMapping: body.tablesMapping, fieldMapping: body.fieldMapping });
 return jsonNoStore({ data });
 } catch (error) {
 return jsonNoStore({ error: describeIntegrationError(error) }, { status: 400 });
 }
}
