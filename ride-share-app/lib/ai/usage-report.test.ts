import { expect, it } from "vitest";
import { buildAiUsageReport, preserveAiReviewLog, type AiReportData } from "./usage-report";
const now = new Date("2026-11-14T12:00:00Z");
const options = { days: 7, generatedAt: now, spendPolicy: { alertUsd: null, cutoffUsd: null, effectiveAt: null } };
function data(): AiReportData {
  return {
    operations: [{ id: "private-operation", user_id: "private-user-id", feature: "parse", policy_group: "explicit", admitted_at: "2026-11-13T12:00:00Z" }],
    usage: [{ operation_id: "private-operation", feature: "parse", estimated_cost_usd: 0.01, input_tokens: 1000, cached_input_tokens: 500, output_tokens: 100, recorded_at: "2026-11-13T12:00:10Z" }],
    events: [{ user_id: "private-user-id", feature: "parse", outcome: "completed", reason: null, duration_ms: 10000, recorded_at: "2026-11-13T12:00:10Z" },
      { user_id: "private-user-id", feature: "screenshot", outcome: "denied", reason: "screenshot_limit", duration_ms: 10, recorded_at: "2026-11-13T13:00:00Z" }],
    policies: [{ policy_group: "explicit", effective_at: "2026-10-01T12:00:00Z", configuration: { hourly_limit: 30, screenshot_hourly_limit: 10, burst_capacity: 4, burst_refill_seconds: 10, concurrent_limit: 2 } }],
  };
}
it("aggregates actions, costs, denials and latency without exposing user or operation IDs", () => {
  const report = buildAiUsageReport(data(), options);
  expect(report).toContain("Estimated spend: $0.010000");
  expect(report).toContain("| parse | explicit | 1 | 1 | $0.010000 | $0.010000 | 10000 |");
  expect(report).toContain("| screenshot | screenshot_limit | 1 |");
  expect(report).toContain("distinct users hitting limits: 1");
  expect(report).not.toContain("private-user-id"); expect(report).not.toContain("private-operation");
  expect(report).toContain("comparison data is insufficient"); expect(report).toContain("monetary enforcement disabled");
});
it("leaves unknown usage and missing-operation measurements unknown, never zero-priced", () => {
  const fixture = data(); fixture.usage[0].estimated_cost_usd = null;
  let report = buildAiUsageReport(fixture, options);
  expect(report).toContain("Estimated spend: unknown total; known subtotal $0.000000");
  expect(report).toContain("unknown-cost calls: 1");
  fixture.usage = []; report = buildAiUsageReport(fixture, options);
  expect(report).toContain("admitted operations without recorded usage: 1");
  expect(report).toContain("unknown / insufficient data");
});
it("compares only covered equal periods and includes policy effective dates", () => {
  const fixture = data(); fixture.operations.push({ ...fixture.operations[0], id: "private-prior-operation", admitted_at: "2026-11-05T12:00:00Z" });
  const report = buildAiUsageReport(fixture, { ...options, collectionStartedAt: new Date("2026-10-01T12:00:00Z") });
  expect(report).toContain("collection start covers both periods"); expect(report).toContain("Admission change: 0.0%");
  expect(report).toContain("2026-10-01T12:00:00.000Z");
});
it("preserves the review log exactly across repeated regenerations", () => {
  const first = buildAiUsageReport(data(), options).replace("No review recorded yet.", "2026-11-14: No change; legitimate use below limits. Next review: 2026-11-28.");
  const second = buildAiUsageReport(data(), { ...options, previous: first });
  const third = buildAiUsageReport(data(), { ...options, previous: second });
  expect(preserveAiReviewLog(third)).toBe(preserveAiReviewLog(first));
  expect(third).toContain("No change; legitimate use below limits");
});
it.each(["manual notes without markers", "<!-- AI_REVIEW_LOG_START -->missing end"])("refuses to overwrite ambiguous existing review notes", previous => {
  expect(() => buildAiUsageReport(data(), { ...options, previous })).toThrow("preserve the existing report");
});
