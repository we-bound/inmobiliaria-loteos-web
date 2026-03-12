import path from 'node:path';
import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';
const connectSrc = isDevelopment ? "connect-src 'self' ws: wss:" : "connect-src 'self'";
const scriptSrc = isDevelopment ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'";

const contentSecurityPolicy = [
 "default-src 'self'",
 scriptSrc,
 "style-src 'self' 'unsafe-inline'",
 "img-src 'self' data: blob:",
 "font-src 'self' data:",
 connectSrc,
 "frame-ancestors 'none'",
 "base-uri 'self'",
 "form-action 'self'",
 "object-src 'none'",
].join('; ');

const securityHeaders = [
 { key: 'Content-Security-Policy', value: contentSecurityPolicy },
 { key: 'X-Frame-Options', value: 'DENY' },
 { key: 'X-Content-Type-Options', value: 'nosniff' },
 { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
 { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
 { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
 { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
 { key: 'Origin-Agent-Cluster', value: '?1' },
];

const nextConfig: NextConfig = {
 turbopack: { root: path.join(__dirname) },
 async headers() {
 return [
 { source: '/admin', headers: [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
 { source: '/:path*', headers: securityHeaders },
 ];
 },
};

export default nextConfig;
