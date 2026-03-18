'use client';

import { useState } from 'react';

import { AdminAirtablePanel } from '@/components/admin-airtable';
import { AdminPropertiesPanel } from '@/components/admin-properties';
import { AdminSidebar, LeadsTable, LotsTable, MetricsCards } from '@/components/admin-ui';
import { useAppData } from '@/components/providers';
import { airtableIntegrationEnabled } from '@/lib/features';

type VisibleAdminTab = 'lots' | 'properties' | 'integrations';

export function AdminPage() {
 const { developments, leads, updateLot } = useAppData();
 const [selectedDevelopment, setSelectedDevelopment] = useState('all');
 const [selectedStatus, setSelectedStatus] = useState('all');
 const [selectedTab, setSelectedTab] = useState<VisibleAdminTab>('lots');
 const lotLeads = leads.filter((lead) => lead.source !== 'propiedad');
 const propertyLeads = leads.filter((lead) => lead.source === 'propiedad');

 const tabs = airtableIntegrationEnabled
 ? [
 { id: 'lots' as const, label: 'Lotes', description: 'Disponibilidad y leads', testId: 'admin-tab-lots' },
 { id: 'properties' as const, label: 'Propiedades', description: 'Alquiler y venta', testId: 'admin-tab-properties' },
 { id: 'integrations' as const, label: 'Integraciones', description: 'Airtable y fuente de datos', testId: 'admin-tab-integrations' },
 ]
 : [
 { id: 'lots' as const, label: 'Lotes', description: 'Disponibilidad y leads', testId: 'admin-tab-lots' },
 { id: 'properties' as const, label: 'Propiedades', description: 'Alquiler y venta', testId: 'admin-tab-properties' },
 ];

 return (
 <div data-testid={'admin-page'} className={'min-w-0 space-y-8'}>
 <section className={'rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)]'}>
 <div className={'flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'}>
 <div className={'max-w-3xl'}>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-sky-700'}>Admin mock</p>
 <h1 className={'mt-3 text-4xl font-semibold text-slate-950'}>Panel comercial simple para la demo</h1>
 <p className={'mt-3 text-lg leading-8 text-slate-600'}>Separá loteos y propiedades en dashboards distintos para que el cliente entienda rápido cómo se administran disponibilidades, publicaciones y leads.</p>
 </div>

 <div className={'grid gap-2 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2' + (airtableIntegrationEnabled ? ' lg:grid-cols-3' : '')}>
 {tabs.map((tab) => {
 const active = selectedTab === tab.id;

 return (
 <button
 key={tab.id}
 type={'button'}
 data-testid={tab.testId}
 onClick={() => setSelectedTab(tab.id)}
 className={'rounded-[1.1rem] px-4 py-3 text-left transition ' + (active ? 'bg-white text-slate-950 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.2)] ring-1 ring-sky-100' : 'text-slate-600 hover:bg-white hover:text-slate-950')}
 >
 <div className={'text-sm font-semibold'}>{tab.label}</div>
 <div className={'mt-1 text-xs text-slate-500'}>{tab.description}</div>
 </button>
 );
 })}
 </div>
 </div>
 </section>

 {selectedTab === 'lots' ? (
 <div data-testid={'admin-panel-view'} className={'space-y-8'}>
 <section className={'grid gap-6 xl:grid-cols-[0.35fr_0.65fr]'}>
 <AdminSidebar />
 <div className={'min-w-0 space-y-6'}>
 <div>
 <p className={'text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'}>Dashboard de lotes</p>
 <h2 className={'mt-3 text-3xl font-semibold text-slate-950'}>Disponibilidad, alertas y leads de lotes</h2>
 <p className={'mt-3 text-lg leading-8 text-slate-600'}>Todo el panel sigue funcionando con estado local compartido para mostrar actualización inmediata de lotes, precios, anticipo, cuotas y alertas comerciales.</p>
 </div>
 <MetricsCards developments={developments} leads={lotLeads} />
 </div>
 </section>

 <LotsTable
 developments={developments}
 selectedDevelopment={selectedDevelopment}
 selectedStatus={selectedStatus}
 onChangeDevelopment={setSelectedDevelopment}
 onChangeStatus={setSelectedStatus}
 onUpdateLot={(developmentSlug, lotCode, patch) => {
 updateLot(developmentSlug, lotCode, {
 ...(patch.status ? { status: patch.status } : {}),
 ...(typeof patch.price === 'number' ? { price: patch.price } : {}),
 financing: {
 ...(typeof patch.downPayment === 'number' ? { downPayment: patch.downPayment } : {}),
 ...(typeof patch.installments === 'number' ? { installments: patch.installments } : {}),
 ...(typeof patch.installmentValue === 'number' ? { installmentValue: patch.installmentValue } : {}),
 },
 });
 }}
 />

 <LeadsTable
 leads={lotLeads}
 title={'Leads de lotes y alertas'}
 description={'Consultas y alertas comerciales originadas desde loteos, mapa y detalle de lote.'}
 testId={'admin-lot-leads-table'}
 />
 </div>
 ) : selectedTab === 'properties' ? (
 <div data-testid={'admin-properties-tab-view'}>
 <AdminPropertiesPanel leads={propertyLeads} />
 </div>
 ) : (
 <div data-testid={'admin-integrations-view'}>
 <AdminAirtablePanel />
 </div>
 )}
 </div>
 );
}
