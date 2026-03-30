# Inmobiliaria Lotes Mock

## Documentación técnica

La documentación técnica detallada del proyecto está en [DOCUMENTACION_TECNICA.md](/C:/Users/santi/OneDrive/Documentos/Inmobiliaria/DOCUMENTACION_TECNICA.md).

## Deploy en Netlify

Este proyecto usa Next.js y esta preparado para desplegarse en Netlify con el runtime/plugin de Next.js.

### Settings recomendados en Netlify

- Base directory: dejar vacio
- Build command: `npm run build`
- Publish directory: `.netlify/next`

Notas:

- No usar `/`, `.` ni `.next` como publish directory.
- Si el sitio ya tenia `Publish directory` vacio y el plugin de Next esta activo, Netlify puede intentar publicar la raiz del repo y fallar.
- `netlify.toml` ya fija `publish = ".netlify/next"` para evitar ese problema y mantener el deploy consistente.
- Para la primera demo, la app funciona con mocks locales y no necesita credenciales de Airtable.

### Validacion local

```bash
npm run lint
npm run build
```
