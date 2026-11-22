import { beforeAll, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { runChatAssistant } from "@/lib/ai/chat-assistant";
import { runOpenAIExplanationModel } from "@/lib/ai/explain-match";

beforeAll(() => {
  if (!process.env.OPENAI_API_KEY?.trim()) throw new Error("OPENAI_API_KEY is required for the paid locale evaluation.");
});

it.each(["en", "mk"] as const)("generates %s explanations and cited answers from synthetic multilingual facts", async locale => {
  const rideId = "94000000-0000-4000-8000-000000000001";
  const explanations = await runOpenAIExplanationModel({ locale,
    rides: [{ rideId, from: locale === "mk" ? "Скопје" : "Skopje", to: locale === "mk" ? "Битола" : "Bitola", departs: "Fri 25 Sept at 18:00", seatsAvailable: 2, price: "250 MKD per seat" }],
    search: { from: null, to: locale === "mk" ? "Битола" : "Bitola", dates: null, dailyTime: null },
  });
  expect(explanations).toHaveLength(1);
  expect(explanations[0].rideId).toBe(rideId);
  expect(/[а-яѓќљњџѕ]/i.test(explanations[0].explanation)).toBe(locale === "mk");
  const id = "94000000-0000-4000-8000-000000000002";
  const answer = await runChatAssistant({ rideId, mode: "question", question: "Where and when are we meeting?" }, [
    { id, author: "Ana", created_at: "2026-09-21T12:00:00Z", body: "Се договоривме да се сретнеме кај главната станица во 18:00." },
  ], undefined, locale);
  expect(answer.insufficientEvidence).toBe(false);
  expect(answer.items.length).toBeGreaterThan(0);
  for (const item of answer.items) {
    expect(item.messageIds).toEqual([id]);
    expect(/[а-яѓќљњџѕ]/i.test(item.text)).toBe(locale === "mk");
  }
  console.log(JSON.stringify({ locale, explanations, answer }));
});
