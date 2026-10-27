// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@/lib/i18n/testing";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import { WhereToForm } from "./where-to-form";

afterEach(cleanup);
const cities = [{ id: 1, name_en: "Skopje", name_mk: "Скопје" }, { id: 3, name_en: "Bitola", name_mk: "Битола" }];

it("changes labels and city names without losing selected city IDs", () => {
  const view = render(<I18nProvider locale="en" messages={en}><WhereToForm cities={cities} /></I18nProvider>);
  fireEvent.change(screen.getByRole("combobox", { name: /Leaving from/ }), { target: { value: "1" } });
  fireEvent.change(screen.getByRole("combobox", { name: /Going to/ }), { target: { value: "3" } });
  view.rerender(<I18nProvider locale="mk" messages={mk}><WhereToForm cities={cities} /></I18nProvider>);
  expect((screen.getByRole("combobox", { name: /Од каде поаѓаш/ }) as HTMLSelectElement).value).toBe("1");
  expect((screen.getByRole("combobox", { name: /Каде одиш/ }) as HTMLSelectElement).value).toBe("3");
  expect(screen.getAllByRole("option", { name: "Скопје" })).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Замени ги местата на поаѓање и пристигнување" }));
  expect((screen.getByRole("combobox", { name: /Од каде поаѓаш/ }) as HTMLSelectElement).value).toBe("3");
});
