import { NextRequest } from 'next/server';

import { airtableIntegrationEnabled, airtableIntegrationHiddenMessage } from '@/lib/features';
import { describeIntegrationError, getAirtableWizardSchema } from '@/lib/server/airtable-integration';
import { jsonNoStore, rejectIfUnauthorizedAdmin } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 if (!airtableIntegrationEnabled) {
 return jsonNoStore({ error: airtableIntegrationHiddenMessage }, { status: 404 });
 }

 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-airtable-schema',
 limit: 30,
 windowMs: 1000 * 60 * 5,
 });
 if (unauthorized) return unauthorized;

 const wizardSessionId = request.nextUrl.searchParams.get('wizardSessionId');
 const baseId = request.nextUrl.searchParams.get('baseId');

 if (!wizardSessionId || !baseId) {
 return jsonNoStore({ error: 'Necesitamos la sesion y la base para seguir.' }, { status: 400 });
 }

 try {
 const data = await getAirtableWizardSchema(wizardSessionId, baseId);
 return jsonNoStore({ data });
 } catch (error) {
 return jsonNoStore({ error: describeIntegrationError(error) }, { status: 400 });
 }
}
