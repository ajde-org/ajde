import { loadEnvConfig } from "@next/env";
import { readFile, mkdir, writeFile, rename, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "../lib/supabase/admin";
import { supabaseUrl } from "../lib/supabase/env";
import { buildAiUsageReport, type AiReportData } from "../lib/ai/usage-report";

loadEnvConfig(process.cwd());
async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--days")) throw new Error("Use --days 1..17");
  const days = args.length ? Number(args[1]) : 7;
  if (!Number.isInteger(days) || days < 1 || days > 17) throw new Error("Days must be 1..17 to fit retention and the comparison period");
  const generatedAt = new Date(), since = new Date(generatedAt.getTime() - days * 2 * 86400000).toISOString();
  const client = createAdminClient();
  const path = resolve(process.cwd(), "..", ".reports", "ai-usage.md");
  let previous: string | undefined;
  try { previous = await readFile(path, "utf8"); } catch (error) { if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error; }
  async function rows(table: "ai_operations" | "ai_provider_usage" | "ai_request_events", timestamp: "admitted_at" | "recorded_at", columns: string) {
    const result: unknown[] = [];
    for (let offset = 0; offset < 100_000; offset += 500) {
      const { data, error } = await client.from(table).select(columns).gte(timestamp, since).lt(timestamp, generatedAt.toISOString())
        .order(timestamp).order("id").range(offset, offset + 499).abortSignal(AbortSignal.timeout(15000));
      if (error || !data) throw new Error(`Could not read ${table}; previous report preserved`);
      result.push(...data); if (data.length < 500) return result;
    }
    throw new Error("Report safety limit reached; output would be incomplete");
  }
  const [operations, usage, events, policy] = await Promise.all([
    rows("ai_operations", "admitted_at", "id,user_id,feature,policy_group,admitted_at"),
    rows("ai_provider_usage", "recorded_at", "operation_id,feature,estimated_cost_usd,input_tokens,cached_input_tokens,output_tokens,recorded_at"),
    rows("ai_request_events", "recorded_at", "user_id,feature,outcome,reason,duration_ms,recorded_at"),
    client.from("ai_policy_versions").select("policy_group,effective_at,configuration").order("effective_at").limit(1000).abortSignal(AbortSignal.timeout(15000)),
  ]);
  if (policy.error || !policy.data || policy.data.length >= 1000) throw new Error("Policy history unavailable or truncated");
  const started = process.env.AI_TELEMETRY_ENABLED_AT;
  const collectionStartedAt = started ? new Date(started) : undefined;
  if (collectionStartedAt && !Number.isFinite(collectionStartedAt.getTime())) throw new Error("Invalid AI_TELEMETRY_ENABLED_AT");
  const data = { operations, usage, events, policies: policy.data } as AiReportData;
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(supabaseUrl()).hostname);
  const report = buildAiUsageReport(data, { days, generatedAt, collectionStartedAt, previous, local });
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, report, "utf8"); await rename(temporary, path); }
  catch (error) { await unlink(temporary).catch(() => {}); throw error; }
  console.log("Updated .reports/ai-usage.md; preserved the review log.");
}
main().catch(() => { console.error("AI usage report failed; previous report preserved. Check local credentials, schema deployment, arguments, and review-log markers."); process.exitCode = 1; });
