import { NextRequest } from 'next/server';

import { patchLot } from '@/lib/server/catalog';
import { jsonNoStore, normalizeOptionalString, readJson, rejectIfUnauthorizedAdmin } from '@/lib/server/http';
import { LotStatus, LotUpdateInput } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
 params: Promise<{ lotCode: string }>;
}

const allowedStatuses: LotStatus[] = ['disponible', 'consultado', 'reservado', 'vendido'];

function parseNumber(value: unknown) {
 if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
 return value;
 }

 return undefined;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
 const unauthorized = rejectIfUnauthorizedAdmin(request, {
 bucket: 'admin-lot-patch',
 limit: 40,
 windowMs: 1000 * 60 * 5,
 });

 if (unauthorized) {
 return unauthorized;
 }

 const body = await readJson<Partial<LotUpdateInput>>(request);

 if (!body) {
 return jsonNoStore({ error: 'Payload invalido' }, { status: 400 });
 }

 const patch: LotUpdateInput = {
 ...(allowedStatuses.includes(body.status as LotStatus) ? { status: body.status as LotStatus } : {}),
 ...(typeof normalizeOptionalString(body.notes, 600) === 'string' ? { notes: normalizeOptionalString(body.notes, 600) } : {}),
 ...(typeof parseNumber(body.price) === 'number' ? { price: parseNumber(body.price) } : {}),
 ...(typeof parseNumber(body.downPayment) === 'number' ? { downPayment: parseNumber(body.downPayment) } : {}),
 ...(typeof parseNumber(body.installmentsCount) === 'number' ? { installmentsCount: parseNumber(body.installmentsCount) } : {}),
 ...(typeof parseNumber(body.installmentValue) === 'number' ? { installmentValue: parseNumber(body.installmentValue) } : {}),
 };

 if (Object.keys(patch).length === 0) {
 return jsonNoStore({ error: 'No hay cambios validos para aplicar' }, { status: 400 });
 }

 const { lotCode } = await context.params;
 const result = await patchLot(lotCode, patch);

 if (!result.data) {
 return jsonNoStore({ error: 'Lote no encontrado' }, { status: 404 });
 }

 return jsonNoStore({ data: result.data, meta: { source: result.source, fallback: result.fallback } });
}
