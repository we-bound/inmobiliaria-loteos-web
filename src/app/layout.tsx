import type { Metadata } from 'next';

import { Footer, Navbar } from '@/components/layout';
import { Providers } from '@/components/providers';
import { loadAppBootstrapData } from '@/lib/server/catalog';

import './globals.css';

export const metadata: Metadata = {
 title: 'Prados del Sur Desarrollos',
 description: 'Mock web inmobiliaria para mostrar loteos, disponibilidad y captura de leads.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 const bootstrap = await loadAppBootstrapData();

 return (
 <html lang={'es'}>
 <body className={'overflow-x-hidden'}>
 <Providers initialDevelopments={bootstrap.developments} initialProperties={bootstrap.properties} initialLeads={bootstrap.leads}>
 <div className={'min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_24%),linear-gradient(180deg,#f6f8fb,#eef3f8)] text-slate-900'}>
 <Navbar />
 <main className={'mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10'}>{children}</main>
 <Footer />
 </div>
 </Providers>
 </body>
 </html>
 );
}
