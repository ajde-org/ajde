import 'server-only'

export function profilePromptsEnabled(): boolean {
  return process.env.PROFILE_PROMPTS_ENABLED === 'true'
}
