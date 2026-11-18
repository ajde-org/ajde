import "server-only";

export const OPENAI_API_BASE_URL = "https://api.openai.com/v1";

export function getOpenAIConfig() {
  const projectKey = process.env.AJDE_OPENAI_API_KEY?.trim();
  // The project key belongs to OpenAI even when the shell configures another SDK provider.
  if (projectKey) return { apiKey: projectKey, baseURL: OPENAI_API_BASE_URL };

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  return apiKey ? { apiKey } : null;
}
