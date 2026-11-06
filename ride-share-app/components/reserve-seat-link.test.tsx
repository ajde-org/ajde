import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { ReserveSeatLink } from "./reserve-seat-link";

afterEach(() => vi.unstubAllEnvs());

it.each([undefined, "true", "false"])("respects the animation flag %s while preserving navigation", (value) => {
  vi.stubEnv("NEXT_PUBLIC_RIDE_CAR_ANIMATION_ENABLED", value);
  const html = renderToStaticMarkup(createElement(ReserveSeatLink, { href: "/rides/example", route: "from Skopje to Ohrid" }));
  expect(html).toContain('href="/rides/example"');
  expect(html).toContain("Pick ride");
  expect(html.includes("<svg")).toBe(value === "true");
  expect(html.includes(">ajde<")).toBe(value === "true");
});
