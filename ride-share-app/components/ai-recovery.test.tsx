// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@/lib/i18n/testing";
import { afterEach, expect, it, vi } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { NaturalLanguageSearch } from "./discovery/natural-language-search";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it.each(["en", "mk"] as const)("retains input and waits for a deliberate retry in %s", async locale => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-20T22:59:40Z"));
  const until = new Date(Date.now() + 2000).toISOString();
  const fetcher = vi.fn().mockResolvedValue(Response.json({ code: "rate_limit", retryAfterSeconds: 2, retryAt: until }, { status: 429 }));
  vi.stubGlobal("fetch", fetcher);
  const view = render(<NaturalLanguageSearch currentParams="" initialQuery="Skopje tomorrow" />, { locale });
  const form = view.container.querySelector("form")!;
  await act(async () => { fireEvent.submit(form); fireEvent.submit(form); });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("textbox")).toHaveProperty("value", "Skopje tomorrow");
  const button = form.querySelector('button[type="submit"]')!;
  expect(button).toHaveProperty("disabled", true);
  expect(screen.getByRole("status").textContent).toBe(locale === "mk" ? "Ги искористивте достапните ВИ барања за пребарување објави. Обидете се повторно утре во: 00:00" : "You’ve used all your AI search requests. Please retry at: tomorrow at 00:00");
  expect(screen.getByRole("status").textContent).not.toContain("00:00:01");
  const directory = process.env.AI_RECOVERY_FIXTURE_DIR;
  if (directory) { mkdirSync(directory, { recursive: true }); writeFileSync(join(directory, `retry-${locale}.html`), `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main class="mx-auto max-w-3xl p-4">${view.container.innerHTML}<a href="/rides" class="btn-secondary mt-4 inline-block">${locale === "en" ? "Manual filters" : "Рачни филтри"}</a></main></body></html>`); }
  await act(async () => { await vi.advanceTimersByTimeAsync(2100); });
  expect(button).toHaveProperty("disabled", false); expect(fetcher).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status").textContent).toContain(locale === "en" ? "You can try this AI action again now." : "Сега можете повторно");
  await act(async () => { fireEvent.submit(form); });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[0][1].headers["Idempotency-Key"]).not.toBe(fetcher.mock.calls[1][1].headers["Idempotency-Key"]);
});

it.each(["en", "mk"] as const)("warns before exhaustion without disabling search in %s", async locale => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-20T20:26:29Z"));
  const until = new Date(Date.now() + 2000).toISOString();
  const result = { originId: null, destinationId: null, departureAfter: null, departureBefore: null, requestedSeats: null, confidence: 1, warnings: [] };
  const fetcher = vi.fn().mockResolvedValue(Response.json({ result }, { headers: { "X-AI-Allowance-Full-At": until } }));
  vi.stubGlobal("fetch", fetcher);
  const view = render(<NaturalLanguageSearch currentParams="" initialQuery="Ohrid tomorrow" />, { locale });
  const form = view.container.querySelector("form")!;
  await act(async () => { fireEvent.submit(form); });
  expect(screen.getByRole("status").textContent).toBe(locale === "en" ? "Warning: You have almost used all the available AI search requests" : "Предупредување: Речиси ги искористивте достапните ВИ барања за пребарување објави.");
  expect(form.querySelector('button[type="submit"]')).toHaveProperty("disabled", false);
  await act(async () => { await vi.advanceTimersByTimeAsync(2100); });
  expect(screen.queryByRole("status")).toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(1);
});
