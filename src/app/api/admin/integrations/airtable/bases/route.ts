import { NextRequest } from 'next/server';

import { airtableIntegrationEnabled, airtableIntegrationHiddenMessage } from '@/lib/features';
import { describeIntegrationError, listAirtableWizardBases } from '@/lib/server/airtable-integration';
import { jsonNoStore, rejectIfUnauthorizedAdmin } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 if (!airtableIntegrationEnabled) {
 return jsonNoStore({ error: airtableIntegrationHiddenMessage }, { status: 404 });
 }

 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-airtable-bases',
 limit: 30,
 windowMs: 1000 * 60 * 5,
 });
 if (unauthorized) return unauthorized;

 const wizardSessionId = request.nextUrl.searchParams.get('wizardSessionId');
 if (!wizardSessionId) return jsonNoStore({ error: 'No encontramos la sesion del asistente.' }, { status: 400 });

 try {
 const data = await listAirtableWizardBases(wizardSessionId);
 return jsonNoStore({ data });
 } catch (error) {
 return jsonNoStore({ error: describeIntegrationError(error) }, { status: 400 });
 }
}
