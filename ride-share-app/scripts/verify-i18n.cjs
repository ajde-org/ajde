/* eslint-disable @typescript-eslint/no-require-imports -- Standalone, read-only browser smoke test. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { mkdirSync } = require('node:fs');
const { chromium } = require('@playwright/test');

// Never signs in, sends email, or changes database records. Run against a local production build.
const base = process.env.I18N_BASE_URL || 'http://localhost:3100';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local server');
const output = path.resolve(__dirname, '../../.scratch/ajde-29');
mkdirSync(output, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  try {
    const english = await browser.newContext();
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(30000);
    await page.goto(`${base}/?origin=1`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    const origin = page.locator('select[name="origin"]');
    if (await origin.locator('option[value="1"]').count()) await origin.selectOption('1');
    const selected = await origin.inputValue();
    await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('mk');
    await page.waitForFunction(() => document.documentElement.lang === 'mk');
    assert.equal(await origin.inputValue(), selected, 'Language switch keeps selected city');
    assert.equal(new URL(page.url()).search, '?origin=1', 'Language switch keeps query string');
    await page.getByRole('heading', { name: 'Каде патуваш?' }).waitFor();
    await page.screenshot({ path: path.join(output, 'landing-mk-desktop.png'), fullPage: true });
    await page.screenshot({ path: path.join(output, 'landing-mk-desktop-viewport.png') });
    const cookie = (await context.cookies()).find(cookie => cookie.name === 'ajde_locale');
    assert.equal(cookie.value, 'mk'); assert.equal(cookie.httpOnly, true);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'mk');

    const independent = await english.newPage();
    await independent.goto(`${base}/login`, { waitUntil: 'networkidle' });
    assert.equal(await independent.locator('html').getAttribute('lang'), 'en', 'Independent session remains English');
    await independent.setViewportSize({ width: 375, height: 812 });
    assert(await independent.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await independent.screenshot({ path: path.join(output, 'login-en-mobile.png'), fullPage: true });
    await independent.goto(base, { waitUntil: 'networkidle' });
    await independent.getByRole('heading', { name: 'Where to?' }).waitFor();
    assert(await independent.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await independent.screenshot({ path: path.join(output, 'landing-en-mobile.png') });
    await independent.close();
    for (const width of [375, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/login?next=%2Frides%3Forigin%3D1&status=invalid-link`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'Добредојде назад' }).waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}px`);
      await page.screenshot({ path: path.join(output, `login-mk-${width}.png`), fullPage: true });
    }
    const email = page.getByLabel('Студентска е-пошта', { exact: true });
    await email.fill('preserve@example.invalid');
    await page.getByRole('combobox', { name: 'Јазик', exact: true }).selectOption('en');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    assert.equal(await page.getByLabel('Student email', { exact: true }).inputValue(), 'preserve@example.invalid', 'Unsaved email survives switching');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Use an approved student email address to continue.' }).waitFor();
    await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('mk');
    await page.waitForFunction(() => document.documentElement.lang === 'mk');
    await page.getByRole('alert').filter({ hasText: 'За да продолжите' }).waitFor();
    await page.goto(`${base}/auth/callback`, { waitUntil: 'networkidle' });
    assert.equal(new URL(page.url()).pathname, '/login');
    assert.equal(await page.locator('html').getAttribute('lang'), 'mk', 'Invalid auth callback keeps preference');
    await page.goto(`${base}/rides?origin=1`, { waitUntil: 'networkidle' });
    assert.equal(new URL(page.url()).pathname, '/login');
    assert.equal(new URL(page.url()).searchParams.get('next'), '/rides?origin=1');
    assert.equal(await page.locator('html').getAttribute('lang'), 'mk', 'Auth redirect keeps preference');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Отвори мени' }).click();
    await page.getByRole('combobox', { name: 'Јазик', exact: true }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(output, 'landing-mk-mobile-menu.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Кој било ден' }).click();
    await page.getByRole('dialog', { name: 'Изберете датум на поаѓање' }).waitFor();
    await page.getByRole('button', { name: 'Утре', exact: true }).click();
    await page.screenshot({ path: path.join(output, 'landing-mk-mobile.png'), fullPage: true });
    await page.screenshot({ path: path.join(output, 'landing-mk-mobile-viewport.png') });
    const missing = await page.goto(`${base}/i18n-smoke-nonexistent`, { waitUntil: 'networkidle' });
    assert.equal(missing.status(), 404);
    await page.getByRole('heading', { name: 'Страницата не е пронајдена' }).waitFor();
    assert.deepEqual(errors, [], 'No browser runtime or hydration errors');
    console.log('PASS: locale cookie, SSR, independent sessions, state/query preservation, translated errors, auth redirects, mobile menu/calendar, 375/1024/1440px.');
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
