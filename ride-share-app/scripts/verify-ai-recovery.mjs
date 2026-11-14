import { chromium } from "@playwright/test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const base = process.env.AI_RECOVERY_BASE_URL || "http://127.0.0.1:3134";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Visual checks require a local server");
const directory = process.env.AI_RECOVERY_FIXTURE_DIR || resolve(process.cwd(), "..", ".scratch", "ajde34-recovery");
const fallback = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(path => existsSync(path));
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync(chromium.executablePath()) ? undefined : fallback);
const browser = await chromium.launch({ headless: true, executablePath });
const results = [];
try {
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  const shell = await page.evaluate(() => ({ css: [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => link.href), bodyClass: document.body.className }));
  for (const locale of ["en", "mk"]) {
    const source = readFileSync(resolve(directory, `retry-${locale}.html`), "utf8");
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(source.replace("<head>", `<head><base href="${base}">${shell.css.map(href => `<link rel="stylesheet" href="${href}">`).join("")}`)
        .replace("<body>", `<body class="${shell.bodyClass}">`), { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale}/${width}: horizontal overflow`);
      assert(await page.locator('button[type="submit"]').isDisabled(), `${locale}/${width}: blocked action enabled`);
      assert(!(await page.getByRole("status").textContent()).includes("{time}"), "Retry time was not localized");
      const unnamed = await page.evaluate(() => [...document.querySelectorAll("button,input,select,textarea")].filter(element =>
        element.getClientRects().length && !(element.getAttribute("aria-label") || element.labels?.length || element.tagName === "BUTTON" && element.textContent.trim())).length);
      assert.equal(unnamed, 0, "Controls need accessible names");
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement.tagName), "INPUT", "Preserved input remains keyboard accessible");
      const path = resolve(directory, `retry-${locale}-${width}.png`);
      await page.screenshot({ path, fullPage: true });
      results.push({ locale, width, overflow: false, keyboardInput: true, actionDisabled: true, screenshot: `retry-${locale}-${width}.png` });
    }
  }
  writeFileSync(resolve(directory, "verification.json"), JSON.stringify({ source: "Controlled blocked-state fixtures using production CSS; timer/retry interactions verified by component tests", results }, null, 2));
  console.log("AI recovery visual checks passed: English/Macedonian at 375px and 1440px.");
} finally { await browser.close(); }
