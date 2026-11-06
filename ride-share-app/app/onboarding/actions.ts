'use server'

import 'server-only'
import { z } from 'zod'
import type { StaticMessageKey } from '@/lib/i18n/translate'
import { contactErrorKey } from '@/lib/profiles/contact-errors'
import { revalidatePath } from 'next/cache'
import { contactSchema } from '@/lib/profiles/contact'
import { profilePhotoPathPattern } from '@/lib/profiles/photo'
import { requireUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

const genders = ['woman', 'man', 'non_binary', 'prefer_not_to_say'] as const
type Gender = (typeof genders)[number]

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

const nameMessage = 'Enter a name between 2 and 100 characters.'
const universityMessage = 'Enter a university between 2 and 160 characters.'
const profileInputSchema = z.object({
  fullName: z.string().trim().min(2, nameMessage).max(100, nameMessage),
  university: z.string().trim().min(2, universityMessage).max(160, universityMessage),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or fewer.'),
  storagePath: z.string().max(200),
  gender: z.enum([...genders, ''], 'Choose a valid gender option.'),
}).and(contactSchema)

export async function saveProfile(input: ProfileInput): Promise<SaveProfileResult> {
  const user = await requireUser('/onboarding')
  const parsed = profileInputSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const field = issue.path[0]
    const messageKey: ProfileErrorKey = field === 'fullName' ? 'onboarding.nameLength'
      : field === 'university' ? 'onboarding.universityLength'
      : field === 'bio' ? 'onboarding.bioLength'
      : field === 'gender' ? 'onboarding.invalidGender'
      : field === 'storagePath' ? 'onboarding.photoOwner'
      : field === 'phone' || field === 'socialUrl' ? contactErrorKey(issue)
      : 'onboarding.invalidInput'
    return { ok: false, messageKey }
  }
  const { fullName, university, bio, storagePath, gender, phone, socialUrl } = parsed.data
  // The database also rejects a photo_url outside the user's own folder (guard_profile_photo).
  if (storagePath && !profilePhotoPathPattern(user.id).test(storagePath)) {
    return { ok: false, messageKey: 'onboarding.photoOwner' }
  }

  const supabase = await createClient()
  const { data: existing } = await supabase.from('profiles').select('photo_url').eq('id', user.id).maybeSingle()
  const photoUrl = storagePath
    ? supabase.storage.from('profile-photos').getPublicUrl(storagePath).data.publicUrl
    : existing?.photo_url
  if (!photoUrl) return { ok: false, messageKey: 'onboarding.photoRequired' }
  const profile = {
    full_name: fullName,
    photo_url: photoUrl,
    phone,
    social_url: socialUrl || null,
    university,
    bio: bio || null,
    gender: gender || null,
  }
  // Update, then insert if there was no row. An upsert's ON CONFLICT branch re-reads the written
  // values, which needs SELECT on the private contact columns the API roles do not have.
  const updated = await supabase.from('profiles').update(profile).eq('id', user.id).select('id')
  let error = updated.error
  if (!error && !updated.data?.length) {
    error = (await supabase.from('profiles').insert({ id: user.id, ...profile })).error
    // A concurrent submission created the row first; apply this one on top of it.
    if (error?.code === '23505') error = (await supabase.from('profiles').update(profile).eq('id', user.id)).error
  }

  if (error) {
    return { ok: false, messageKey: 'onboarding.saveFailed' }
  }

  revalidatePath('/', 'layout')
  return { ok: true }
}

