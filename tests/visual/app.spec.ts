import { expect, test } from '@playwright/test';

async function waitForReady(page: import('@playwright/test').Page, testId: string) {
 await page.waitForLoadState('domcontentloaded');
 await page.getByTestId(testId).waitFor();
 await page.evaluate(async () => {
 await document.fonts.ready;
 });
}

test('home visual', async ({ page }) => {
 await page.goto('/');
 await waitForReady(page, 'home-page');
 await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
});

test('listado de loteos visual', async ({ page }) => {
 await page.goto('/loteos');
 await waitForReady(page, 'developments-page');
 await expect(page).toHaveScreenshot('developments-page.png', { fullPage: true });
});

test('detalle de loteo mapa visual', async ({ page }) => {
 await page.goto('/loteos/prados-del-sur');
 await waitForReady(page, 'development-detail-page');
 await page.getByTestId('site-plan-map').waitFor();
 await expect(page).toHaveScreenshot('development-map.png', { fullPage: true });
});

test('detalle de lote abierto visual', async ({ page }) => {
 await page.goto('/loteos/prados-del-sur');
 await waitForReady(page, 'development-detail-page');
 const lot = page.getByTestId('site-plan-lot-prados-del-sur-01');
 await lot.scrollIntoViewIfNeeded();
 await lot.click();
 const detailSheet = page.getByTestId('lot-detail-sheet');
 await detailSheet.waitFor();
 await expect(detailSheet).toHaveScreenshot('lot-detail-open.png');
});

test('admin visual', async ({ page }) => {
 await page.goto('/admin');
 await waitForReady(page, 'admin-page');
 const adminRoot = page.getByTestId('admin-page');
 await page.getByTestId('admin-lots-table').waitFor();
 await expect(adminRoot).toHaveScreenshot('admin-page.png', { maxDiffPixels: 8000 });
});

test('admin airtable wizard demo smoke', async ({ page }) => {
 await page.goto('/admin');
 await waitForReady(page, 'admin-page');

 await page.getByTestId('admin-tab-integrations').click();
 await page.getByTestId('admin-airtable').waitFor();
 await page.getByTestId('admin-airtable-open-wizard').click();

 await page.getByTestId('airtable-step-1').waitFor();
 await page.getByRole('button', { name: 'Continuar' }).click();
 await page.getByTestId('airtable-step-2').waitFor();
 await page.getByRole('button', { name: 'Ya tengo el token' }).click();
 await page.getByTestId('airtable-step-3').waitFor();
 await page.getByTestId('airtable-use-demo').click();

 await page.getByTestId('airtable-step-4').waitFor();
 await page.getByTestId('airtable-next-from-base').click();
 await page.getByTestId('airtable-step-5').waitFor();
 await page.getByTestId('airtable-next-from-tables').click();
 await page.getByTestId('airtable-step-6').waitFor();
 await page.getByTestId('airtable-test-mapping').click();

 await page.getByTestId('airtable-step-7').waitFor();
 await expect(page.getByText('Loteos encontrados')).toBeVisible();
 await page.getByTestId('airtable-save-connection').click();
 await page.getByTestId('airtable-step-8').waitFor();

 await page.getByTestId('airtable-close-success').click();
 await expect(page.getByTestId('airtable-connection-card')).toContainText('Conexion lista para usar');
});
