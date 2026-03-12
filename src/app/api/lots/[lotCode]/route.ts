import { loadLotByCode } from '@/lib/server/catalog';
import { jsonNoStore } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

interface RouteContext {
 params: Promise<{ lotCode: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
 const { lotCode } = await context.params;
 const result = await loadLotByCode(lotCode);

 if (!result.data) {
 return jsonNoStore({ error: 'Lote no encontrado' }, { status: 404 });
 }

 return jsonNoStore({ data: result.data, meta: { source: result.source, fallback: result.fallback } });
}
