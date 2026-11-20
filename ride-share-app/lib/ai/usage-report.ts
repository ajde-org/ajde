import "server-only";
import type { Tables } from "@/lib/supabase/database.types";

export type AiReportData = {
  operations: Pick<Tables<"ai_operations">, "id" | "user_id" | "feature" | "policy_group" | "admitted_at">[];
  usage: Pick<Tables<"ai_provider_usage">, "operation_id" | "feature" | "estimated_cost_usd" | "input_tokens" | "cached_input_tokens" | "output_tokens" | "recorded_at">[];
  events: Pick<Tables<"ai_request_events">, "user_id" | "feature" | "outcome" | "reason" | "duration_ms" | "recorded_at">[];
  policies: Tables<"ai_policy_versions">[];
};
const logStart = "<!-- AI_REVIEW_LOG_START -->";
const logEnd = "<!-- AI_REVIEW_LOG_END -->";
export function preserveAiReviewLog(previous?: string) {
  if (previous === undefined) return `${logStart}\n## Review log\n\nNo review recorded yet. After each review, record the date, findings, changes and rationale (or an explicit no-change decision), and next review date.\n${logEnd}`;
  const start = previous.indexOf(logStart), end = previous.indexOf(logEnd);
  if (start < 0 || end < start || previous.indexOf(logStart, start + 1) >= 0 || previous.indexOf(logEnd, end + 1) >= 0) throw new Error("Report review log markers are missing or ambiguous; preserve the existing report");
  return previous.slice(start, end + logEnd.length);
}
const money = (value: number) => `$${value.toFixed(6)}`;
const count = (values: number[]) => values.reduce((sum, value) => sum + value, 0);
function percentile(values: number[], p: number) {
  if (!values.length) return "insufficient data";
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p, lower = Math.floor(index), upper = Math.ceil(index);
  return (sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)).toFixed(1);
}
function period(data: AiReportData, start: number, end: number) {
  const inside = (value: string) => Date.parse(value) >= start && Date.parse(value) < end;
  const operations = data.operations.filter(row => inside(row.admitted_at));
  const usage = data.usage.filter(row => inside(row.recorded_at));
  const events = data.events.filter(row => inside(row.recorded_at));
  const measured = new Set(usage.map(row => row.operation_id));
  const unknownCalls = usage.filter(row => row.estimated_cost_usd === null).length;
  const missingOperations = operations.filter(row => !measured.has(row.id)).length;
  const knownCost = count(usage.map(row => row.estimated_cost_usd ?? 0));
  const denied = events.filter(row => row.outcome === "denied");
  return { operations, usage, events, unknownCalls, missingOperations, knownCost, denied };
}

export function buildAiUsageReport(data: AiReportData, options: { days: number; generatedAt: Date; collectionStartedAt?: Date; previous?: string; local?: boolean }) {
  const review = preserveAiReviewLog(options.previous);
  const end = options.generatedAt.getTime(), start = end - options.days * 86400000, priorStart = start - options.days * 86400000;
  const current = period(data, start, end), previous = period(data, priorStart, start);
  const collection = options.collectionStartedAt?.getTime();
  const covered = collection !== undefined && Number.isFinite(collection) && collection <= priorStart;
  const unknown = current.unknownCalls + current.missingOperations;
  const cost = unknown ? `unknown total; known subtotal ${money(current.knownCost)}` : money(current.knownCost);
  const lines = ["# AI usage report", "", `Generated: ${options.generatedAt.toISOString()}`,
    `Source: ${options.local ? "local Supabase validation; not production usage" : "configured Supabase metadata"}.`,
    "Reporting timezone: Europe/Skopje. Periods are trailing 24-hour days; timestamps below are UTC instants.",
    `Period: ${new Date(start).toISOString()} through ${new Date(end).toISOString()} (end excluded).`,
    `Previous equal period: ${new Date(priorStart).toISOString()} through ${new Date(start).toISOString()}.`,
    `Coverage: ${covered ? "collection start covers both periods" : "incomplete or unverified; comparison data is insufficient"}.`,
    `Verified collection start: ${options.collectionStartedAt?.toISOString() ?? "not supplied (set AI_TELEMETRY_ENABLED_AT only after rollout)"}.`,
    "", `Estimated spend: ${cost}. Estimates are not provider invoices.`,
    `Admissions: ${current.operations.length}; provider calls: ${current.usage.length}; unknown-cost calls: ${current.unknownCalls}; admitted operations without recorded usage: ${current.missingOperations}.`,
    "Operations without usage may include cancellation before a paid call, a crash, or an accounting failure; their billable cost is unverified.",
    `Denials: ${current.denied.length}; distinct users hitting limits: ${new Set(current.denied.map(row => row.user_id)).size}; limiter-store errors: ${current.events.filter(row => row.outcome === "storage_error").length}.`,
    "", "## Feature and action usage", "", "| Feature | Group | Actions | Provider calls | Estimated spend | Average cost/action | Average operation ms |", "| --- | --- | ---: | ---: | --- | --- | ---: |"];
  const features = ["search", "parse", "screenshot", "interpret", "chat_assist", "translate_notes", "explain"];
  for (const feature of features) {
    const operations = current.operations.filter(row => row.feature === feature), usage = current.usage.filter(row => row.feature === feature);
    const cost = count(usage.map(row => row.estimated_cost_usd ?? 0));
    const ids = new Set(usage.map(row => row.operation_id));
    const incomplete = usage.some(row => row.estimated_cost_usd === null) || operations.some(row => !ids.has(row.id));
    const durations = current.events.filter(row => row.feature === feature && ["completed", "failed", "timeout", "cancelled"].includes(row.outcome) && row.duration_ms !== null).map(row => row.duration_ms!);
    lines.push(`| ${feature} | ${feature === "explain" ? "explanation" : "explicit"} | ${operations.length} | ${usage.length} | ${incomplete ? `unknown (${money(cost)} known)` : money(cost)} | ${incomplete || !operations.length ? "unknown / insufficient data" : money(cost / operations.length)} | ${durations.length ? (count(durations) / durations.length).toFixed(0) : "unknown"} |`);
  }
  lines.push("", "## Denials by reason and feature", "", "| Feature | Reason | Count |", "| --- | --- | ---: |");
  const denials = new Map<string, number>();
  for (const event of current.denied) {
    const feature = features.includes(event.feature) ? event.feature : "unknown";
    const reason = ["allowance_limit", "hourly_limit", "screenshot_limit", "burst_limit", "concurrency_limit"].includes(event.reason ?? "") ? event.reason : "unknown";
    const key = `${feature} | ${reason}`; denials.set(key, (denials.get(key) ?? 0) + 1);
  }
  for (const [key, total] of [...denials].sort()) lines.push(`| ${key} | ${total} |`);
  if (!denials.size) lines.push("| — | no recorded denials | 0 |");
  lines.push("", "## Per-user usage", "", "| Group | Active users | Actions/user p50 | p90 | p95 | p99 |", "| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const group of ["explicit", "explanation"]) {
    const users = new Map<string, number[]>();
    for (const operation of current.operations.filter(row => row.policy_group === group)) {
      const times = users.get(operation.user_id) ?? []; times.push(Date.parse(operation.admitted_at)); users.set(operation.user_id, times);
    }
    const values = [...users.values()].map(times => times.length);
    lines.push(`| ${group} | ${users.size} | ${percentile(values, .5)} | ${percentile(values, .9)} | ${percentile(values, .95)} | ${percentile(values, .99)} |`);
  }
  lines.push("", "## Equal-period comparison", "");
  if (!covered) lines.push("Insufficient verified coverage for a reliable comparison. Counts below describe recorded activity only.");
  lines.push(`Recorded admissions: ${current.operations.length} current / ${previous.operations.length} previous.`,
    `Known spend subtotal: ${money(current.knownCost)} current / ${money(previous.knownCost)} previous.`,
    `Unknown-cost calls: ${current.unknownCalls} current / ${previous.unknownCalls} previous; unmeasured admissions: ${current.missingOperations} current / ${previous.missingOperations} previous.`,
    `Recorded denials: ${current.denied.length} current / ${previous.denied.length} previous.`);
  if (covered && previous.operations.length > 0) lines.push(`Admission change: ${((current.operations.length / previous.operations.length - 1) * 100).toFixed(1)}%.`);
  else lines.push("Admission percentage change: insufficient data.");
  lines.push("", "## Tracked policy values and effective dates", "", "| Group | Effective at (UTC) | Configuration |", "| --- | --- | --- |");
  for (const policy of [...data.policies].filter(row => Date.parse(row.effective_at) < end).sort((a,b) => Date.parse(a.effective_at) - Date.parse(b.effective_at))) {
    lines.push(`| ${policy.policy_group === "explanation" ? "explanation" : "explicit"} | ${new Date(policy.effective_at).toISOString()} | ${JSON.stringify(policy.configuration).replaceAll("|", "\\|")} |`);
  }
  lines.push("", "## Measurement limits", "", "Metadata is retained for 35 days. Reporting stops on query or pagination failure and preserves the previous file. Unknown usage is never priced as zero. Storage outages can also prevent error-event persistence; inspect the server's AI accounting error logs for gaps. No prompts, generated content, emails, or user identifiers are included.", "", review, "");
  return lines.join("\n");
}
