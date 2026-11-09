import type { z } from "zod";

// Keep schema internals and English Zod messages out of localized UI state.
export function contactErrorKey(issue: z.core.$ZodIssue) {
  if (issue.path[0] === "socialUrl") return "contact.invalidSocial";
  return issue.code === "custom" ? "contact.phoneDigits" : "contact.invalidPhone";
}
