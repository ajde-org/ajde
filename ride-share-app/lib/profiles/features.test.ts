import { afterEach, expect, it, vi } from 'vitest'
vi.mock('server-only', () => ({}))
import { profilePromptsEnabled } from './features'
afterEach(() => vi.unstubAllEnvs())
it.each([undefined, 'false', '', 'TRUE', '1'])('disables prompts for %s', value => {
  vi.stubEnv('PROFILE_PROMPTS_ENABLED', value)
  expect(profilePromptsEnabled()).toBe(false)
})
it('enables prompts only with an explicit true', () => {
  vi.stubEnv('PROFILE_PROMPTS_ENABLED', 'true')
  expect(profilePromptsEnabled()).toBe(true)
})
