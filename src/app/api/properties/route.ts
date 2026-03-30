import { loadProperties } from '@/lib/server/catalog';
import { jsonNoStore } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
 const result = await loadProperties();
 return jsonNoStore({ data: result.data.filter((property) => property.availability !== 'oculta'), meta: { source: result.source, fallback: result.fallback } });
}
