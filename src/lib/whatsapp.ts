import { Development, Lot, Property } from '@/types';
import { siteConfig } from '@/lib/site-config';

const WHATSAPP_NUMBER = siteConfig.contact.whatsappNumber;

export function buildWhatsAppLink(development?: Development, lot?: Lot, name?: string) {
 const parts = [
 'Hola,',
 name ? 'soy ' + name + '.' : 'quiero consultar por un lote.',
 development ? 'Me interesa ' + development.name + '.' : '',
 lot ? 'Necesito precio y cuotas del Lote ' + lot.number + '.' : '',
 ].filter(Boolean);

 return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(parts.join(' '));
}

export function buildPropertyWhatsAppLink(property?: Property, name?: string) {
 if (property?.whatsappMessage) {
 const intro = name ? 'Hola, soy ' + name + '.' : 'Hola,';
 return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(intro + ' ' + property.whatsappMessage);
 }

 const parts = [
 'Hola,',
 name ? 'soy ' + name + '.' : 'quiero consultar por una propiedad.',
 property ? 'Me interesa ' + property.title + '.' : '',
 property ? 'Es una propiedad en ' + property.operation + ' ubicada en ' + property.location + '.' : '',
 property?.whatsappMessage || '',
 ].filter(Boolean);

 return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(parts.join(' '));
}
