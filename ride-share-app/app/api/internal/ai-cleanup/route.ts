import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const secret = z.string().min(32).max(200).safeParse(process.env.CRON_SECRET);
  const headers = { "Cache-Control": "private, no-store" };
  if (!secret.success) return Response.json({ error: "Cleanup is not configured." }, { status: 503, headers });
  const input = z.string().max(256).safeParse(request.headers.get("authorization"));
  const expected = Buffer.from(`Bearer ${secret.data}`);
  const provided = Buffer.from(input.success ? input.data : "");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return Response.json({ error: "Unauthorized." }, { status: 401, headers });
  }
  try {
    const { data, error } = await createAdminClient().rpc("cleanup_ai_operations").abortSignal(AbortSignal.timeout(20_000));
    if (error) throw new Error("Cleanup failed");
    return Response.json({ ok: true, removedOperations: data }, { headers });
  } catch {
    console.error("AI metadata cleanup failed");
    return Response.json({ error: "Cleanup failed. Retry later." }, { status: 503, headers });
  }
}
