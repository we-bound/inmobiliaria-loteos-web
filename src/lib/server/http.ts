import { NextRequest, NextResponse } from 'next/server';

import { checkRateLimit } from '@/lib/server/rate-limit';

interface RateLimitOptions {
 bucket: string;
 limit: number;
 windowMs: number;
 message?: string;
}

type AdminGuardOptions = RateLimitOptions;

export function jsonNoStore(body: unknown, init?: ResponseInit) {
 return NextResponse.json(body, {
 ...init,
 headers: {
 'Cache-Control': 'no-store',
 ...(init?.headers || {}),
 },
 });
}

export function getClientAddress(request: NextRequest) {
 const forwardedFor = request.headers.get('x-forwarded-for');
 const realIp = request.headers.get('x-real-ip');
 return forwardedFor?.split(',')[0]?.trim() || realIp || 'local';
}

export function isAllowedOrigin(request: NextRequest) {
 const origin = request.headers.get('origin');

 if (!origin) {
 return true;
 }

 return origin === request.nextUrl.origin;
}

export function rejectIfRateLimited(request: NextRequest, options: RateLimitOptions) {
 const result = checkRateLimit(options.bucket + ':' + getClientAddress(request), { limit: options.limit, windowMs: options.windowMs });

 if (result.allowed) {
 return null;
 }

 return jsonNoStore({ error: options.message || 'Hiciste demasiadas acciones seguidas. Intenta nuevamente en un momento.' }, {
 status: 429,
 headers: { 'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)) },
 });
}

export function rejectIfUnauthorizedAdmin(request: NextRequest, options?: Partial<AdminGuardOptions>) {
 if (!isAllowedOrigin(request)) {
 return jsonNoStore({ error: 'Origen no permitido' }, { status: 403 });
 }

 if (options?.bucket && options.limit && options.windowMs) {
 const rateLimitResponse = rejectIfRateLimited(request, {
 bucket: options.bucket,
 limit: options.limit,
 windowMs: options.windowMs,
 message: options.message || 'Hiciste demasiadas acciones de administracion en poco tiempo. Intenta nuevamente en unos minutos.',
 });

 if (rateLimitResponse) {
 return rateLimitResponse;
 }
 }

 const expectedToken = process.env.ADMIN_API_TOKEN;
 const authorization = request.headers.get('authorization');

 if (expectedToken && authorization !== 'Bearer ' + expectedToken) {
 return jsonNoStore({ error: 'No autorizado' }, { status: 401 });
 }

 return null;
}

export async function readJson<T>(request: Request) {
 try {
 return (await request.json()) as T;
 } catch {
 return null;
 }
}

export function normalizeOptionalString(value: unknown, maxLength = 160) {
 if (typeof value !== 'string') {
 return undefined;
 }

 const trimmed = value.trim().replace(/\s+/g, ' ');
 if (!trimmed) {
 return undefined;
 }

 return trimmed.slice(0, maxLength);
}

export function normalizePhone(value: unknown, maxLength = 32) {
 if (typeof value !== 'string') {
 return undefined;
 }

 const trimmed = value.trim().replace(/\s+/g, ' ');
 if (!trimmed) {
 return undefined;
 }

 return trimmed.replace(/[^\d+()\-\s]/g, '').slice(0, maxLength).trim() || undefined;
}

export function normalizeEmail(value: unknown, maxLength = 120) {
 if (typeof value !== 'string') {
 return undefined;
 }

 const trimmed = value.trim().toLowerCase();
 if (!trimmed) {
 return undefined;
 }

 return trimmed.slice(0, maxLength);
}
