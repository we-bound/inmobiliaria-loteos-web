# Inmobiliaria Lotes Mock

## Documentación técnica

La documentación técnica detallada del proyecto está en [DOCUMENTACION_TECNICA.md](/C:/Users/santi/OneDrive/Documentos/Inmobiliaria/DOCUMENTACION_TECNICA.md).

## Deploy en Netlify

Este proyecto usa Next.js y esta preparado para desplegarse en Netlify con el runtime/plugin de Next.js.

### Settings recomendados en Netlify

- Base directory: dejar vacio
- Build command: `npm run build`
- Publish directory: `.next`

Notas:

- No usar `/` ni `.` como publish directory.
- Si el sitio ya tenia apuntado el publish directory a la raiz del repo, Netlify puede intentar publicar `/opt/build/repo` y fallar con el error "Your publish directory cannot be the same as the base directory of your site".
- `netlify.toml` fija `publish = ".next"` para evitar ese problema y alinearse con la configuracion recomendada por Netlify para Next.js.
- Para la primera demo, la app funciona con mocks locales y no necesita credenciales de Airtable.

### Validacion local

```bash
npm run lint
npm run build
```
