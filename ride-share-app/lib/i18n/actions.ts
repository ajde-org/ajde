"use server";

import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { localeCookie, locales } from "./config";

export async function changeLocale(value: unknown): Promise<{ ok: boolean }> {
  const parsed = z.enum(locales).safeParse(value);
  if (!parsed.success) return { ok: false };
  (await cookies()).set(localeCookie, parsed.data, {
    path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax",
    secure: process.env.NODE_ENV === "production", httpOnly: true,
  });
  return { ok: true };
}
