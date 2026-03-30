'use client';

import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';

import { useAppData } from '@/components/providers';
import { cn, formatArea, formatCurrency, statusMeta } from '@/lib/format';
import { buildPropertyWhatsAppLink, buildWhatsAppLink } from '@/lib/whatsapp';
import { Development, LeadSource, Lot, LotStatus, Property } from '@/types';

interface FormFields {
 name: string;
 phone: string;
 email: string;
 message: string;
}

function validate(fields: FormFields) {
 const errors: Partial<FormFields> = {};
 if (!fields.name.trim()) errors.name = 'Ingresa nombre y apellido.';
 if (!fields.phone.trim()) errors.phone = 'Ingresa teléfono o WhatsApp.';
 if (!fields.email.trim()) {
 errors.email = 'Ingresa un email.';
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
 errors.email = 'Revisa el formato del email.';
 }
 return errors;
}

function defaultMessage(source: LeadSource, development?: Development, lot?: Lot, property?: Property) {
 if (source === 'alerta') {
 if (lot && development) {
 return 'Quiero que me avisen si se libera el Lote ' + lot.number + ' o aparece uno similar en ' + development.name + '.';
 }

 return 'Quiero recibir novedades si aparece disponibilidad similar en este loteo.';
 }

 if (source === 'propiedad' && property) {
 return 'Quiero más información sobre ' + property.title + ' y coordinar una visita.';
 }

 if (source === 'propiedad') {
 return 'Quiero recibir opciones similares y coordinar contacto comercial.';
 }

 if (lot) {
 return 'Quiero recibir precio, anticipo y cuotas del Lote ' + lot.number + '.';
 }

 return '';
}

function countByStatus(development: Development, status: LotStatus) {
 return development.lots.filter((lot) => lot.status === status).length;
}

function selectLot(onSelectLot: (lot: Lot) => void, lot: Lot) {
 onSelectLot(lot);
}

export function SitePlanMap(props: { development: Development; selectedLotId?: string; filteredStatus: 'all' | LotStatus; onSelectLot: (lot: Lot) => void; }) {
 const containerRef = useRef<HTMLDivElement | null>(null);
 const [isCompactMap, setIsCompactMap] = useState(false);
 const availableCount = countByStatus(props.development, 'disponible');
 const consultedCount = countByStatus(props.development, 'consultado');
 const reservedCount = countByStatus(props.development, 'reservado');
 const soldCount = countByStatus(props.development, 'vendido');

 useEffect(() => {
 if (!containerRef.current || typeof ResizeObserver === 'undefined') {
 return undefined;
 }

 const observer = new ResizeObserver(([entry]) => {
 setIsCompactMap(entry.contentRect.width < 520);
 });

 observer.observe(containerRef.current);
 return () => observer.disconnect();
 }, []);

 return (
 <section data-testid={'site-plan-map'} className={'min-w-0 rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.24)] sm:p-5'}>
 <div className={'mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'}>
 <div>
 <p className={'text-sm font-semibold text-slate-900'}>Plano interactivo del loteo</p>
 <p className={'mt-1 text-sm text-slate-500'}>Tocá un lote para ver estado, financiación y consulta inmediata.</p>
 </div>
 <div className={'flex flex-wrap gap-2 text-xs text-slate-600'}>
 <span className={'rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-800'}>{availableCount} disponibles</span>
 <span className={'rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-amber-800'}>{consultedCount} consultados</span>
 <span className={'rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700'}>{reservedCount} reservados</span>
 <span className={'rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-rose-700'}>{soldCount} vendidos</span>
 </div>
 </div>

 <div className={'rounded-[1.75rem] border border-slate-200 bg-[#eff4fb] p-3 sm:p-4'}>
 <div className={'overflow-hidden'}>
 <div ref={containerRef} className={'mx-auto aspect-[846/1020] w-full max-w-[860px] overflow-hidden rounded-[1.4rem]'}>
 <svg data-testid={'site-plan-svg'} viewBox={props.development.siteMap.viewBox} role={'img'} aria-label={'Plano de ' + props.development.name} preserveAspectRatio={'xMidYMid meet'} className={'h-full w-full'}>
 <rect x={18} y={18} width={810} height={970} rx={18} className={'fill-transparent stroke-slate-300'} />
 {props.development.siteMap.elements.map((element) => (
 <g key={element.id}>
 <rect x={element.x} y={element.y} width={element.width} height={element.height} rx={element.type === 'street' ? 12 : 18} className={element.type === 'street' ? 'fill-slate-200 stroke-slate-200' : element.type === 'green' ? 'fill-emerald-200 stroke-emerald-400' : 'fill-sky-100 stroke-sky-200'} />
 {element.label ? <text x={element.labelX || element.x + element.width / 2} y={element.labelY || element.y + element.height / 2} textAnchor={'middle'} className={cn('fill-slate-700 font-semibold tracking-[0.04em]', isCompactMap ? 'text-[12px]' : 'text-[15px]')}>{element.label}</text> : null}
 </g>
 ))}

 {props.development.lots.map((lot) => {
 const selected = props.selectedLotId === lot.id;
 const filteredOut = props.filteredStatus !== 'all' && lot.status !== props.filteredStatus;
 const handleSelect = () => selectLot(props.onSelectLot, lot);

 return (
 <g key={lot.id} data-testid={'site-plan-lot-' + lot.lotCode} role={'button'} tabIndex={0} className={'cursor-pointer'} style={{ touchAction: 'manipulation' }} onClick={handleSelect} onPointerUp={(event) => { if (event.pointerType !== 'mouse') { handleSelect(); } }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSelect(); } }}>
 <rect data-testid={'site-plan-lot-hit-' + lot.lotCode} x={lot.mapPosition.x} y={lot.mapPosition.y} width={lot.mapPosition.width} height={lot.mapPosition.height} rx={12} className={cn('stroke-[2.5] transition duration-200', statusMeta[lot.status].mapClass, filteredOut ? 'opacity-30' : selected ? 'opacity-100 drop-shadow-md' : 'opacity-95 hover:opacity-100')} />
 {selected ? <rect x={lot.mapPosition.x - 3} y={lot.mapPosition.y - 3} width={lot.mapPosition.width + 6} height={lot.mapPosition.height + 6} rx={14} className={'fill-transparent stroke-slate-950 stroke-[3]'} /> : null}
 <text x={lot.mapPosition.x + lot.mapPosition.width / 2} y={lot.mapPosition.y + lot.mapPosition.height / 2 + (isCompactMap ? 5 : 7)} textAnchor={'middle'} className={cn('pointer-events-none fill-slate-950 font-semibold', isCompactMap ? 'text-[14px]' : 'text-[17px]')}>{lot.number}</text>
 </g>
 );
 })}
 </svg>
 </div>
 </div>
 </div>

 <div data-testid={'site-plan-legend'} className={'mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4'}>
 {([
 ['disponible', availableCount],
 ['consultado', consultedCount],
 ['reservado', reservedCount],
 ['vendido', soldCount],
 ] as Array<[LotStatus, number]>).map(([status, count]) => (
 <div key={status} className={'flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'}>
 <div className={'flex items-center gap-2'}>
 <span className={cn('h-2.5 w-2.5 rounded-full', status === 'disponible' ? 'bg-emerald-500' : status === 'consultado' ? 'bg-amber-400' : status === 'reservado' ? 'bg-slate-400' : 'bg-rose-400')} />
 <span>{statusMeta[status].label}</span>
 </div>
 <span className={'font-semibold text-slate-900'}>{count}</span>
 </div>
 ))}
 </div>
 </section>
 );
}

export function InquiryForm(props: { development?: Development; lot?: Lot; property?: Property; source: LeadSource; submitLabel: string; description: string; showWhatsAppButton?: boolean; }) {
 const { submitLead, showToast } = useAppData();
 const [isPending, startSubmit] = useTransition();
 const [errors, setErrors] = useState<Partial<FormFields>>({});
 const [sent, setSent] = useState(false);
 const [company, setCompany] = useState('');
 const [startedAt, setStartedAt] = useState(() => Date.now());
 const [fields, setFields] = useState<FormFields>({
 name: '',
 phone: '',
 email: '',
 message: defaultMessage(props.source, props.development, props.lot, props.property),
 });

 function updateField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
 setFields((current) => ({ ...current, [key]: value }));
 }

 function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 const nextErrors = validate(fields);
 setErrors(nextErrors);

 if (Object.keys(nextErrors).length > 0) {
 showToast({ title: 'Revisa el formulario', description: 'Hay campos incompletos o con formato inválido.', tone: 'error' });
 return;
 }

 startSubmit(() => {
 submitLead({ developmentSlug: props.development?.slug, lotId: props.lot?.id, lotCode: props.lot?.lotCode, lotLabel: props.lot ? 'Lote ' + props.lot.number : undefined, propertyId: props.property?.id, propertySlug: props.property?.slug, propertyLabel: props.property?.title, name: fields.name, phone: fields.phone, email: fields.email, message: fields.message, source: props.source }, { startedAt, company });
 setSent(true);
 setFields({ name: '', phone: '', email: '', message: defaultMessage(props.source, props.development, props.lot, props.property) });
 setCompany('');
 setStartedAt(Date.now());
 showToast({ title: props.source === 'alerta' ? 'Alerta registrada' : 'Consulta enviada', description: props.source === 'alerta' ? 'La alerta quedó lista para seguimiento comercial.' : props.source === 'propiedad' ? 'La consulta de la propiedad fue simulada con éxito.' : 'La consulta fue simulada con éxito y actualizó la UI.', tone: 'success' });
 });
 }

 const whatsappLink = props.property ? buildPropertyWhatsAppLink(props.property, fields.name) : buildWhatsAppLink(props.development, props.lot, fields.name);

 return (
 <form data-testid={props.property ? 'inquiry-form-property-' + props.property.slug : props.lot ? 'inquiry-form-lot-' + props.lot.lotCode : 'inquiry-form-' + props.source} onSubmit={handleSubmit} className={'space-y-4'}>
 <div>
 <p className={'text-sm font-semibold text-slate-900'}>{props.submitLabel}</p>
 <p className={'mt-1 text-sm leading-6 text-slate-500'}>{props.description}</p>
 </div>

 {sent ? <div className={'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'}>Gracias. El registro quedó listo para seguimiento comercial.</div> : null}

 <input type={'hidden'} name={'startedAt'} value={String(startedAt)} readOnly />
 <label className={'hidden'} aria-hidden={'true'}>
 <span>Empresa</span>
 <input data-testid={'inquiry-company-input'} tabIndex={-1} autoComplete={'off'} value={company} onChange={(event) => setCompany(event.target.value)} name={'company'} />
 </label>

 <div className={'grid gap-4 sm:grid-cols-2'}>
 <label className={'space-y-2'}><span className={'text-sm font-medium text-slate-700'}>Nombre y apellido</span><input data-testid={'inquiry-name-input'} value={fields.name} onChange={(event) => updateField('name', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white'} />{errors.name ? <span className={'text-xs text-rose-600'}>{errors.name}</span> : null}</label>
 <label className={'space-y-2'}><span className={'text-sm font-medium text-slate-700'}>Teléfono</span><input data-testid={'inquiry-phone-input'} value={fields.phone} onChange={(event) => updateField('phone', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white'} />{errors.phone ? <span className={'text-xs text-rose-600'}>{errors.phone}</span> : null}</label>
 </div>
 <label className={'space-y-2'}><span className={'text-sm font-medium text-slate-700'}>Email</span><input data-testid={'inquiry-email-input'} value={fields.email} onChange={(event) => updateField('email', event.target.value)} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white'} />{errors.email ? <span className={'text-xs text-rose-600'}>{errors.email}</span> : null}</label>
 <label className={'space-y-2'}><span className={'text-sm font-medium text-slate-700'}>Mensaje opcional</span><textarea data-testid={'inquiry-message-input'} value={fields.message} onChange={(event) => updateField('message', event.target.value)} rows={4} className={'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white'} /></label>
 <div className={'flex flex-col gap-3 sm:flex-row'}>
 <button data-testid={'inquiry-submit'} type={'submit'} disabled={isPending} className={'inline-flex items-center justify-center rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f6d] disabled:cursor-not-allowed disabled:opacity-70'}>{isPending ? 'Enviando...' : props.submitLabel}</button>
 {props.showWhatsAppButton !== false ? <a data-testid={'inquiry-whatsapp-cta'} href={whatsappLink} target={'_blank'} rel={'noopener noreferrer'} className={'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>Consultar por WhatsApp</a> : null}
 </div>
 </form>
 );
}

export function LotDetailSheet({ development, lot, open, onClose }: { development: Development; lot?: Lot; open: boolean; onClose: () => void; }) {
 useEffect(() => {
 if (!open) return undefined;
 const previous = document.body.style.overflow;
 document.body.style.overflow = 'hidden';
 function onKeyDown(event: KeyboardEvent) { if (event.key === 'Escape') onClose(); }
 window.addEventListener('keydown', onKeyDown);
 return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKeyDown); };
 }, [open, onClose]);

 if (!open || !lot) return null;

 const whatsappLink = buildWhatsAppLink(development, lot);
 const isAlertFlow = lot.status === 'reservado' || lot.status === 'vendido';
 const submitLabel = isAlertFlow ? 'Avisame si aparece uno similar' : 'Ver precio y cuotas';
 const description = isAlertFlow
 ? 'Dejanos tus datos y te avisamos si se libera este lote o aparece una alternativa similar en este loteo.'
 : 'Completá tus datos para recibir precio, anticipo y plan de cuotas.';

 return (
 <div className={'fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm md:items-center md:justify-end md:p-6'}>
 <button aria-label={'Cerrar'} className={'absolute inset-0'} onClick={onClose} />
 <div data-testid={'lot-detail-sheet'} className={'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-4 shadow-2xl sm:p-5 md:mr-4 md:h-[calc(100vh-7rem)] md:max-h-[840px] md:max-w-[560px] md:rounded-[2rem] md:p-6'}>
 <div className={'mb-5 flex items-start justify-between gap-4'}>
 <div>
 <p className={'text-sm font-semibold uppercase tracking-[0.18em] text-slate-400'}>{development.name}</p>
 <h3 className={'mt-2 text-3xl font-semibold text-slate-950'}>Lote {lot.number}</h3>
 <div className={'mt-3 flex flex-wrap items-center gap-2'}>
 <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusMeta[lot.status].tone)}>{statusMeta[lot.status].label}</span>
 <span className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'}>{lot.block}</span>
 <span className={'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'}>{lot.street}</span>
 </div>
 </div>
 <button data-testid={'lot-detail-close'} onClick={onClose} className={'inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900'}>×</button>
 </div>

 <div className={'rounded-[1.8rem] border border-sky-100 bg-[linear-gradient(180deg,#f7fbff,#ffffff)] p-5 shadow-[0_20px_45px_-36px_rgba(37,99,235,0.28)]'}>
 <div className={'grid gap-3 sm:grid-cols-3'}>
 <Info label={'Precio referencial'} value={formatCurrency(lot.price, lot.currency)} />
 <Info label={'Anticipo'} value={formatCurrency(lot.financing.downPayment, lot.financing.currency)} />
 <Info label={'Cuotas'} value={lot.financing.installments + ' x ' + formatCurrency(lot.financing.installmentValue, lot.financing.currency)} />
 </div>
 <div className={'mt-4 flex flex-col gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600'}>
 <p>{lot.description}</p>
 {isAlertFlow ? <p className={'rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-900'}>Este lote no está disponible para cierre inmediato, pero podés dejar una alerta para seguir una opción similar.</p> : <p className={'rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-900'}>Disponible para consulta comercial con precio, anticipo y plan de cuotas.</p>}
 </div>
 </div>

 <div className={'mt-5 grid gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:p-5'}>
 <Info label={'Manzana'} value={lot.block} />
 <Info label={'Calle'} value={lot.street} />
 <Info label={'Superficie'} value={formatArea(lot.area)} />
 <Info label={'Orientación'} value={lot.orientation} />
 <Info label={'Financiación'} value={lot.financing.available ? 'Sí' : 'No'} />
 <Info label={'Valor cuota'} value={formatCurrency(lot.financing.installmentValue, lot.financing.currency)} />
 </div>

 <div className={'mt-6'}>
 <InquiryForm key={lot.lotCode + '-' + (isAlertFlow ? 'alerta' : 'lote')} development={development} lot={lot} source={isAlertFlow ? 'alerta' : 'lote'} submitLabel={submitLabel} description={description} />
 </div>

 <a data-testid={'lot-whatsapp-cta'} href={whatsappLink} target={'_blank'} rel={'noopener noreferrer'} className={'mt-4 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950'}>Consultar este lote por WhatsApp</a>
 </div>
 </div>
 );
}

function Info({ label, value }: { label: string; value: string }) {
 return <div><p className={'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'}>{label}</p><p className={'mt-2 text-sm font-semibold text-slate-900'}>{value}</p></div>;
}
