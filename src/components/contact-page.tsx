'use client';

import { InquiryForm } from '@/components/lot-interactions';
import { siteConfig } from '@/lib/site-config';

export function ContactPage() {
 return (
 <div data-testid={'contact-page'} className={'min-w-0 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]'}>
 <section className={'rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_70px_-48px_rgba(15,23,42,0.28)]'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Contacto</p>
 <h1 className={'mt-3 text-4xl font-semibold text-slate-950'}>Hablemos de tu próxima operación inmobiliaria.</h1>
 <p className={'mt-4 text-lg leading-8 text-slate-600'}>{siteConfig.brand.legalName} centraliza consultas para responder disponibilidad, valores, financiación y oportunidades de loteos o propiedades con una atención comercial ágil.</p>

 <div className={'mt-8 space-y-4 text-sm text-slate-600'}>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>WhatsApp</p><p className={'mt-2 font-semibold text-slate-950'}>{siteConfig.contact.phoneDisplay}</p></div>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>Email</p><p className={'mt-2 font-semibold text-slate-950'}>{siteConfig.contact.email}</p></div>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>Casa central</p><p className={'mt-2 font-semibold text-slate-950'}>{siteConfig.contact.address}</p></div>
 </div>
 </section>

 <section className={'rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_70px_-48px_rgba(15,23,42,0.28)]'}>
 <InquiryForm source={'contacto'} submitLabel={'Enviar consulta'} description={'Dejanos tus datos y te enviamos opciones de loteos, propiedades, valores estimados y alternativas comerciales según tu búsqueda.'} />
 </section>
 </div>
 );
}
