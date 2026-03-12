'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
 { href: '/', label: 'Inicio', testId: 'nav-link-inicio' },
 { href: '/loteos', label: 'Loteos', testId: 'nav-link-loteos' },
 { href: '/contacto', label: 'Contacto', testId: 'nav-link-contacto' },
 { href: '/admin', label: 'Admin', testId: 'nav-link-admin' },
];

export function Navbar() {
 const pathname = usePathname();
 const activeItem = navItems.find((item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) || navItems[0];

 return (
 <header data-testid={'site-header'} className={'sticky top-0 z-50 border-b border-white/70 bg-[rgba(248,250,252,0.9)] backdrop-blur-xl'}>
 <div className={'mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8'}>
 <Link href={'/'} data-testid={'brand-link'} className={'flex items-center gap-3'}>
 <div className={'flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f4c81,#1e88a8)] text-sm font-semibold text-white shadow-lg shadow-sky-900/10'}>
 PS
 </div>
 <div>
 <p className={'font-semibold uppercase tracking-[0.16em] text-slate-500'}>Prados del Sur</p>
 <p className={'text-sm text-slate-700'}>Desarrollos inmobiliarios</p>
 </div>
 </Link>

 <div className={'flex items-center gap-3 md:hidden'}>
 <span className={'inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-900'}>
 {activeItem.label}
 </span>
 <a
 data-testid={'header-whatsapp-cta-mobile'}
 href={'https://wa.me/5493515550101?text=Hola%2C%20quiero%20consultar%20por%20loteos%20disponibles.'}
 target={'_blank'}
 rel={'noopener noreferrer'}
 className={'inline-flex items-center justify-center rounded-full bg-[#0f4c81] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0b3f6d]'}
 >
 WhatsApp
 </a>
 </div>

 <nav data-testid={'main-nav'} className={'hidden items-center gap-2 rounded-full border border-white/80 bg-white p-1.5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)] md:flex'}>
 {navItems.map((item) => {
 const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

 return (
 <Link
 key={item.href}
 href={item.href}
 data-testid={item.testId}
 className={'rounded-full px-4 py-2 text-sm font-medium transition ' + (active ? 'bg-sky-50 text-sky-950 ring-1 ring-sky-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}
 >
 {item.label}
 </Link>
 );
 })}
 </nav>

 <a
 data-testid={'header-whatsapp-cta'}
 href={'https://wa.me/5493515550101?text=Hola%2C%20quiero%20consultar%20por%20loteos%20disponibles.'}
 target={'_blank'}
 rel={'noopener noreferrer'}
 className={'hidden items-center justify-center rounded-full bg-[#0f4c81] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0b3f6d] md:inline-flex'}
 >
 WhatsApp
 </a>
 </div>
 </header>
 );
}

export function Footer() {
 return (
 <footer className={'border-t border-slate-200/80 bg-white/85'}>
 <div className={'mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8'}>
 <div>
 <p className={'font-semibold text-slate-900'}>Prados del Sur Desarrollos</p>
 <p>Mock comercial para mostrar loteos, disponibilidad y captura de interesados.</p>
 </div>
 <div className={'flex flex-col gap-1 text-left lg:text-right'}>
 <p>Av. Recta Martinolli 7821, Cordoba</p>
 <p>ventas@pradosdelsur.com.ar</p>
 <p>+54 9 351 555 0101</p>
 </div>
 </div>
 </footer>
 );
}
