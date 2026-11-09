import { describe, expect, it } from 'vitest'
import { personalitySchema, profileReturnPath, readPersonality, memberSince } from './personality'

describe('driver personality', () => {
  it('keeps optional profiles empty and trims prompt answers', () => {
    expect(readPersonality(null)).toEqual({ prompts: [] })
    expect(personalitySchema.parse({ music: 'shared', prompts: [{ id: 'snack', answer: '  Coffee!  ' }] })).toEqual({ music: 'shared', prompts: [{ id: 'snack', answer: 'Coffee!' }] })
  })
  it.each([
    { music: 'loud' }, { smoking: null }, { contact: 'private' },
    { prompts: [{ id: 'snack', answer: '  ' }] },
    { prompts: [{ id: 'snack', answer: 'x'.repeat(181) }] },
    { prompts: [{ id: 'dating', answer: 'No' }] },
    { prompts: [{ id: 'snack', answer: 'a' }, { id: 'snack', answer: 'b' }] },
    { prompts: ['snack', 'detour', 'playlist', 'superpower'].map(id => ({ id, answer: 'a' })) },
  ])('rejects malformed or excessive answers: %j', value => {
    expect(personalitySchema.safeParse(value).success).toBe(false)
  })
  it('formats the actual membership month consistently', () => {
    expect(memberSince('2020-05-15T12:00:00Z')).toBe('05.2020')
  })
})

describe('profile return destination', () => {
  const ride = '/rides/20000000-0000-4000-8000-000000000001'
  it('returns to the originating seat-request page', () => expect(profileReturnPath(ride)).toBe(ride))
  it.each([undefined, [ride], '//example.com', 'https://example.com', '/rides/../login', '/rides', '/rides/invalid', `${ride}?next=evil`])('falls back safely for %j', value => {
    expect(profileReturnPath(value)).toBe('/rides')
  })
})
