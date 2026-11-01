// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { RideCard } from "./ride-card";
import { I18nProvider } from "@/lib/i18n/provider";
import { mk } from "@/lib/i18n/messages/mk";
import type { RideView } from "@/lib/rides/ride-view";
import { formatDateTime } from "@/lib/i18n/format";

afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ""; });
it.each([250, 1250.5, 0])("hydrates unfiltered ride cards priced %s without browser Macedonian Intl data", async price => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const ride = { id: "ride", departure_at: "2026-10-29T07:00:00+00:00", price_per_seat_mkd: price,
    seats_available: 21, seats_total: 23, originCity: { id: 1, name_en: "Skopje", name_mk: "Скопје" },
    destinationCity: { id: 2, name_en: "Bitola", name_mk: "Битола" }, originPickup: null,
    destinationPickup: null, driver: null, car: { color: "blue", make: "Fiat", model: "Grande Punto" } } as RideView;
  const view = <I18nProvider locale="mk" messages={mk}><RideCard ride={ride} /></I18nProvider>;
  const container = document.createElement("div"); document.body.append(container);
  container.innerHTML = renderToString(view);
  const serverMarkup = container.innerHTML;
  const NativeDateTimeFormat = Intl.DateTimeFormat;
  const NativeNumberFormat = Intl.NumberFormat;
  const NativePluralRules = Intl.PluralRules;
  vi.stubGlobal("Intl", Object.assign(Object.create(Intl), {
    DateTimeFormat: class extends NativeDateTimeFormat {
      constructor(locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) {
        super(String(locales).startsWith("mk") ? "en-US" : locales, options);
      }
    },
    NumberFormat: class extends NativeNumberFormat {
      constructor(locales?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
        super(String(locales).startsWith("mk") ? "en-US" : locales, options);
      }
    },
    PluralRules: class extends NativePluralRules {
      constructor(locales?: string | string[], options?: Intl.PluralRulesOptions) {
        super(String(locales).startsWith("mk") ? "en-US" : locales, options);
      }
    },
  }));
  const recoverable = vi.fn(); let root: Root | undefined;
  try {
    await act(async () => { root = hydrateRoot(container, view, { onRecoverableError: recoverable }); });
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverMarkup);
    expect(container.querySelector("time")?.getAttribute("aria-label")).toContain("29.10.2026 г., во 08:00");
    expect(container.textContent).toContain("чет., 29 окт.");
    expect(container.textContent).toContain("син Fiat Grande Punto");
    expect(container.textContent).toContain(price === 250 ? "250\u00a0ден." : price ? "1.251\u00a0ден." : mk["ride.free"]);
    expect(formatDateTime("mk", "2026-03-29T00:30:00Z")).toContain("01:30");
    expect(formatDateTime("mk", "2026-03-29T01:30:00Z")).toContain("03:30");
  } finally { await act(async () => root?.unmount()); }
});
