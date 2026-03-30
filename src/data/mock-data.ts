import { Development, Lead, Lot, LotStatus, Property } from '@/types';

const orientations = ['Noreste', 'Noroeste', 'Sudeste', 'Sudoeste', 'Este', 'Oeste'];
const statusSequence: LotStatus[] = ['disponible', 'disponible', 'consultado', 'reservado', 'disponible', 'vendido', 'disponible', 'consultado', 'reservado', 'disponible', 'vendido', 'disponible', 'disponible', 'consultado', 'disponible', 'reservado', 'disponible', 'disponible', 'vendido', 'consultado', 'disponible', 'reservado', 'disponible', 'disponible', 'consultado', 'vendido', 'disponible', 'reservado'];
const layout = [[44,164,72,136],[126,164,72,136],[44,310,154,52],[44,372,154,52],[44,434,154,52],[44,496,154,52],[44,558,154,52],[44,760,154,58],[44,828,154,58],[44,896,154,58],[268,164,78,110],[356,164,78,110],[444,164,78,110],[532,164,78,110],[268,288,160,48],[438,288,172,48],[268,760,162,58],[448,760,162,58],[268,828,162,58],[448,828,162,58],[652,164,70,118],[732,164,70,118],[652,292,150,56],[652,358,150,56],[652,424,150,56],[652,490,150,56],[652,760,150,58],[652,828,150,58]] as const;

type PropertyScene = 'residencial' | 'urbano' | 'montana';

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
 const area = 318 + (index % 5) * 12 + Math.floor(index / 7) * 16;
 const status = statusSequence[index];
 const street = y >= 740 ? bottomStreet : y >= 280 ? 'Plaza central' : topStreet;
 const block = x < 240 ? 'A' : x < 620 ? 'B' : 'C';
 const price = priceBase + area * 1730 + index * 225000;
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
 description: status === 'disponible' ? 'Lote bien posicionado dentro del plano, con lectura simple de estado, superficie y propuesta comercial.' : 'Unidad ya identificada por el equipo comercial para seguimiento, recontacto o revisión de estado.',
 notes: status === 'disponible' ? 'Presentación sugerida con precio, anticipo y plan de cuotas.' : 'Unidad útil para operación y control de disponibilidad.',
 mapPosition: { x, y, width, height },
 };
 });
}

function createDevelopment(config: {
 id: string;
 slug: string;
 name: string;
 location: string;
 province: string;
 shortDescription: string;
 heroDescription: string;
 generalStatus: string;
 coverTheme: string;
 amenities: string[];
 priceBase: number;
 topStreet: string;
 bottomStreet: string;
}): Development {
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

function buildPropertyMockImage(config: {
 scene: PropertyScene;
 toneA: string;
 toneB: string;
 accent: string;
 shadow: string;
}) {
 const sceneMarkup = config.scene === 'residencial'
 ? `
 <rect x="162" y="248" width="420" height="206" rx="18" fill="rgba(255,255,255,0.9)" />
 <polygon points="150,256 372,126 594,256" fill="${config.accent}" opacity="0.88" />
 <rect x="320" y="330" width="112" height="124" rx="14" fill="${config.shadow}" opacity="0.32" />
 <rect x="214" y="306" width="82" height="74" rx="12" fill="${config.shadow}" opacity="0.18" />
 <rect x="450" y="306" width="82" height="74" rx="12" fill="${config.shadow}" opacity="0.18" />
 <rect x="120" y="454" width="520" height="16" rx="8" fill="rgba(255,255,255,0.45)" />
 `
 : config.scene === 'urbano'
 ? `
 <rect x="184" y="152" width="150" height="330" rx="18" fill="rgba(255,255,255,0.9)" />
 <rect x="360" y="206" width="138" height="276" rx="18" fill="rgba(255,255,255,0.75)" />
 <rect x="520" y="126" width="110" height="356" rx="18" fill="rgba(255,255,255,0.62)" />
 <rect x="216" y="188" width="24" height="24" rx="6" fill="${config.accent}" opacity="0.35" />
 <rect x="252" y="188" width="24" height="24" rx="6" fill="${config.accent}" opacity="0.35" />
 <rect x="216" y="226" width="24" height="24" rx="6" fill="${config.accent}" opacity="0.35" />
 <rect x="252" y="226" width="24" height="24" rx="6" fill="${config.accent}" opacity="0.35" />
 <rect x="544" y="162" width="24" height="24" rx="6" fill="${config.shadow}" opacity="0.24" />
 <rect x="580" y="162" width="24" height="24" rx="6" fill="${config.shadow}" opacity="0.24" />
 <rect x="150" y="488" width="520" height="18" rx="9" fill="rgba(255,255,255,0.42)" />
 `
 : `
 <polygon points="160,364 296,194 420,364" fill="rgba(255,255,255,0.38)" />
 <polygon points="340,364 492,146 650,364" fill="rgba(255,255,255,0.28)" />
 <rect x="236" y="292" width="314" height="180" rx="22" fill="rgba(255,255,255,0.92)" />
 <polygon points="214,304 394,182 572,304" fill="${config.accent}" opacity="0.88" />
 <rect x="296" y="358" width="92" height="114" rx="16" fill="${config.shadow}" opacity="0.26" />
 <rect x="430" y="332" width="76" height="68" rx="12" fill="${config.shadow}" opacity="0.18" />
 <rect x="190" y="476" width="410" height="16" rx="8" fill="rgba(255,255,255,0.4)" />
 `;

 const svg = `
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
 <defs>
 <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0%" stop-color="${config.toneA}" />
 <stop offset="100%" stop-color="${config.toneB}" />
 </linearGradient>
 </defs>
 <rect width="1200" height="800" rx="48" fill="url(#bg)" />
 <circle cx="950" cy="132" r="180" fill="rgba(255,255,255,0.14)" />
 <circle cx="178" cy="628" r="210" fill="rgba(255,255,255,0.12)" />
 <circle cx="410" cy="144" r="98" fill="rgba(255,255,255,0.08)" />
 <rect x="0" y="550" width="1200" height="250" fill="rgba(255,255,255,0.18)" />
 <rect x="120" y="104" width="220" height="22" rx="11" fill="rgba(255,255,255,0.42)" />
 <rect x="120" y="152" width="170" height="20" rx="10" fill="rgba(255,255,255,0.26)" />
 <rect x="120" y="458" width="330" height="118" rx="28" fill="rgba(255,255,255,0.12)" />
 ${sceneMarkup}
 </svg>
 `.trim();

 return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function createProperty(config: Property) {
 return config;
}

export const mockDevelopments: Development[] = [
 createDevelopment({
 id: 'dev-1',
 slug: 'altos-del-faro',
 name: 'Altos del Faro',
 location: 'Mar del Plata, Buenos Aires',
 province: 'Buenos Aires',
 shortDescription: 'Desarrollo residencial con lectura comercial clara, lotes amplios y un frente costero muy valorado.',
 heroDescription: 'Una propuesta pensada para mostrar disponibilidad, valores y seguimiento comercial con una experiencia ordenada, simple y presentable.',
 generalStatus: 'Comercialización activa',
 coverTheme: 'from-sky-100 via-white to-cyan-50',
 amenities: ['Ingreso jerarquizado', 'Plaza lineal', 'Boulevard central'],
 priceBase: 29500000,
 topStreet: 'Boulevard del Faro',
 bottomStreet: 'Calle Costa Serena',
 }),
 createDevelopment({
 id: 'dev-2',
 slug: 'lagos-del-este',
 name: 'Lagos del Este',
 location: 'Rosario, Santa Fe',
 province: 'Santa Fe',
 shortDescription: 'Loteo urbano de perfil familiar con acceso rápido, espacios verdes y disponibilidad clara para la operación.',
 heroDescription: 'Ideal para presentar avances comerciales, alternativas disponibles y consultas con información inmediata desde mapa o listado.',
 generalStatus: 'Última etapa',
 coverTheme: 'from-emerald-50 via-white to-sky-50',
 amenities: ['Laguna paisajística', 'SUM', 'Sendero peatonal'],
 priceBase: 27200000,
 topStreet: 'Avenida del Lago',
 bottomStreet: 'Paseo del Delta',
 }),
 createDevelopment({
 id: 'dev-3',
 slug: 'miradores-del-valle',
 name: 'Miradores del Valle',
 location: 'Neuquén Capital, Neuquén',
 province: 'Neuquén',
 shortDescription: 'Barrio abierto con excelente lectura de producto, financiación visible y base ideal para venta consultiva.',
 heroDescription: 'Una experiencia comercial pensada para que el cliente entienda rápido qué sigue disponible y el equipo pueda responder con agilidad.',
 generalStatus: 'Lanzamiento comercial',
 coverTheme: 'from-violet-50 via-white to-sky-50',
 amenities: ['Mirador central', 'Circuito aeróbico', 'Espacio comunitario'],
 priceBase: 24800000,
 topStreet: 'Camino del Valle',
 bottomStreet: 'Sendero del Mirador',
 }),
];

export const mockProperties: Property[] = [
 createProperty({
 id: 'property-1',
 slug: 'casa-parque-city-bell',
 title: 'Casa con parque en City Bell',
 type: 'casa',
 operation: 'venta',
 availability: 'disponible',
 location: 'La Plata, Buenos Aires',
 province: 'Buenos Aires',
 addressOrZone: 'Sector residencial de City Bell',
 shortDescription: 'Casa familiar con parque, galería y una presentación clara para compradores que priorizan entorno y metros.',
 description: 'Propiedad de perfil familiar, con jardín consolidado, ambientes amplios y una ubicación residencial muy buscada. La ficha está pensada para responder rápido superficie, operación y vías de contacto.',
 surfaceM2: 438,
 coveredM2: 182,
 bedrooms: 3,
 bathrooms: 3,
 parking: true,
 price: 186000,
 currency: 'USD',
 showPrice: true,
 featured: true,
 images: [
 { id: 'property-1-image-1', url: buildPropertyMockImage({ scene: 'residencial', toneA: '#dbeafe', toneB: '#93c5fd', accent: '#1d4ed8', shadow: '#0f172a' }), alt: 'Casa con parque en City Bell', isCover: true },
 { id: 'property-1-image-2', url: buildPropertyMockImage({ scene: 'residencial', toneA: '#dcfce7', toneB: '#86efac', accent: '#15803d', shadow: '#0f172a' }), alt: 'Galería y jardín de la casa en City Bell', isCover: false },
 { id: 'property-1-image-3', url: buildPropertyMockImage({ scene: 'residencial', toneA: '#fef3c7', toneB: '#fdba74', accent: '#c2410c', shadow: '#111827' }), alt: 'Frente principal de la casa con parque', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero consultar por la Casa con parque en City Bell.',
 }),
 createProperty({
 id: 'property-2',
 slug: 'departamento-premium-puerto-norte',
 title: 'Departamento premium en Puerto Norte',
 type: 'departamento',
 operation: 'alquiler',
 availability: 'disponible',
 location: 'Rosario, Santa Fe',
 province: 'Santa Fe',
 addressOrZone: 'Frente al río, Puerto Norte',
 shortDescription: 'Unidad moderna con balcón aterrazado, amenities y excelente lectura comercial para alquiler anual.',
 description: 'Departamento de perfil ejecutivo, con espacios luminosos y una ubicación muy valorada para alquiler. La publicación prioriza un resumen claro de operación, estado y forma de contacto inmediato.',
 surfaceM2: 78,
 coveredM2: 68,
 bedrooms: 2,
 bathrooms: 2,
 parking: true,
 price: 980000,
 currency: 'ARS',
 showPrice: true,
 featured: true,
 images: [
 { id: 'property-2-image-1', url: buildPropertyMockImage({ scene: 'urbano', toneA: '#e0f2fe', toneB: '#7dd3fc', accent: '#0284c7', shadow: '#0f172a' }), alt: 'Departamento premium en Puerto Norte', isCover: true },
 { id: 'property-2-image-2', url: buildPropertyMockImage({ scene: 'urbano', toneA: '#ede9fe', toneB: '#c4b5fd', accent: '#7c3aed', shadow: '#111827' }), alt: 'Vista urbana del departamento premium', isCover: false },
 ],
 whatsappMessage: 'Hola, me interesa el Departamento premium en Puerto Norte.',
 }),
 createProperty({
 id: 'property-3',
 slug: 'cabana-montana-san-martin-andes',
 title: 'Cabaña de montaña en San Martín de los Andes',
 type: 'cabana',
 operation: 'alquiler',
 availability: 'reservada',
 location: 'San Martín de los Andes, Neuquén',
 province: 'Neuquén',
 addressOrZone: 'Corredor Chapelco',
 shortDescription: 'Cabaña equipada, con vista abierta y muy buena salida a circuitos de montaña y temporada.',
 description: 'Una propiedad ideal para alquiler turístico o extendido, con imagen cálida, entorno natural y una ficha clara para derivar consultas a alternativas similares si ya está reservada.',
 surfaceM2: 360,
 coveredM2: 104,
 bedrooms: 2,
 bathrooms: 2,
 parking: true,
 price: undefined,
 currency: 'ARS',
 showPrice: false,
 featured: true,
 images: [
 { id: 'property-3-image-1', url: buildPropertyMockImage({ scene: 'montana', toneA: '#ecfccb', toneB: '#84cc16', accent: '#4d7c0f', shadow: '#0f172a' }), alt: 'Cabaña de montaña en San Martín de los Andes', isCover: true },
 { id: 'property-3-image-2', url: buildPropertyMockImage({ scene: 'montana', toneA: '#cffafe', toneB: '#67e8f9', accent: '#0f766e', shadow: '#0f172a' }), alt: 'Entorno natural de la cabaña de montaña', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero consultar por la Cabaña de montaña en San Martín de los Andes.',
 }),
 createProperty({
 id: 'property-4',
 slug: 'casa-reciclada-chacras-coria',
 title: 'Casa reciclada en Chacras de Coria',
 type: 'casa',
 operation: 'venta',
 availability: 'cerrada',
 location: 'Luján de Cuyo, Mendoza',
 province: 'Mendoza',
 addressOrZone: 'Chacras de Coria',
 shortDescription: 'Operación ya cerrada, útil para mostrar stock vendido y recuperar interés con una alternativa parecida.',
 description: 'Casa reciclada con perfil boutique y excelente entorno residencial. Se incluye para representar publicaciones cerradas que igualmente sirven para captar nuevos interesados.',
 surfaceM2: 392,
 coveredM2: 162,
 bedrooms: 3,
 bathrooms: 2,
 parking: true,
 price: 214000,
 currency: 'USD',
 showPrice: true,
 featured: false,
 images: [
 { id: 'property-4-image-1', url: buildPropertyMockImage({ scene: 'residencial', toneA: '#f1f5f9', toneB: '#cbd5e1', accent: '#475569', shadow: '#0f172a' }), alt: 'Casa reciclada en Chacras de Coria', isCover: true },
 { id: 'property-4-image-2', url: buildPropertyMockImage({ scene: 'residencial', toneA: '#fae8ff', toneB: '#e9d5ff', accent: '#9333ea', shadow: '#111827' }), alt: 'Galería de la casa reciclada', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero conocer una alternativa similar a la Casa reciclada en Chacras de Coria.',
 }),
 createProperty({
 id: 'property-5',
 slug: 'departamento-inversion-palermo',
 title: 'Departamento de inversión en Palermo',
 type: 'departamento',
 operation: 'venta',
 availability: 'disponible',
 location: 'Ciudad Autónoma de Buenos Aires',
 province: 'Buenos Aires',
 addressOrZone: 'Palermo Soho',
 shortDescription: 'Unidad compacta, moderna y pensada para renta temporaria o primer ticket de inversión.',
 description: 'Departamento con ubicación estratégica y muy buena salida comercial. Ideal para mostrar cómo publicar sin precio visible y llevar la conversión a una consulta calificada.',
 surfaceM2: 56,
 coveredM2: 49,
 bedrooms: 1,
 bathrooms: 1,
 parking: false,
 price: undefined,
 currency: 'USD',
 showPrice: false,
 featured: false,
 images: [
 { id: 'property-5-image-1', url: buildPropertyMockImage({ scene: 'urbano', toneA: '#fae8ff', toneB: '#d8b4fe', accent: '#9333ea', shadow: '#0f172a' }), alt: 'Departamento de inversión en Palermo', isCover: true },
 { id: 'property-5-image-2', url: buildPropertyMockImage({ scene: 'urbano', toneA: '#fef3c7', toneB: '#fcd34d', accent: '#b45309', shadow: '#111827' }), alt: 'Vista urbana del departamento de inversión', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero consultar por el Departamento de inversión en Palermo.',
 }),
 createProperty({
 id: 'property-6',
 slug: 'cabana-premium-villa-angostura',
 title: 'Cabaña premium junto al lago',
 type: 'cabana',
 operation: 'venta',
 availability: 'oculta',
 location: 'Villa La Angostura, Neuquén',
 province: 'Neuquén',
 addressOrZone: 'Entorno de bahía y bosque',
 shortDescription: 'Publicación oculta para validar manejo de stock no visible desde el panel comercial.',
 description: 'Cabaña premium incluida para testear alta, edición y control de publicaciones ocultas sin exponerlas en el catálogo público.',
 surfaceM2: 520,
 coveredM2: 138,
 bedrooms: 3,
 bathrooms: 3,
 parking: true,
 price: 268000,
 currency: 'USD',
 showPrice: true,
 featured: false,
 images: [
 { id: 'property-6-image-1', url: buildPropertyMockImage({ scene: 'montana', toneA: '#cffafe', toneB: '#67e8f9', accent: '#0f766e', shadow: '#0f172a' }), alt: 'Cabaña premium junto al lago', isCover: true },
 { id: 'property-6-image-2', url: buildPropertyMockImage({ scene: 'montana', toneA: '#d1fae5', toneB: '#34d399', accent: '#047857', shadow: '#111827' }), alt: 'Entorno natural de la cabaña premium', isCover: false },
 ],
 whatsappMessage: 'Hola, quiero consultar por una Cabaña premium junto al lago.',
 }),
];

export const mockLeads: Lead[] = [
 { id: 'lead-1', developmentSlug: 'altos-del-faro', lotId: 'altos-del-faro-lot-4', lotCode: 'altos-del-faro-04', lotLabel: 'Lote 04', name: 'Luciana Pereyra', phone: '+54 9 223 412 8890', email: 'luciana.p@email.com', message: 'Quiero recibir valores estimados y plan de cuotas.', source: 'lote', createdAt: '2026-03-08T10:30:00.000Z', status: 'nuevo' },
 { id: 'lead-2', developmentSlug: 'lagos-del-este', lotId: 'lagos-del-este-lot-11', lotCode: 'lagos-del-este-11', lotLabel: 'Lote 11', name: 'Mariano Suárez', phone: '+54 9 341 520 1144', email: 'mariano.s@email.com', message: 'Necesito saber si aceptan anticipo en dos pagos.', source: 'lote', createdAt: '2026-03-07T15:20:00.000Z', status: 'contactado' },
 { id: 'lead-3', developmentSlug: 'miradores-del-valle', name: 'Paula Ceballos', phone: '+54 9 299 401 2222', email: 'paulac@email.com', message: 'Busco lotes de más de 340 m² y financiación en 48 cuotas.', source: 'contacto', createdAt: '2026-03-06T18:05:00.000Z', status: 'seguimiento' },
 { id: 'lead-4', developmentSlug: 'altos-del-faro', lotId: 'altos-del-faro-lot-16', lotCode: 'altos-del-faro-16', lotLabel: 'Lote 16', name: 'Iván Gallardo', phone: '+54 9 223 477 9800', email: 'ivang@email.com', message: 'Consultar lote con frente al boulevard y forma de reserva.', source: 'lote', createdAt: '2026-03-05T11:45:00.000Z', status: 'nuevo' },
 { id: 'lead-5', developmentSlug: 'lagos-del-este', lotCode: 'lagos-del-este-06', lotLabel: 'Lote 06', name: 'Carolina Ferreyra', phone: '+54 9 341 611 4300', email: 'carolina.f@email.com', message: 'Avísenme si se libera este lote o aparece uno similar.', source: 'alerta', createdAt: '2026-03-04T14:10:00.000Z', status: 'nuevo' },
 { id: 'lead-6', propertyId: 'property-2', propertySlug: 'departamento-premium-puerto-norte', propertyLabel: 'Departamento premium en Puerto Norte', name: 'Micaela Ríos', phone: '+54 9 341 540 0031', email: 'micaela.rios@email.com', message: 'Quiero coordinar una visita y conocer los requisitos del alquiler.', source: 'propiedad', createdAt: '2026-03-03T16:40:00.000Z', status: 'contactado' },
];
