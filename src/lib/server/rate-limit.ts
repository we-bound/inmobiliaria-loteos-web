interface RateLimitState {
 count: number;
 resetAt: number;
}

interface RateLimitOptions {
 limit: number;
 windowMs: number;
}

const globalStore = globalThis as typeof globalThis & { __catalogRateLimitStore?: Map<string, RateLimitState> };
const store = globalStore.__catalogRateLimitStore ?? new Map<string, RateLimitState>();

if (!globalStore.__catalogRateLimitStore) {
 globalStore.__catalogRateLimitStore = store;
}

function cleanup(now: number) {
 for (const [key, value] of store.entries()) {
 if (value.resetAt <= now) {
 store.delete(key);
 }
 }
}

export function checkRateLimit(key: string, options: RateLimitOptions) {
 const now = Date.now();
 cleanup(now);

 const current = store.get(key);

 if (!current || current.resetAt <= now) {
 store.set(key, { count: 1, resetAt: now + options.windowMs });
 return { allowed: true, remaining: options.limit - 1, retryAfterMs: options.windowMs };
 }

 if (current.count >= options.limit) {
 return { allowed: false, remaining: 0, retryAfterMs: Math.max(current.resetAt - now, 1000) };
 }

 current.count += 1;
 store.set(key, current);
 return { allowed: true, remaining: Math.max(options.limit - current.count, 0), retryAfterMs: Math.max(current.resetAt - now, 1000) };
}
