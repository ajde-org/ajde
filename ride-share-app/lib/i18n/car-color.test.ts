import { expect, it } from "vitest";
import { localizedCarColor } from "./car-color";
import { createTranslator } from "./translate";
import { en } from "./messages/en";
import { mk } from "./messages/mk";

it.each(["blue", "Blue", " BLUE ", "син", "сина", "сино"])("localizes recognized color %s in both directions", value => {
  expect(localizedCarColor(value, createTranslator(mk))).toBe("син");
  expect(localizedCarColor(value, createTranslator(en))).toBe("blue");
});
it("handles grey aliases and preserves custom descriptions and missing values", () => {
  const t = createTranslator(mk);
  expect(localizedCarColor("grey", t)).toBe("сив");
  expect(localizedCarColor(" Midnight blue / custom wrap ", t)).toBe(" Midnight blue / custom wrap ");
  expect(localizedCarColor("toString", t)).toBe("toString");
  expect(localizedCarColor(null, t)).toBe("");
  expect(localizedCarColor(undefined, t)).toBe("");
});
