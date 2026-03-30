export const siteConfig = {
 brand: {
 monogram: 'NH',
 name: 'Nexo Hábitat',
 legalName: 'Nexo Hábitat Desarrollos',
 tagline: 'Desarrollos y propiedades',
 description: 'Loteos, desarrollos y propiedades con información clara, disponibilidad actualizada y contacto comercial ágil.',
 },
 contact: {
 whatsappNumber: '5491141208800',
 phoneDisplay: '+54 9 11 4120 8800',
 email: 'hola@nexohabitat.com.ar',
 address: 'Av. del Libertador 6320, Ciudad Autónoma de Buenos Aires',
 whatsappIntro: 'Hola, quiero recibir información sobre loteos y propiedades disponibles.',
 homeWhatsAppIntro: 'Hola, quiero conocer opciones de loteos y propiedades disponibles.',
 },
} as const;

export type SiteConfig = typeof siteConfig;
