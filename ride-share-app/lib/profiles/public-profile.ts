import 'server-only'

import { readPersonality, type Personality } from './personality'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type PublicProfile = {
  id: string
  fullName: string
  photoUrl: string
  university: string
  bio: string | null
  createdAt: string
  completedRides: number | null
  personality: Personality
  gender: 'woman' | 'man' | 'non_binary' | 'prefer_not_to_say' | null
}

export async function getPublicProfile(id: string): Promise<PublicProfile | null> {
  if (!z.uuid().safeParse(id).success) return null
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, photo_url, university, bio, gender, created_at, driver_details')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error('Could not load the public profile.', { cause: error })
  if (!data) return null

  const [drives, passengerRides] = await Promise.all([
    supabase.from('rides').select('id', { count: 'exact', head: true })
      .eq('driver_id', id).eq('status', 'completed'),
    supabase.from('bookings').select('id, rides!inner(id)', { count: 'exact', head: true })
      .eq('passenger_id', id).eq('status', 'accepted').eq('rides.status', 'completed')
      .neq('rides.driver_id', id),
  ])

  return {
    id: data.id,
    fullName: data.full_name,
    photoUrl: data.photo_url,
    university: data.university,
    bio: data.bio,
    createdAt: data.created_at,
    completedRides: drives.error || passengerRides.error || drives.count === null || passengerRides.count === null
      ? null : drives.count + passengerRides.count,
    personality: readPersonality(data.driver_details),
    gender: data.gender,
  }
}

