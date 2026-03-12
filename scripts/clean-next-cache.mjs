import { rmSync } from 'node:fs';
import { join } from 'node:path';

const targets = [
 join(process.cwd(), '.next', 'dev', 'cache', 'turbopack'),
 join(process.cwd(), '.next', 'cache', 'turbopack'),
];

for (const target of targets) {
 try {
 rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
 console.log('[clean-next-cache] eliminado:', target);
 } catch (error) {
 console.warn('[clean-next-cache] no se pudo eliminar:', target);
 console.warn(error instanceof Error ? error.message : String(error));
 }
}
