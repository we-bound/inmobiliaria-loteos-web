'use client';

import { InquiryForm } from '@/components/lot-interactions';

export function ContactPage() {
 return (
 <div data-testid={'contact-page'} className={'min-w-0 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]'}>
 <section className={'rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_70px_-48px_rgba(15,23,42,0.28)]'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Contacto</p>
 <h1 className={'mt-3 text-4xl font-semibold text-slate-950'}>Hablemos de tu proximo lote.</h1>
 <p className={'mt-4 text-lg leading-8 text-slate-600'}>Centralizamos consultas para responder precio, anticipo, cuotas, disponibilidad y alertas de nuevos lotes de forma clara y ordenada.</p>

 <div className={'mt-8 space-y-4 text-sm text-slate-600'}>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>WhatsApp</p><p className={'mt-2 font-semibold text-slate-950'}>+54 9 351 555 0101</p></div>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>Email</p><p className={'mt-2 font-semibold text-slate-950'}>ventas@pradosdelsur.com.ar</p></div>
 <div className={'rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4'}><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>Oficina</p><p className={'mt-2 font-semibold text-slate-950'}>Av. Recta Martinolli 7821, Cordoba Capital</p></div>
 </div>
 </section>

 <section className={'rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_70px_-48px_rgba(15,23,42,0.28)]'}>
 <InquiryForm source={'contacto'} submitLabel={'Enviar consulta'} description={'Dejanos tus datos y te enviamos opciones de lote, valores estimados, planes de financiacion o alertas comerciales si todavia estas evaluando.'} />
 </section>
 </div>
 );
}
