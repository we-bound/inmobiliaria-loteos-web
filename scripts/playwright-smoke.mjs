import fs from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';

const baseUrl = 'http://127.0.0.1:3000';
const outputDir = path.resolve('.playwright-smoke');

fs.mkdirSync(outputDir, { recursive: true });

async function launchBrowser() {
 try {
 return await chromium.launch({ channel: 'msedge', headless: true });
 } catch (error) {
 console.warn('Fallo msedge, pruebo con Chromium empaquetado.', error instanceof Error ? error.message : error);
 return chromium.launch({ headless: true });
 }
}

function collectPageSignals(page) {
 const consoleErrors = [];
 const pageErrors = [];
 const failedRequests = [];
 page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
 page.on('pageerror', (error) => { pageErrors.push(error.message); });
 page.on('requestfailed', (request) => {
 const errorText = request.failure()?.errorText || 'unknown';
 if (errorText === 'net::ERR_ABORTED' || request.url().includes('_rsc=')) return;
 failedRequests.push(request.method() + ' ' + request.url() + ' - ' + errorText);
 });
 return { consoleErrors, pageErrors, failedRequests };
}

async function inspectPage(context, config, issues) {
 const page = await context.newPage();
 const signals = collectPageSignals(page);
 const response = await page.goto(baseUrl + config.path, { waitUntil: 'networkidle' });
 if (!response || !response.ok()) issues.push('La ruta ' + config.path + ' devolvio un estado inesperado.');
 if (config.readySelector) await page.locator(config.readySelector).first().waitFor({ state: 'visible', timeout: 10000 });
 if (config.actions) await config.actions(page);
 await page.screenshot({ path: path.join(outputDir, config.name + '.png'), fullPage: true });
 if (signals.consoleErrors.length) issues.push(config.name + ': errores de consola -> ' + signals.consoleErrors.join(' | '));
 if (signals.pageErrors.length) issues.push(config.name + ': errores de pagina -> ' + signals.pageErrors.join(' | '));
 if (signals.failedRequests.length) issues.push(config.name + ': requests fallidos -> ' + signals.failedRequests.join(' | '));
 await page.close();
}

const browser = await launchBrowser();
const desktop = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
const mobile = await browser.newContext({ viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true });
const issues = [];

await inspectPage(desktop, { name: 'home', path: '/', readySelector: 'h1' }, issues);
await inspectPage(desktop, { name: 'loteos', path: '/loteos', readySelector: 'h1' }, issues);
await inspectPage(desktop, { name: 'detalle-desktop', path: '/loteos/prados-del-sur', readySelector: 'svg', actions: async (page) => { await page.getByRole('button', { name: 'Lista' }).click(); await page.getByRole('button', { name: 'Mapa' }).click(); await page.locator('svg g').nth(10).click(); await page.getByRole('button', { name: 'Ver precio y cuotas' }).waitFor({ state: 'visible', timeout: 10000 }); } }, issues);
await inspectPage(mobile, { name: 'detalle-mobile', path: '/loteos/prados-del-sur', readySelector: 'svg', actions: async (page) => { await page.locator('svg g').nth(10).click(); await page.getByRole('button', { name: 'Ver precio y cuotas' }).waitFor({ state: 'visible', timeout: 10000 }); } }, issues);
await inspectPage(desktop, { name: 'contacto', path: '/contacto', readySelector: 'h1', actions: async (page) => { await page.getByRole('button', { name: 'Enviar consulta' }).click(); await page.getByText('Ingresá nombre y apellido.').waitFor({ state: 'visible', timeout: 10000 }); } }, issues);
await inspectPage(desktop, { name: 'admin', path: '/admin', readySelector: 'h1' }, issues);

const headerPage = await desktop.newPage();
const headerResponse = await headerPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
const headers = headerResponse ? headerResponse.headers() : {};
for (const header of ['x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'content-security-policy']) { if (!headers[header]) issues.push('Falta el header de seguridad ' + header + '.'); }
await headerPage.close();

await desktop.close();
await mobile.close();
await browser.close();

if (issues.length) { console.error(JSON.stringify({ ok: false, issues }, null, 2)); process.exitCode = 1; } else { console.log(JSON.stringify({ ok: true, screenshots: fs.readdirSync(outputDir) }, null, 2)); }
