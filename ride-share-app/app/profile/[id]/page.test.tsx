const language = vi.hoisted(() => ({ locale: 'en' as 'en' | 'mk' }))
vi.mock('@/lib/i18n/server', async () => { const { en } = await import('@/lib/i18n/messages/en'); const { mk } = await import('@/lib/i18n/messages/mk'); const { createTranslator } = await import('@/lib/i18n/translate'); return { getI18n: async () => ({ locale: language.locale, t: createTranslator(language.locale === 'mk' ? mk : en) }) } })
vi.mock('server-only', () => ({}))
// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/lib/i18n/testing'

const fixture = vi.hoisted(() => ({
  id: '20000000-0000-4000-8000-000000000001', fullName: 'Ana Petrova',
  photoUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect width="128" height="128" fill="%23dcf5de"/%3E%3Ctext x="64" y="80" text-anchor="middle" font-size="48" fill="%23166534"%3EAP%3C/text%3E%3C/svg%3E',
  university: 'UKIM · FINKI', bio: 'Skopje during the week, Ohrid whenever I can. Always happy to share the journey.',
  gender: null, createdAt: '2024-05-15T12:00:00Z', completedRides: 39,
  personality: { conversation: 'warm_up' as const, music: 'shared' as const, pets: 'ask' as const, smoking: 'no_smoking' as const,
    prompts: [{ id: 'superpower' as const, answer: 'Finding a great bakery in every town. Yes, even at 6 am.' },
      { id: 'playlist' as const, answer: 'Anything we can all sing badly together.' },
      { id: 'snack' as const, answer: 'Coffee, burek, and a very optimistic arrival time.' }] },
}))
vi.mock('@/lib/auth/session', () => ({ getCurrentUser: async () => ({ id: fixture.id }) }))
vi.mock('@/lib/profiles/public-profile', () => ({ getPublicProfile: async () => fixture }))
vi.mock('@/components/ratings/profile-rating-summary', async importOriginal => {
  const original = await importOriginal<typeof import('@/components/ratings/profile-rating-summary')>()
  return { ...original, ProfileRatingSummary: () => null }
})
vi.mock('@/lib/ratings/queries', () => ({}))
import ProfilePage from './page'

beforeEach(() => { language.locale = 'en'; vi.stubEnv('PROFILE_PROMPTS_ENABLED', 'true') })
afterEach(() => { cleanup(); vi.unstubAllEnvs() })
it('shows real profile facts, preferences, prompts and the originating ride link', async () => {
  const returnTo = '/rides/30000000-0000-4000-8000-000000000001'
  const page = await ProfilePage({ params: Promise.resolve({id:fixture.id}), searchParams: Promise.resolve({returnTo}) })
  render(page)
  expect(screen.getByRole('link', {name:'Back to ride'}).getAttribute('href')).toBe(returnTo)
  expect(screen.getByText('05.2024')).toBeTruthy()
  expect(screen.getByText('39')).toBeTruthy()
  expect(screen.queryByText('Completed drives')).toBeNull()
  expect(screen.getByText('Completed rides')).toBeTruthy()
  expect(screen.getByRole('list', {name:'Travel preferences'}).children).toHaveLength(4)
  expect(screen.getByText(fixture.personality.prompts[0].answer)).toBeTruthy()
  expect(screen.getByRole('link', {name:'Edit profile'})).toBeTruthy()

})
it('uses a safe fallback when the return destination is external', async () => {
  render(await ProfilePage({params:Promise.resolve({id:fixture.id}),searchParams:Promise.resolve({returnTo:'https://example.com'})}))
  expect(screen.getByRole('link',{name:'Back to rides'}).getAttribute('href')).toBe('/rides')
})

it('hides prompt cards when disabled while retaining travel preferences', async () => {
  vi.stubEnv('PROFILE_PROMPTS_ENABLED', 'false')
  render(await ProfilePage({params:Promise.resolve({id:fixture.id}),searchParams:Promise.resolve({})}))
  expect(screen.queryByText('Beyond the driver’s seat')).toBeNull()
  expect(screen.queryByText(fixture.personality.prompts[0].answer)).toBeNull()
  expect(screen.getByRole('list', {name:'Travel preferences'})).toBeTruthy()
})

it('translates the driver profile into Macedonian while preserving authored answers', async () => {
  language.locale = 'mk'
  render(await ProfilePage({ params: Promise.resolve({ id: fixture.id }), searchParams: Promise.resolve({}) }), { locale: 'mk' })
  expect(screen.getByRole('link', { name: 'Назад кон превозите' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Уреди профил' })).toBeTruthy()
  expect(screen.getByText('Член од')).toBeTruthy()
  expect(screen.getByText('Завршени патувања')).toBeTruthy()
  expect(screen.getByRole('list', { name: 'Навики при патување' }).children).toHaveLength(4)
  expect(screen.getByText('Секој може да избере музика')).toBeTruthy()
  expect(screen.getByText('Мојата супермоќ на патување')).toBeTruthy()
  expect(screen.getByText(fixture.personality.prompts[0].answer)).toBeTruthy()
  expect(screen.getByText(fixture.bio)).toBeTruthy()
})
