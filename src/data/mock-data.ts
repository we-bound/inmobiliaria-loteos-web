import { Development, Lead, Lot, LotStatus } from '@/types';

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

export const mockDevelopments: Development[] = [
 createDevelopment({ id: 'dev-1', slug: 'prados-del-sur', name: 'Prados del Sur', location: 'Villa Allende, Cordoba', province: 'Cordoba', shortDescription: 'Loteo abierto con financiacion flexible y lectura inmediata de disponibilidad.', heroDescription: 'Un desarrollo pensado para ordenar consultas, estados y seguimiento comercial desde una interfaz clara.', generalStatus: 'Comercializacion activa', coverTheme: 'from-sky-100 via-white to-emerald-50', amenities: ['Plaza central', 'SUM', 'Boulevard arbolado'], priceBase: 24500000, topStreet: 'Calle Manuela Pedraza', bottomStreet: 'Calle Correa Morales' }),
 createDevelopment({ id: 'dev-2', slug: 'altos-de-la-canada', name: 'Altos de la Canada', location: 'Mendiolaza, Cordoba', province: 'Cordoba', shortDescription: 'Barrio residencial con lotes amplios, plazas internas y salida rapida al corredor.', heroDescription: 'Ideal para mostrar estados de lote en tiempo real y abrir consultas con pocos pasos.', generalStatus: 'Ultima etapa', coverTheme: 'from-sky-50 via-white to-cyan-50', amenities: ['Ingreso jerarquizado', 'Area comun', 'Calles internas'], priceBase: 22800000, topStreet: 'Avenida de los Tilos', bottomStreet: 'Sendero Norte' }),
 createDevelopment({ id: 'dev-3', slug: 'senderos-del-valle', name: 'Senderos del Valle', location: 'Malagueno, Cordoba', province: 'Cordoba', shortDescription: 'Propuesta accesible, comercial y simple para ordenar oferta y captar interesados.', heroDescription: 'Una base visual prolija para esquematizar lotes, filtrar disponibilidad y convertir consultas.', generalStatus: 'Lanzamiento comercial', coverTheme: 'from-emerald-50 via-white to-teal-50', amenities: ['Sector verde', 'Zona comercial', 'Circuito peatonal'], priceBase: 19800000, topStreet: 'Calle del Horizonte', bottomStreet: 'Calle del Parque' }),
];

export const mockLeads: Lead[] = [
 { id: 'lead-1', developmentSlug: 'prados-del-sur', lotId: 'prados-del-sur-lot-4', lotCode: 'prados-del-sur-04', lotLabel: 'Lote 04', name: 'Luciana Pereyra', phone: '+54 9 351 412 8890', email: 'luciana.p@email.com', message: 'Quiero recibir valores estimados y plan de cuotas.', source: 'lote', createdAt: '2026-03-08T10:30:00.000Z', status: 'nuevo' },
 { id: 'lead-2', developmentSlug: 'altos-de-la-canada', lotId: 'altos-de-la-canada-lot-11', lotCode: 'altos-de-la-canada-11', lotLabel: 'Lote 11', name: 'Mariano Suarez', phone: '+54 9 351 520 1144', email: 'mariano.s@email.com', message: 'Necesito saber si aceptan anticipo en dos pagos.', source: 'lote', createdAt: '2026-03-07T15:20:00.000Z', status: 'contactado' },
 { id: 'lead-3', developmentSlug: 'senderos-del-valle', name: 'Paula Ceballos', phone: '+54 9 351 401 2222', email: 'paulac@email.com', message: 'Busco lotes de mas de 340 m2 y financiacion en 48 cuotas.', source: 'contacto', createdAt: '2026-03-06T18:05:00.000Z', status: 'seguimiento' },
 { id: 'lead-4', developmentSlug: 'prados-del-sur', lotId: 'prados-del-sur-lot-16', lotCode: 'prados-del-sur-16', lotLabel: 'Lote 16', name: 'Ivan Gallardo', phone: '+54 9 351 477 9800', email: 'ivang@email.com', message: 'Consultar lote con frente al boulevard y forma de reserva.', source: 'lote', createdAt: '2026-03-05T11:45:00.000Z', status: 'nuevo' },
 { id: 'lead-5', developmentSlug: 'prados-del-sur', lotCode: 'prados-del-sur-06', lotLabel: 'Lote 06', name: 'Carolina Ferreyra', phone: '+54 9 351 611 4300', email: 'carolina.f@email.com', message: 'Avisenme si se libera este lote o aparece uno similar.', source: 'alerta', createdAt: '2026-03-04T14:10:00.000Z', status: 'nuevo' },
];
