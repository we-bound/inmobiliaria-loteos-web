import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3000';
const devServerCommand = process.platform === 'win32'
 ? 'C:\\Windows\\System32\\cmd.exe /c npm.cmd run dev -- --hostname 127.0.0.1 --port 3000'
 : 'npm run dev -- --hostname 127.0.0.1 --port 3000';

export default defineConfig({
 testDir: './tests/visual',
 fullyParallel: true,
 retries: 1,
 reporter: [['html', { open: 'never' }]],
 use: {
 baseURL,
 screenshot: 'only-on-failure',
 trace: 'on-first-retry',
 video: 'retain-on-failure',
 },
 expect: {
 toHaveScreenshot: {
 animations: 'disabled',
 caret: 'hide',
 },
 },
 projects: [
 {
 name: 'desktop',
 use: {
 ...devices['Desktop Chrome'],
 browserName: 'chromium',
 channel: 'msedge',
 viewport: { width: 1440, height: 1100 },
 },
 },
 {
 name: 'mobile',
 use: {
 ...devices['iPhone 14'],
 browserName: 'chromium',
 channel: 'msedge',
 },
 },
 ],
 webServer: {
 command: devServerCommand,
 url: baseURL,
 reuseExistingServer: !process.env.CI,
 timeout: 120000,
 },
});
