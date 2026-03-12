import { Development, Lot } from '@/types';

const WHATSAPP_NUMBER = '5493515550101';

export function buildWhatsAppLink(development?: Development, lot?: Lot, name?: string) {
 const parts = [
 'Hola,',
 name ? 'soy ' + name + '.' : 'quiero consultar por un lote.',
 development ? 'Me interesa ' + development.name + '.' : '',
 lot ? 'Necesito precio y cuotas del Lote ' + lot.number + '.' : '',
 ].filter(Boolean);

 return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(parts.join(' '));
}
