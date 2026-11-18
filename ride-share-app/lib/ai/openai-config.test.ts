import { afterEach, expect, it, vi } from "vitest";
import { getOpenAIConfig } from "./openai-config";

afterEach(() => vi.unstubAllEnvs());

it("keeps the legacy key available for existing deployments", () => {
  vi.stubEnv("AJDE_OPENAI_API_KEY", " ");
  vi.stubEnv("OPENAI_API_KEY", " legacy-test-key ");
  expect(getOpenAIConfig()).toEqual({ apiKey: "legacy-test-key" });
});

it("treats blank keys as missing configuration", () => {
  vi.stubEnv("AJDE_OPENAI_API_KEY", "");
  vi.stubEnv("OPENAI_API_KEY", " ");
  expect(getOpenAIConfig()).toBeNull();
});
