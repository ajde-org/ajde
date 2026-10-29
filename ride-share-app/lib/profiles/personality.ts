import { z } from 'zod'

export const travelDescriptors = [
  { key: 'conversation', label: 'Conversation', icon: 'people', options: [
    { value: 'chatty', label: 'Always up for a good chat' },
    { value: 'warm_up', label: 'Chatty once I get comfortable' },
    { value: 'quiet', label: 'Happy with a quiet ride' },
  ] },
  { key: 'music', label: 'Music', icon: 'music', options: [
    { value: 'playlist', label: 'I come with a playlist' },
    { value: 'shared', label: 'Everyone gets a turn on the aux' },
    { value: 'quiet', label: 'I prefer music-free rides' },
  ] },
  { key: 'pets', label: 'Pets', icon: 'paw', options: [
    { value: 'welcome', label: 'Happy to travel with pets' },
    { value: 'ask', label: 'Ask me about pets first' },
    { value: 'no_pets', label: 'I prefer travelling without pets' },
  ] },
  { key: 'smoking', label: 'Smoking', icon: 'noSmoking', options: [
    { value: 'no_smoking', label: 'Smoke-free car, always' },
    { value: 'stops', label: 'Smoking at rest stops only' },
  ] },
] as const

export const drivingPrompts = {
  superpower: 'My road-trip superpower',
  playlist: 'The song that always makes the playlist',
  snack: 'No road trip is complete without',
  detour: 'A detour I would always take',
  passenger: 'You bring the good company, I’ll bring',
  unpopular_opinion: 'My unpopular road-trip opinion',
} as const

export const personalitySchema = z.object({
  conversation: z.enum(['chatty', 'warm_up', 'quiet']).optional(),
  music: z.enum(['playlist', 'shared', 'quiet']).optional(),
  pets: z.enum(['welcome', 'ask', 'no_pets']).optional(),
  smoking: z.enum(['no_smoking', 'stops']).optional(),
  prompts: z.array(z.object({
    id: z.enum(['superpower', 'playlist', 'snack', 'detour', 'passenger', 'unpopular_opinion']),
    answer: z.string().trim().min(1, 'Add an answer or remove the prompt.').max(180, 'Keep each prompt answer to 180 characters.'),
  }).strict()).max(3, 'Choose up to three prompts.').refine(
    prompts => new Set(prompts.map(prompt => prompt.id)).size === prompts.length,
    'Choose a different question for each prompt.',
  ).default([]),
}).strict()

export type Personality = z.infer<typeof personalitySchema>
export type PromptId = keyof typeof drivingPrompts

export function readPersonality(value: unknown): Personality {
  const parsed = personalitySchema.safeParse(value)
  return parsed.success ? parsed.data : { prompts: [] }
}

export function memberSince(createdAt: string) {
  return new Intl.DateTimeFormat('en-GB', { month: '2-digit', year: 'numeric', timeZone: 'Europe/Skopje' }).format(new Date(createdAt)).replace('/', '.')
}

/** Only local ride routes can be used as a profile's return destination. */
export function profileReturnPath(value: string | string[] | undefined) {
  return typeof value === 'string' && /^\/rides\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value : '/rides'
}
