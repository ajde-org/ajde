import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { ReserveSeatLink } from "./reserve-seat-link";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";

afterEach(() => vi.unstubAllEnvs());

it.each([undefined, "true", "false"])("respects the animation flag %s while preserving navigation", (value) => {
  vi.stubEnv("NEXT_PUBLIC_RIDE_CAR_ANIMATION_ENABLED", value);
  const html = renderToStaticMarkup(<I18nProvider locale="en" messages={en}>{createElement(ReserveSeatLink, { href: "/rides/example", route: "Pick ride from Skopje to Ohrid" })}</I18nProvider>);
  expect(html).toContain('href="/rides/example"');
  expect(html).toContain("Pick ride");
  expect(html.includes("<svg")).toBe(value === "true");
  expect(html.includes(">ajde<")).toBe(value === "true");
});
