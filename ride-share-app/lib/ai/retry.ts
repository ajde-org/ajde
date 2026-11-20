import { z } from "zod";
const retrySchema = z.object({ code: z.literal("rate_limit"), retryAfterSeconds: z.number().int().positive().max(86400), retryAt: z.iso.datetime({ offset: true }) });
export function aiRetryInformation(input: unknown) {
  const parsed = retrySchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}
