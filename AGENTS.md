# AGENTS.md

## Proyecto
- Stack principal: Next.js App Router, TypeScript y Tailwind CSS.
- Producto: web comercial para inmobiliaria/loteos con Home, listado, detalle de loteo, modal de lote, contacto y admin mock.
- Fuente de datos: Airtable desde server-side cuando hay credenciales; fallback obligatorio a mocks locales si faltan variables o falla la red.

## Reglas de arquitectura
- Nunca conectar client components directamente a Airtable.
- Toda integracion externa debe pasar por `src/lib/airtable/*` y rutas `src/app/api/*`.
- Mantener modelos tipados y mappers separados de la UI.
- Priorizar cambios pequenos, claros y reversibles. No reestructurar sin necesidad.
- El admin sigue siendo mock visual salvo que se pida autenticacion real.

## UI y UX
- Mantener estetica premium, limpia, comercial y responsive.
- Usar copy en espanol orientado a Argentina.
- No eliminar CTAs comerciales ni badges de estado sin motivo.
- Si se tocan layouts, preservar claridad de: estado del lote, superficie, precio/financiacion y CTA de consulta.
- Todo componente clave debe tener `data-testid` estable para QA visual/funcional.

## QA visual
- Playwright es la herramienta oficial de smoke/visual QA del repo.
- Scripts esperados: `npm run qa:ui`, `npm run qa:shots`, `npm run qa:report`.
- Los tests visuales deben cubrir Home, listado de loteos, detalle de loteo, apertura de lote y admin.
- Al cambiar UI, actualizar snapshots solo cuando el cambio sea intencional.
- No aceptar cambios visuales grandes sin validar desktop y mobile.

## Seguridad
- Mantener headers de seguridad en Next config.
- Endpoints mutantes (`POST`/`PATCH`) deben validar payloads y revisar `Origin` cuando aplique.
- No exponer secretos en el frontend ni en respuestas al cliente.
- Si existe token admin por entorno, usarlo solo en server-side routes.

## Entorno y comandos
- Desarrollo: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- QA visual: `npm run qa:ui`
- Actualizar baselines: `npm run qa:shots`
- Reporte Playwright: `npm run qa:report`

## Criterio de fallback
- Si Airtable no esta configurado, la app debe seguir funcionando completa con mocks locales.
- Si Airtable responde con error, registrar el fallo server-side y volver a mocks sin romper la UI.
