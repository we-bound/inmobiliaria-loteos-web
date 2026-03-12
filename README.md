# Inmobiliaria Lotes Mock

## Deploy en Netlify

Este proyecto usa Next.js y debe desplegarse en Netlify con el runtime/adaptador de Next.js de Netlify, sin definir manualmente un publish directory.

### Settings recomendados en Netlify

- Base directory: dejar vacio
- Build command: `npm run build`
- Publish directory: dejar vacio

Notas:

- No usar `/`, `.` ni `.next` como publish directory.
- Si el sitio ya tenia un publish directory configurado en el dashboard, borrarlo antes de redeployar.
- Para la primera demo, la app funciona con mocks locales y no necesita credenciales de Airtable.

### Validacion local

```bash
npm run lint
npm run build
```
