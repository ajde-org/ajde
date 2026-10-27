'use client'

import { useI18n } from "@/lib/i18n/provider";
import { useActionState } from 'react'

import { requestMagicLink, type LoginState } from './actions'

const initialState: LoginState = { status: 'idle' }

export function LoginForm({ next, signingUp }: { next: string; signingUp: boolean }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(requestMagicLink, initialState)

  return (
    <form action={action} className="space-y-5" aria-busy={pending}>
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-800">{t("auth.email")}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          required
          placeholder="you@students.finki.ukim.mk"
          aria-describedby={state.messageKey ? 'email-help login-message' : 'email-help'}
          aria-invalid={state.status === 'error' || undefined}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
        />
        <p id="email-help" className="text-sm leading-6 text-slate-500">{t("auth.emailHint")}</p>
      </div>
      <button
        type="submit"
        name="intent"
        value={signingUp ? 'magic-link' : 'sign-in'}
        disabled={pending}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t("auth.continuing") : !signingUp ? t("nav.signIn") : state.status === 'sent' ? t("auth.resend") : t("auth.send")}
      </button>
      {state.messageKey ? (
        <p
          id="login-message"
          role={state.status === 'error' ? 'alert' : 'status'}
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === 'error'
              ? 'bg-rose-50 text-rose-800'
              : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          {state.messageKey === "auth.sent" ? t("auth.sent", { email: state.email ?? "" }) : state.messageKey ? t(state.messageKey) : null}
        </p>
      ) : null}
    </form>
  )
}

