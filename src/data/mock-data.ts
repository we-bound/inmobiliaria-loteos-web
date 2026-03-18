import { Development, Lead, Lot, LotStatus, Property } from '@/types';

const orientations = ['Noreste', 'Noroeste', 'Sudeste', 'Sudoeste', 'Este', 'Oeste'];
const statusSequence: LotStatus[] = ['disponible', 'disponible', 'consultado', 'reservado', 'disponible', 'vendido', 'disponible', 'consultado', 'reservado', 'disponible', 'vendido', 'disponible', 'disponible', 'consultado', 'disponible', 'reservado', 'disponible', 'disponible', 'vendido', 'consultado', 'disponible', 'reservado', 'disponible', 'disponible', 'consultado', 'vendido', 'disponible', 'reservado'];
const layout = [[44,164,72,136],[126,164,72,136],[44,310,154,52],[44,372,154,52],[44,434,154,52],[44,496,154,52],[44,558,154,52],[44,760,154,58],[44,828,154,58],[44,896,154,58],[268,164,78,110],[356,164,78,110],[444,164,78,110],[532,164,78,110],[268,288,160,48],[438,288,172,48],[268,760,162,58],[448,760,162,58],[268,828,162,58],[448,828,162,58],[652,164,70,118],[732,164,70,118],[652,292,150,56],[652,358,150,56],[652,424,150,56],[652,490,150,56],[652,760,150,58],[652,828,150,58]] as const;

function createSiteMap(topStreet: string, bottomStreet: string) {
 return {
 viewBox: '0 0 846 1020',
 elements: [
 { id: 'street-top', type: 'street' as const, x: 40, y: 60, width: 762, height: 70, label: topStreet, labelX: 421, labelY: 104 },
 { id: 'green', type: 'green' as const, x: 260, y: 390, width: 280, height: 260, label: 'Espacio verde', labelX: 400, labelY: 536 },
 { id: 'street-middle', type: 'street' as const, x: 250, y: 690, width: 552, height: 70, label: bottomStreet, labelX: 526, labelY: 735 },
 { id: 'buffer-left', type: 'street' as const, x: 44, y: 642, width: 154, height: 40, label: '' },
 { id: 'buffer-right', type: 'street' as const, x: 652, y: 906, width: 150, height: 40, label: '' },
 ],
 };
}

function createLots(slug: string, priceBase: number, topStreet: string, bottomStreet: string): Lot[] {
 return layout.map(([x, y, width, height], index) => {
 const lotNumber = index + 1;
 const number = String(lotNumber).padStart(2, '0');
 const lotCode = slug + '-' + number;
 const area = 305 + (index % 5) * 14 + Math.floor(index / 7) * 18;
 const status = statusSequence[index];
 const street = y >= 740 ? bottomStreet : y >= 280 ? 'Parque Central' : topStreet;
 const block = x < 240 ? 'A' : x < 620 ? 'B' : 'C';
 const price = priceBase + area * 1480 + index * 195000;
 const downPayment = Math.round(price * (index % 2 === 0 ? 0.35 : 0.3));
 const installments = index % 2 === 0 ? 36 : 48;

 return {
 id: slug + '-lot-' + lotNumber,
 lotCode,
 number,
 block,
 street,
 area,
 orientation: orientations[index % orientations.length],
 status,
 price,
 currency: 'ARS',
 financing: { available: status !== 'vendido', currency: 'ARS', downPayment, installments, installmentValue: Math.round((price - downPayment) / installments) },
 description: status === 'disponible' ? 'Lote con ubicacion clara dentro del plano, ideal para una consulta comercial rapida.' : 'Sector ya identificado por operaciones, util para seguimiento y estado comercial.',
 notes: status === 'disponible' ? 'Consulta sugerida: precio y financiacion vigente.' : 'Lote en seguimiento comercial.',
 mapPosition: { x, y, width, height },
 };
 });
}

function createDevelopment(config: { id: string; slug: string; name: string; location: string; province: string; shortDescription: string; heroDescription: string; generalStatus: string; coverTheme: string; amenities: string[]; priceBase: number; topStreet: string; bottomStreet: string; }): Development {
 return {
 id: config.id,
 slug: config.slug,
 name: config.name,
 location: config.location,
 province: config.province,
 shortDescription: config.shortDescription,
 heroDescription: config.heroDescription,
 generalStatus: config.generalStatus,
 coverTheme: config.coverTheme,
 baseCurrency: 'ARS',
 amenities: config.amenities,
 siteMap: createSiteMap(config.topStreet, config.bottomStreet),
 lots: createLots(config.slug, config.priceBase, config.topStreet, config.bottomStreet),
 };
}

function buildPropertyMockImage(title: string, toneA: string, toneB: string, subtitle: string) {
 const svg = `
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 640">
 <defs>
 <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0%" stop-color="${toneA}" />
 <stop offset="100%" stop-color="${toneB}" />
 </linearGradient>
 </defs>
 <rect width="900" height="640" rx="36" fill="url(#bg)" />
 <circle cx="710" cy="122" r="150" fill="rgba(255,255,255,0.12)" />
 <circle cx="184" cy="538" r="170" fill="rgba(255,255,255,0.14)" />
 <rect x="86" y="92" width="278" height="22" rx="11" fill="rgba(255,255,255,0.52)" />
 <rect x="86" y="138" width="384" height="72" rx="28" fill="rgba(255,255,255,0.94)" />
 <rect x="86" y="238" width="246" height="24" rx="12" fill="rgba(255,255,255,0.55)" />
 <rect x="86" y="396" width="288" height="126" rx="34" fill="rgba(255,255,255,0.12)" />
 <text x="86" y="184" fill="#0f172a" font-family="Aptos, Segoe UI, sans-serif" font-size="44" font-weight="700">${title}</text>
 <text x="86" y="255" fill="#eff6ff" font-family="Aptos, Segoe UI, sans-serif" font-size="28" font-weight="600">${subtitle}</text>
 <text x="108" y="466" fill="#ffffff" font-family="Aptos, Segoe UI, sans-serif" font-size="28" font-weight="600">Mock visual</text>
 </svg>
 `.trim();

 return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function createProperty(config: Property) {
 return config;
}

export const mockDevelopments: Development[] = [
 createDevelopment({ id: 'dev-1', slug: 'prados-del-sur', name: 'Prados del Sur', location: 'Villa Allende, Cordoba', province: 'Cordoba', shortDescription: 'Loteo abierto con financiacion flexible y lectura inmediata de disponibilidad.', heroDescription: 'Un desarrollo pensado para ordenar consultas, estados y seguimiento comercial desde una interfaz clara.', generalStatus: 'Comercializacion activa', coverTheme: 'from-sky-100 via-white to-emerald-50', amenities: ['Plaza central', 'SUM', 'Boulevard arbolado'], priceBase: 24500000, topStreet: 'Calle Manuela Pedraza', bottomStreet: 'Calle Correa Morales' }),
 createDevelopment({ id: 'dev-2', slug: 'altos-de-la-canada', name: 'Altos de la Canada', location: 'Mendiolaza, Cordoba', province: 'Cordoba', shortDescription: 'Barrio residencial con lotes amplios, plazas internas y salida rapida al corredor.', heroDescription: 'Ideal para mostrar estados de lote en tiempo real y abrir consultas con pocos pasos.', generalStatus: 'Ultima etapa', coverTheme: 'from-sky-50 via-white to-cyan-50', amenities: ['Ingreso jerarquizado', 'Area comun', 'Calles internas'], priceBase: 22800000, topStreet: 'Avenida de los Tilos', bottomStreet: 'Sendero Norte' }),
 createDevelopment({ id: 'dev-3', slug: 'senderos-del-valle', name: 'Senderos del Valle', location: 'Malagueno, Cordoba', province: 'Cordoba', shortDescription: 'Propuesta accesible, comercial y simple para ordenar oferta y captar interesados.', heroDescription: 'Una base visual prolija para esquematizar lotes, filtrar disponibilidad y convertir consultas.', generalStatus: 'Lanzamiento comercial', coverTheme: 'from-emerald-50 via-white to-teal-50', amenities: ['Sector verde', 'Zona comercial', 'Circuito peatonal'], priceBase: 19800000, topStreet: 'Calle del Horizonte', bottomStreet: 'Calle del Parque' }),
];

export const mockProperties: Property[] = [
 createProperty({
 id: 'property-1',
 slug: 'casa-jardin-villa-allende',
 title: 'Casa con jardin en Villa Allende',
 type: 'casa',
 operation: 'venta',
 availability: 'disponible',
 location: 'Villa Allende, Cordoba',
 province: 'Cordoba',
 addressOrZone: 'Lomas Este, a 5 minutos del golf',
 shortDescription: 'Casa familiar con patio amplio, galeria y lectura comercial clara para la primera demo.',
 description: 'Una propiedad pensada para familias que buscan amplitud, patio verde y una zona residencial consolidada. La ficha prioriza lectura rapida, datos claros y contacto inmediato por WhatsApp.',
 surfaceM2: 420,
 coveredM2: 176,
 bedrooms: 3,
 bathrooms: 2,
 parking: true,
 price: 168000,
 currency: 'USD',
 showPrice: true,
 featured: true,
 images: [
 { id: 'property-1-image-1', url: buildPropertyMockImage('Casa con jardin', '#dbeafe', '#93c5fd', 'Villa Allende, Cordoba'), alt: 'Casa con jardin en Villa Allende', isCover: true },
 { id: 'property-1-image-2', url: buildPropertyMockImage('Galeria y patio', '#d1fae5', '#6ee7b7', 'Espacios amplios'), alt: 'Galeria y patio verde', isCover: false },
 { id: 'property-1-image-3', url: buildPropertyMockImage('Living comedor', '#fee2e2', '#fca5a5', 'Ambientes luminosos'), alt: 'Living comedor luminoso', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero consultar por la Casa con jardin en Villa Allende.',
 }),
 createProperty({
 id: 'property-2',
 slug: 'departamento-centro-nueva-cordoba',
 title: 'Departamento luminoso en Nueva Cordoba',
 type: 'departamento',
 operation: 'alquiler',
 availability: 'disponible',
 location: 'Nueva Cordoba, Cordoba',
 province: 'Cordoba',
 addressOrZone: 'A pasos del Buen Pastor',
 shortDescription: 'Ideal para alquiler anual, con living amplio, balcon y muy buena ubicacion.',
 description: 'Departamento de dos ambientes con balcon y expensas razonables. La publicacion esta armada para que el interesado vea rapido operacion, estado, ubicacion y forma de contacto.',
 surfaceM2: 64,
 coveredM2: 58,
 bedrooms: 1,
 bathrooms: 1,
 parking: false,
 price: 620000,
 currency: 'ARS',
 showPrice: true,
 featured: true,
 images: [
 { id: 'property-2-image-1', url: buildPropertyMockImage('Departamento', '#e0f2fe', '#7dd3fc', 'Nueva Cordoba'), alt: 'Departamento luminoso en Nueva Cordoba', isCover: true },
 { id: 'property-2-image-2', url: buildPropertyMockImage('Balcon y vista', '#fef3c7', '#fcd34d', 'Alquiler anual'), alt: 'Balcon y vista urbana', isCover: false },
 ],
 whatsappMessage: 'Hola, me interesa el Departamento luminoso en Nueva Cordoba.',
 }),
 createProperty({
 id: 'property-3',
 slug: 'cabana-sierras-carlos-paz',
 title: 'Cabana serrana en Carlos Paz',
 type: 'cabana',
 operation: 'alquiler',
 availability: 'reservada',
 location: 'Villa Carlos Paz, Cordoba',
 province: 'Cordoba',
 addressOrZone: 'Barrio La Cuesta',
 shortDescription: 'Cabana equipada con pileta compartida y salida rapida al circuito serrano.',
 description: 'Una opcion muy clara para alquiler temporal o extendido, con vista abierta y espacios de descanso. La ficha deja ver enseguida si sigue disponible o si conviene consultar alternativas.',
 surfaceM2: 340,
 coveredM2: 92,
 bedrooms: 2,
 bathrooms: 1,
 parking: true,
 price: undefined,
 currency: 'ARS',
 showPrice: false,
 featured: true,
 images: [
 { id: 'property-3-image-1', url: buildPropertyMockImage('Cabana serrana', '#ecfccb', '#84cc16', 'Villa Carlos Paz'), alt: 'Cabana serrana en Carlos Paz', isCover: true },
 { id: 'property-3-image-2', url: buildPropertyMockImage('Deck y vista', '#fef9c3', '#facc15', 'Consultar valor'), alt: 'Deck con vista a las sierras', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero consultar por la Cabana serrana en Carlos Paz.',
 }),
 createProperty({
 id: 'property-4',
 slug: 'casa-barrio-jardin-cordoba',
 title: 'Casa remodelada en Barrio Jardin',
 type: 'casa',
 operation: 'venta',
 availability: 'cerrada',
 location: 'Barrio Jardin, Cordoba',
 province: 'Cordoba',
 addressOrZone: 'Zona Paseo del Jockey',
 shortDescription: 'Propiedad ya cerrada, util para mostrar stock vendido y recuperar interes con WhatsApp.',
 description: 'Casa remodelada con patio y cochera, incluida en la demo para representar propiedades ya cerradas pero aun utiles para capturar interesados en alternativas similares.',
 surfaceM2: 390,
 coveredM2: 158,
 bedrooms: 3,
 bathrooms: 2,
 parking: true,
 price: 192000,
 currency: 'USD',
 showPrice: true,
 featured: false,
 images: [
 { id: 'property-4-image-1', url: buildPropertyMockImage('Casa remodelada', '#f1f5f9', '#cbd5e1', 'Barrio Jardin'), alt: 'Casa remodelada en Barrio Jardin', isCover: true },
 { id: 'property-4-image-2', url: buildPropertyMockImage('Patio y cochera', '#dbeafe', '#60a5fa', 'Venta cerrada'), alt: 'Patio y cochera', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero una alternativa similar a la Casa remodelada en Barrio Jardin.',
 }),
 createProperty({
 id: 'property-5',
 slug: 'departamento-rio-cuarto-centro',
 title: 'Departamento ejecutivo en Rio Cuarto',
 type: 'departamento',
 operation: 'venta',
 availability: 'disponible',
 location: 'Centro, Rio Cuarto',
 province: 'Cordoba',
 addressOrZone: 'Frente a plaza principal',
 shortDescription: 'Unidad compacta y prolija para renta o primera vivienda, con precio opcional oculto.',
 description: 'Departamento de perfil inversor, con muy buena ubicacion y bajos costos de mantenimiento. Ideal para mostrar la opcion de publicar sin precio y llevar la conversion a consulta.',
 surfaceM2: 51,
 coveredM2: 48,
 bedrooms: 1,
 bathrooms: 1,
 parking: false,
 price: undefined,
 currency: 'USD',
 showPrice: false,
 featured: false,
 images: [
 { id: 'property-5-image-1', url: buildPropertyMockImage('Departamento ejecutivo', '#fae8ff', '#d8b4fe', 'Rio Cuarto'), alt: 'Departamento ejecutivo en Rio Cuarto', isCover: true },
 { id: 'property-5-image-2', url: buildPropertyMockImage('Vista urbana', '#ede9fe', '#a78bfa', 'Consultar valor'), alt: 'Vista urbana del departamento', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero consultar por el Departamento ejecutivo en Rio Cuarto.',
 }),
 createProperty({
 id: 'property-6',
 slug: 'cabana-potrero-garay',
 title: 'Cabana premium en Potrero de Garay',
 type: 'cabana',
 operation: 'venta',
 availability: 'oculta',
 location: 'Potrero de Garay, Cordoba',
 province: 'Cordoba',
 addressOrZone: 'Entorno de lago y sierras',
 shortDescription: 'Propiedad oculta para validar que el admin pueda manejar stock no publicado.',
 description: 'Cabana premium oculta del catalogo publico, preparada para validar alta, edicion y manejo de estado en el panel admin sin exponerla en la seccion publica.',
 surfaceM2: 510,
 coveredM2: 130,
 bedrooms: 2,
 bathrooms: 2,
 parking: true,
 price: 214000,
 currency: 'USD',
 showPrice: true,
 featured: false,
 images: [
 { id: 'property-6-image-1', url: buildPropertyMockImage('Cabana premium', '#cffafe', '#67e8f9', 'Potrero de Garay'), alt: 'Cabana premium en Potrero de Garay', isCover: true },
 { id: 'property-6-image-2', url: buildPropertyMockImage('Entorno natural', '#d1fae5', '#34d399', 'Stock oculto'), alt: 'Entorno natural de la cabana', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero consultar por una cabana premium en Potrero de Garay.',
 }),
];

export const mockLeads: Lead[] = [
 { id: 'lead-1', developmentSlug: 'prados-del-sur', lotId: 'prados-del-sur-lot-4', lotCode: 'prados-del-sur-04', lotLabel: 'Lote 04', name: 'Luciana Pereyra', phone: '+54 9 351 412 8890', email: 'luciana.p@email.com', message: 'Quiero recibir valores estimados y plan de cuotas.', source: 'lote', createdAt: '2026-03-08T10:30:00.000Z', status: 'nuevo' },
 { id: 'lead-2', developmentSlug: 'altos-de-la-canada', lotId: 'altos-de-la-canada-lot-11', lotCode: 'altos-de-la-canada-11', lotLabel: 'Lote 11', name: 'Mariano Suarez', phone: '+54 9 351 520 1144', email: 'mariano.s@email.com', message: 'Necesito saber si aceptan anticipo en dos pagos.', source: 'lote', createdAt: '2026-03-07T15:20:00.000Z', status: 'contactado' },
 { id: 'lead-3', developmentSlug: 'senderos-del-valle', name: 'Paula Ceballos', phone: '+54 9 351 401 2222', email: 'paulac@email.com', message: 'Busco lotes de mas de 340 m2 y financiacion en 48 cuotas.', source: 'contacto', createdAt: '2026-03-06T18:05:00.000Z', status: 'seguimiento' },
 { id: 'lead-4', developmentSlug: 'prados-del-sur', lotId: 'prados-del-sur-lot-16', lotCode: 'prados-del-sur-16', lotLabel: 'Lote 16', name: 'Ivan Gallardo', phone: '+54 9 351 477 9800', email: 'ivang@email.com', message: 'Consultar lote con frente al boulevard y forma de reserva.', source: 'lote', createdAt: '2026-03-05T11:45:00.000Z', status: 'nuevo' },
 { id: 'lead-5', developmentSlug: 'prados-del-sur', lotCode: 'prados-del-sur-06', lotLabel: 'Lote 06', name: 'Carolina Ferreyra', phone: '+54 9 351 611 4300', email: 'carolina.f@email.com', message: 'Avisenme si se libera este lote o aparece uno similar.', source: 'alerta', createdAt: '2026-03-04T14:10:00.000Z', status: 'nuevo' },
 { id: 'lead-6', propertyId: 'property-2', propertySlug: 'departamento-centro-nueva-cordoba', propertyLabel: 'Departamento luminoso en Nueva Cordoba', name: 'Micaela Rios', phone: '+54 9 351 540 0031', email: 'micaela.rios@email.com', message: 'Quiero coordinar visita y saber requisitos del alquiler.', source: 'propiedad', createdAt: '2026-03-03T16:40:00.000Z', status: 'contactado' },
];
