'use server'

import 'server-only'
import { z } from 'zod'
import type { StaticMessageKey } from '@/lib/i18n/translate'
import { contactErrorKey } from '@/lib/profiles/contact-errors'
import { revalidatePath } from 'next/cache'
import { contactSchema } from '@/lib/profiles/contact'
import { requireUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

type Gender = 'woman' | 'man' | 'non_binary' | 'prefer_not_to_say'

export type ProfileInput = {
  fullName: string
  university: string
  storagePath: string
  phone: string
  socialUrl: string
  bio: string
  gender: Gender | ''
}

export type SaveProfileResult =
  | { ok: true }
  | { ok: false; messageKey: ProfileErrorKey }

export type ProfileErrorKey = Extract<StaticMessageKey, `onboarding.${string}` | `contact.${string}`>

const genders = new Set<Gender>(['woman', 'man', 'non_binary', 'prefer_not_to_say'])

export async function saveProfile(input: ProfileInput): Promise<SaveProfileResult> {
  const user = await requireUser('/onboarding')
  const shape = z.object({ fullName: z.string(), university: z.string(), bio: z.string(), gender: z.string(), storagePath: z.string(), phone: z.string(), socialUrl: z.string() }).safeParse(input)
  if (!shape.success) return { ok: false, messageKey: 'onboarding.invalidInput' }
  const contacts = contactSchema.safeParse(input)
  if (!contacts.success) return { ok: false, messageKey: contactErrorKey(contacts.error.issues[0]) }
  const fullName = input.fullName.trim()
  const university = input.university.trim()
  const bio = input.bio.trim()

  if (fullName.length < 2 || fullName.length > 100) {
    return { ok: false, messageKey: 'onboarding.nameLength' }
  }
  if (university.length < 2 || university.length > 160) {
    return { ok: false, messageKey: 'onboarding.universityLength' }
  }
  if (bio.length > 500) {
    return { ok: false, messageKey: 'onboarding.bioLength' }
  }
  if (input.storagePath && !input.storagePath.startsWith(`${user.id}/`)) {
    return { ok: false, messageKey: 'onboarding.photoOwner' }
  }
  if (input.gender && !genders.has(input.gender)) {
    return { ok: false, messageKey: 'onboarding.invalidGender' }
  }

  const supabase = await createClient()
  const { data: existing } = await supabase.from('profiles').select('photo_url').eq('id', user.id).maybeSingle()
  const photoUrl = input.storagePath
    ? supabase.storage.from('profile-photos').getPublicUrl(input.storagePath).data.publicUrl
    : existing?.photo_url
  if (!photoUrl) return { ok: false, messageKey: 'onboarding.photoRequired' }
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    photo_url: photoUrl,
    phone: contacts.data.phone,
    social_url: contacts.data.socialUrl || null,
    university,
    bio: bio || null,
    gender: input.gender || null,
  })

  if (error) {
    return { ok: false, messageKey: 'onboarding.saveFailed' }
  }

  revalidatePath('/', 'layout')
  return { ok: true }
}

