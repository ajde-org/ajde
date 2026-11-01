import { describe, expect, it } from "vitest";
import { resolveLocale } from "./config";
import { createTranslator, createNoticeTranslator } from "./translate";
import { en } from "./messages/en";
import { mk } from "./messages/mk";
import { formatDateTime, formatMoney, formatNumber, plural } from "./format";

describe("locale and catalog contracts", () => {
  it.each([undefined, null, "", "MK", "fr", "../../secrets", {}, "mk-MK"])("defaults unsupported locale %j to English", value => {
    expect(resolveLocale(value)).toBe("en");
  });
  it("accepts both supported locales", () => {
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("mk")).toBe("mk");
  });
  it("has exactly matching keys and interpolation parameters with no blank translations", () => {
    expect(Object.keys(mk).sort()).toEqual(Object.keys(en).sort());
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(mk[key].trim(), key).not.toBe("");
      const parameters = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
      expect(parameters(mk[key]), key).toEqual(parameters(en[key]));
    }
  });
  it("interpolates values literally without treating user content as a template", () => {
    expect(createTranslator(mk)("nav.copyright", { year: 2026 })).toContain("2026");
    expect(createTranslator(en)("date.summary", { date: "{time}", time: "$&" })).toBe("{time} · $&");
  });
  it.each([en, mk])("only renders complete known notices and never raw external errors", messages => {
    const notice = createNoticeTranslator(messages);
    expect(notice("form.saveFailed", "validation.generic")).toBe(messages["form.saveFailed"]);
    for (const code of ["private database details", "toString", "__proto__", "chat.count.one"]) {
      expect(notice(code, "validation.generic")).toBe(messages["validation.generic"]);
    }
  });
});

describe("presentation formatting", () => {
  it("uses locale-specific numbers without changing their value", () => {
    expect(formatNumber("en", 1234.5)).toBe("1,234.5");
    expect(formatNumber("mk", 1234.5)).toBe("1.234,5");
    expect(formatMoney("mk", 300)).toContain("300");
  });
  it("uses Macedonian plural rules rather than count === 1", () => {
    expect([0, 1, 2, 11, 21].map(count => plural("mk", count))).toEqual(["other", "one", "other", "other", "one"]);
    expect(plural("en", 21)).toBe("other");
  });
  it("formats Macedonian prices, decimals and rounded counts deterministically", () => {
    expect(formatMoney("mk", 250)).toBe("250\u00a0ден.");
    expect(formatMoney("mk", 1250.5)).toBe("1.251\u00a0ден.");
    expect(formatMoney("mk", 0)).toBe("0\u00a0ден.");
    expect(formatNumber("mk", -1234.5, { minimumFractionDigits: 2 })).toBe("-1.234,50");
    expect(formatNumber("mk", 1234.5, { useGrouping: false })).toBe("1234,5");
    expect([1.1, 1.11, 1.21, 0.0001, 1.0001, -21].map(count => plural("mk", count))).toEqual(["one", "other", "one", "other", "one", "one"]);
  });
  it("keeps departures in Skopje time across DST transitions", () => {
    for (const locale of ["en", "mk"] as const) {
      expect(formatDateTime(locale, "2026-03-29T00:30:00Z")).toContain("01:30");
      expect(formatDateTime(locale, "2026-03-29T01:30:00Z")).toContain("03:30");
      expect(formatDateTime(locale, "2026-10-25T01:30:00Z")).toContain("02:30");
    }
  });
});
