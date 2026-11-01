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

export function safeNextPath(value: string | null, fallback = '/rides'): string {
  if (!value?.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

