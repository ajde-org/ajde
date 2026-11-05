import 'server-only'
import { phoneSchema } from '@/lib/profiles/contact'

import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

import { getContactDetails } from '@/lib/profiles/contact-details'
import { createClient } from '@/lib/supabase/server'

export type ProfileCompletion = {
  complete: boolean
  profileId: string | null
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) return null
  return data.user
}

export async function getProfileCompletion(userId: string): Promise<ProfileCompletion> {
  const supabase = await createClient()
  const [{ data, error }, contacts] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, photo_url, university')
      .eq('id', userId)
      .maybeSingle(),
    getContactDetails(supabase, [userId]),
  ])

  if (error || contacts.error) throw new Error('Unable to load profile completion', { cause: error ?? contacts.error })
  if (!data) return { complete: false, profileId: null }
  const phone = contacts.data.get(userId)?.phone

  return {
    complete: Boolean(
      data.full_name.trim() && data.photo_url.trim() && data.university.trim() && phoneSchema.safeParse(phone).success,
    ),
    profileId: data.id,
  }
}

export async function requireUser(nextPath = '/rides'): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  return user
}

export async function requireCompleteProfile(nextPath = '/rides'): Promise<User> {
  const user = await requireUser(nextPath)
  const profile = await getProfileCompletion(user.id)
  if (!profile.complete) redirect('/onboarding')
  return user
}

const NEXT_PATH_BASE = 'http://ajde.invalid'

/**
 * Returns `value` as a same-site path, or `fallback` if it could lead off the site. Browsers treat
 * `\` like `/` and URL parsing drops tabs and newlines, so `/\evil.com` or `/<tab>/evil.com` would
 * redirect to evil.com: reject those characters, then require the parsed URL to stay on our origin.
 */
export function safeNextPath(value: string | null, fallback = '/rides'): string {
  if (!value?.startsWith('/')) return fallback
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (char === '\\' || code < 0x20 || code === 0x7f) return fallback
  }
  let url: URL
  try {
    url = new URL(value, NEXT_PATH_BASE)
  } catch {
    return fallback
  }
  if (url.origin !== NEXT_PATH_BASE) return fallback
  return `${url.pathname}${url.search}${url.hash}`
}

