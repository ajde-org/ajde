// Standard Responses API rates, USD per million tokens. Reverify when models/rates change.
// Sources: https://developers.openai.com/api/docs/models/gpt-5.4-mini
// https://developers.openai.com/api/docs/models/gpt-5-mini
export const AI_PRICE_VERSION = "2026-11-14-standard-v1";
const mini54 = { input: 0.75, cached: 0.075, output: 4.5 };
const mini5 = { input: 0.25, cached: 0.025, output: 2 };
export const AI_PRICES: Record<string, { input: number; cached: number; output: number }> = {
  "gpt-5.4-mini": mini54, "gpt-5.4-mini-2026-03-17": mini54,
  "gpt-5-mini": mini5, "gpt-5-mini-2025-08-07": mini5,
};
export function estimatedAiCost(model: string | null, input: number | null, cached: number | null, output: number | null): number | null {
  const price = model ? AI_PRICES[model] : undefined;
  if (!price || input === null || cached === null || output === null || cached > input ||
    ![input, cached, output].every(value => Number.isSafeInteger(value) && value >= 0)) return null;
  return ((input - cached) * price.input + cached * price.cached + output * price.output) / 1_000_000;
}
import "server-only";
