import { beforeEach, expect, it, vi } from "vitest";

const { setCookie, getCookie } = vi.hoisted(() => ({ setCookie: vi.fn(), getCookie: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ set: setCookie, get: getCookie })) }));
import { changeLocale } from "./actions";
import { getI18n } from "./server";

beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

it.each(["fr", null, {}, "mk-MK", ""])("rejects invalid locale %j without setting a cookie", async value => {
  expect(await changeLocale(value)).toEqual({ ok: false });
  expect(setCookie).not.toHaveBeenCalled();
});

it("persists an explicit preference securely in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(await changeLocale("mk")).toEqual({ ok: true });
  expect(setCookie).toHaveBeenCalledWith("ajde_locale", "mk", {
    maxAge: 31536000, path: "/", httpOnly: true, secure: true, sameSite: "lax",
  });
});

it("resolves independent requests without a shared mutable locale", async () => {
  getCookie.mockReturnValueOnce({ value: "mk" }).mockReturnValueOnce({ value: "en" }).mockReturnValueOnce({ value: "bogus" });
  expect((await getI18n()).t("nav.find")).toBe("Најди превоз");
  expect((await getI18n()).t("nav.find")).toBe("Find a ride");
  expect((await getI18n()).locale).toBe("en");
});
