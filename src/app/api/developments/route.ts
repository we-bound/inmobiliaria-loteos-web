import { loadDevelopments } from '@/lib/server/catalog';
import { jsonNoStore } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
 const result = await loadDevelopments();
 return jsonNoStore({ data: result.data, meta: { source: result.source, fallback: result.fallback } });
}
