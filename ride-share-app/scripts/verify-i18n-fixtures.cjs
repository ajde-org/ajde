/* eslint-disable @typescript-eslint/no-require-imports -- Standalone read-only fixture verification. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const base = process.env.I18N_BASE_URL || 'http://localhost:3101';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const root = path.resolve(__dirname, '../../.scratch/ajde-29');

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  const report = [];
  try {
    const page = await browser.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    const shell = await page.evaluate(() => ({ css: [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => link.href), bodyClass: document.body.className }));
    for (const folder of ['flows', 'remaining-flows']) {
      const directory = path.join(root, folder);
      for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.html'))) {
        for (const width of [375, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          const html = fs.readFileSync(path.join(directory, file), 'utf8')
            .replace('<head>', `<head>${shell.css.map(href => `<link rel="stylesheet" href="${href}">`).join('')}`)
            .replace('<body>', `<body class="${shell.bodyClass}">`);
          await page.setContent(html, { waitUntil: 'networkidle' });
          await page.evaluate(() => document.fonts.ready);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file}/${width}: overflow`);
          const unnamed = await page.evaluate(() => [...document.querySelectorAll('button,input:not([type="hidden"]),select,textarea')].filter(element => {
            if (!element.getClientRects().length || element.closest('[aria-hidden="true"]')) return false;
            return !(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || element.labels?.length || (element.tagName === 'BUTTON' && element.textContent.trim()));
          }).map(element => element.outerHTML.slice(0, 200)));
          assert.deepEqual(unnamed, [], `${file}/${width}: controls need names`);
          const missingAlt = await page.locator('img:not([alt])').count();
          assert.equal(missingAlt, 0, `${file}: image alternatives`);
          await page.keyboard.press('Tab');
          await page.waitForTimeout(200); // Let the shared 160ms focus transition finish.
          const focus = await page.evaluate(() => ({ tag: document.activeElement.tagName, outline: getComputedStyle(document.activeElement).outlineStyle, shadow: getComputedStyle(document.activeElement).boxShadow }));
          const contrast = await page.evaluate(() => {
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            const rgb = color => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data]; };
            const luminance = color => color.slice(0, 3).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
            const failures = []; let checked = 0;
            for (const element of document.querySelectorAll('body *')) {
              if (!element.getClientRects().length || ![...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim()) || element.closest('[disabled], [aria-hidden="true"]')) continue;
              const style = getComputedStyle(element); let background = null;
              for (let parent = element; parent; parent = parent.parentElement) {
                const parentStyle = getComputedStyle(parent);
                if (parentStyle.backgroundImage !== 'none' || Number(parentStyle.opacity) < 1) break;
                const color = rgb(parentStyle.backgroundColor);
                if (color[3] === 255) { background = color; break; }
                if (color[3] !== 0) break;
              }
              const foreground = rgb(style.color);
              if (!background || foreground[3] !== 255) continue; // Gradients/translucency need visual review.
              const a = luminance(foreground), b = luminance(background);
              const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
              const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
              checked++;
              if (ratio < (large ? 3 : 4.5)) failures.push({ text: element.textContent.trim().slice(0, 70), ratio: Math.round(ratio * 100) / 100, className: element.className });
            }
            return { checked, failures };
          });
          await page.screenshot({ path: path.join(directory, `${file.slice(0, -5)}-${width}.png`), fullPage: true });
          report.push({ file, width, focus, contrast });
        }
      }
    }
    fs.writeFileSync(path.join(root, 'fixture-accessibility.json'), JSON.stringify(report, null, 2));
    console.log(`PASS: ${report.length} layouts, accessible control names, image alternatives and keyboard focus observations. Static fixtures do not prove hydrated interaction or screen-reader behavior.`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
