import { loadDevelopmentBySlug } from '@/lib/server/catalog';
import { jsonNoStore } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

interface RouteContext {
 params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
 const { slug } = await context.params;
 const result = await loadDevelopmentBySlug(slug);

 if (!result.data) {
 return jsonNoStore({ error: 'Loteo no encontrado' }, { status: 404 });
 }

 return jsonNoStore({ data: result.data, meta: { source: result.source, fallback: result.fallback } });
}
