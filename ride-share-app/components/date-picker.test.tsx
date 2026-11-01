// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ChipRow, quickDatePicks } from "./date-picker";
import { createTranslator } from "@/lib/i18n/translate";
import { mk } from "@/lib/i18n/messages/mk";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it.each([30, 31])("keeps quick picks distinct when weekend shares a date on October %s", day => {
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const choose = vi.fn();
  const picks = quickDatePicks(new Date(2026, 9, day), createTranslator(mk));
  expect(new Set(picks.map(pick => pick.value)).size).toBe(2);
  expect(new Set(picks.map(pick => pick.id)).size).toBe(3);
  render(<ChipRow options={picks} value="" onChoose={choose} />);
  fireEvent.click(screen.getByRole("button", { name: mk["date.weekend"] }));
  expect(choose).toHaveBeenCalledWith("2026-10-31");
  expect(errors).not.toHaveBeenCalled();
});
