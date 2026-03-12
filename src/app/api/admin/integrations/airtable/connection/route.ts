import { NextRequest } from 'next/server';

import { airtableIntegrationEnabled, airtableIntegrationHiddenMessage } from '@/lib/features';
import {
 disconnectAirtableConnection,
 describeIntegrationError,
 getIntegrationConnectionSummary,
 retestSavedAirtableConnection,
 saveAirtableConnection,
} from '@/lib/server/airtable-integration';
import { jsonNoStore, readJson, rejectIfUnauthorizedAdmin } from '@/lib/server/http';
import { AirtableFieldMapping, AirtableTableMapping } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 if (!airtableIntegrationEnabled) {
 return jsonNoStore({ error: airtableIntegrationHiddenMessage }, { status: 404 });
 }

 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-airtable-connection-read',
 limit: 50,
 windowMs: 1000 * 60 * 5,
 });
 if (unauthorized) return unauthorized;

 try {
 const data = await getIntegrationConnectionSummary();
 return jsonNoStore({ data });
 } catch (error) {
 return jsonNoStore({ error: describeIntegrationError(error) }, { status: 500 });
 }
}

export async function POST(request: NextRequest) {
 if (!airtableIntegrationEnabled) {
 return jsonNoStore({ error: airtableIntegrationHiddenMessage }, { status: 404 });
 }

 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-airtable-connection-write',
 limit: 18,
 windowMs: 1000 * 60 * 10,
 });
 if (unauthorized) return unauthorized;

 const body = await readJson<{ action?: 'retest'; wizardSessionId?: string; baseId?: string; baseName?: string; tablesMapping?: AirtableTableMapping; fieldMapping?: AirtableFieldMapping }>(request);

 if (body?.action === 'retest') {
 try {
 const data = await retestSavedAirtableConnection();
 return jsonNoStore({ data });
 } catch (error) {
 return jsonNoStore({ error: describeIntegrationError(error) }, { status: 400 });
 }
 }

 if (!body?.wizardSessionId || !body.baseId || !body.tablesMapping || !body.fieldMapping) {
 return jsonNoStore({ error: 'No pudimos guardar la conexion porque faltan datos del asistente.' }, { status: 400 });
 }

 try {
 const data = await saveAirtableConnection({
 wizardSessionId: body.wizardSessionId,
 baseId: body.baseId,
 baseName: body.baseName,
 tablesMapping: body.tablesMapping,
 fieldMapping: body.fieldMapping,
 });
 return jsonNoStore({ data });
 } catch (error) {
 return jsonNoStore({ error: describeIntegrationError(error) }, { status: 400 });
 }
}

export async function DELETE(request: NextRequest) {
 if (!airtableIntegrationEnabled) {
 return jsonNoStore({ error: airtableIntegrationHiddenMessage }, { status: 404 });
 }

 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-airtable-connection-delete',
 limit: 10,
 windowMs: 1000 * 60 * 10,
 });
 if (unauthorized) return unauthorized;

 try {
 const data = await disconnectAirtableConnection();
 return jsonNoStore({ data });
 } catch (error) {
 return jsonNoStore({ error: describeIntegrationError(error) }, { status: 400 });
 }
}
