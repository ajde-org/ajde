import 'server-only'

import {
  buildLocationResponseRequest,
  parseLocationResponse,
} from './openai-location-contract'
import { getOpenAIConfig, OPENAI_API_BASE_URL } from './openai-config'
import type { LocationModelFallback } from './resolve-location'

const RESPONSES_URL = `${OPENAI_API_BASE_URL}/responses`

export function createOpenAILocationFallback(): LocationModelFallback | undefined {
  const config = getOpenAIConfig()
  if (!config) return undefined

  const model = process.env.OPENAI_LOCATION_MODEL || 'gpt-5-mini'

  return async (raw, candidates) => {
    try {
      const response = await fetch(RESPONSES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildLocationResponseRequest(raw, candidates, model)),
        signal: AbortSignal.timeout(10_000),
      })

      if (!response.ok) return null
      return parseLocationResponse(await response.json())
    } catch {
      return null
    }
  }
}

