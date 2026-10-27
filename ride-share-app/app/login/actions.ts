'use server'

import 'server-only'
import { z } from 'zod'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { isAllowedStudentEmail } from '@/lib/auth/email-domain'
import { getProfileCompletion, safeNextPath } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type LoginState = {
  status: 'idle' | 'error' | 'sent'
  messageKey?: 'auth.approvedEmail' | 'auth.originError' | 'auth.rateLimited' | 'auth.sendFailed' | 'auth.sent' | 'auth.failed'
  email?: string
}

export async function requestMagicLink(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = z.object({ email: z.string().trim().email().max(254), intent: z.enum(['sign-in', 'magic-link']) }).safeParse({
    email: formData.get('email'), intent: formData.get('intent') ?? 'sign-in',
  })
  if (!parsed.success) return { status: 'error', messageKey: 'auth.approvedEmail' }
  const email = parsed.data.email.toLocaleLowerCase('en-US')
  const next = safeNextPath(String(formData.get('next') ?? ''), '/rides')
  const intent = parsed.data.intent

  if (!isAllowedStudentEmail(email)) {
    return {
      status: 'error',
      messageKey: 'auth.approvedEmail',
      email,
    }
  }

  if (intent === 'sign-in') {
    return instantSignIn(email, next)
  }

  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  if (!origin) {
    return { status: 'error', messageKey: 'auth.originError', email }
  }

  const callback = new URL('/auth/callback', origin)
  callback.searchParams.set('next', next)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callback.toString(),
      shouldCreateUser: true,
    },
  })

  if (error) {
    const rateLimited = error.status === 429 || error.code === 'over_email_send_rate_limit'
    return {
      status: 'error',
      messageKey: rateLimited ? 'auth.rateLimited' : 'auth.sendFailed',
      email,
    }
  }

  return {
    status: 'sent',
    messageKey: 'auth.sent',
    email,
  }
}

// Signs in without email confirmation: the admin client mints a magic-link token
// and the server verifies it immediately. Deliberately unsafe; anyone who knows
// an approved-domain address can sign in as that user.
async function instantSignIn(email: string, next: string): Promise<LoginState> {
  let userId: string

  try {
    const admin = createAdminClient()
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (linkError) {
      console.error('Sign-in token creation failed', { code: linkError.code, status: linkError.status })
      return { status: 'error', messageKey: 'auth.failed', email }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: link.properties.hashed_token,
      // 'email' accepts both magic-link and first-time signup tokens.
      type: 'email',
    })

    if (error || !data.user) {
      return {
        status: 'error',
        messageKey: 'auth.failed',
        email,
      }
    }

    userId = data.user.id
  } catch {
    return {
      status: 'error',
      messageKey: 'auth.failed',
      email,
    }
  }

  const profile = await getProfileCompletion(userId)
  redirect(profile.complete ? next : '/onboarding')
}

