import { NextRequest } from 'next/server';

import { loadLots } from '@/lib/server/catalog';
import { jsonNoStore } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 const developmentSlug = request.nextUrl.searchParams.get('development') || undefined;
 const result = await loadLots(developmentSlug);
 return jsonNoStore({ data: result.data, meta: { source: result.source, fallback: result.fallback } });
}
