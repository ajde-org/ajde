import { profilePromptsEnabled } from '@/lib/profiles/features'
import { ProfilePrompts, TravelDescriptors } from '@/components/profile-personality'
import { memberSince, profileReturnPath } from '@/lib/profiles/personality'
import { formatNumber } from "@/lib/i18n/format";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from '@/lib/auth/session'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPublicProfile } from '@/lib/profiles/public-profile'
import { ProfileRatingSummary } from '@/components/ratings/profile-rating-summary'
import { UiIcon } from '@/components/ui-icon'
import { profilePhotoSrc } from '@/lib/profiles/photo'

export async function generateMetadata() {
  return { title: (await getI18n()).t("profile.label") };
}

export default async function ProfilePage({ params, searchParams }: PageProps<'/profile/[id]'>) {
  const { locale, t } = await getI18n();
  const { id } = await params
  const returnTo = profileReturnPath((await searchParams).returnTo)
  const viewer = await getCurrentUser()
  const profile = await getPublicProfile(id)

  if (!profile) notFound()

  return (
    <main id="main-content" className="px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link href={returnTo} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-950">
          <UiIcon name="arrow" size={18} className="rotate-180" />
          {returnTo === '/rides' ? t("profile.back") : t("driverProfile.backRide")}
        </Link>
        <article className="surface-card mt-16" aria-labelledby="profile-name">
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="flex justify-center">
              <div className="-mt-14 size-28 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-[6px] ring-white sm:-mt-16 sm:size-32">
              {/* Remote profile-photo hosts are user/project specific, so this cannot use a fixed Next Image allowlist. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profilePhotoSrc(profile.photoUrl)}
                alt={t("profile.photo", { name: profile.fullName })}
                width={128}
                height={128}
                className="size-full object-cover"
              />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h1 id="profile-name" className="break-words font-display text-3xl font-extrabold leading-tight tracking-[-.04em] text-slate-950 sm:text-4xl">
                {profile.fullName}
              </h1>
              <p className="mt-2 flex items-start justify-center gap-2.5 text-base leading-relaxed text-slate-600">
                <UiIcon name="city" size={20} className="mt-1 shrink-0 text-brand-700" />
                <span className="min-w-0 [overflow-wrap:anywhere]">{profile.university}</span>
              </p>
              {viewer?.id === id ? (
                <Link href="/onboarding" className="btn-secondary mt-3 max-w-full">
                  {t("driverProfile.editShort")}
                </Link>
              ) : null}
            </div>

            <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl bg-brand-50 text-center">
              <div className="min-w-0 p-4"><dt className="text-xs font-medium text-slate-500">{t("driverProfile.memberSince")}</dt><dd className="mt-1 text-sm font-bold text-slate-900">{memberSince(profile.createdAt)}</dd></div>
              <div className="min-w-0 border-l border-slate-400/20 p-4"><dt className="text-xs font-medium text-slate-500">{t("driverProfile.completed")}</dt><dd className="mt-1 text-sm font-bold text-slate-900">{profile.completedRides === null ? t("driverProfile.unavailable") : formatNumber(locale, profile.completedRides)}</dd></div>
            </dl>
            <div className="mt-5 grid grid-cols-1 gap-5 border-t border-slate-200 pt-5">
              <section aria-labelledby="about-heading" className="min-w-0">
                <h2 id="about-heading" className="font-display text-xl font-bold tracking-tight text-slate-950">{t("profile.about")}</h2>
                <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-slate-600">
                  {profile.bio || t("driverProfile.noBioIntro")}
                </p>
                {profile.gender ? (
                  <dl className="mt-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <dt className="font-display text-sm font-bold tracking-tight text-slate-950">{t("profile.gender")}</dt>
                      <dd className="text-sm font-medium text-slate-900">
                        {profile.gender === 'man' || profile.gender === 'woman' ? (
                          <span title={t(`profile.gender.${profile.gender}`)} className={`inline-flex size-10 items-center justify-center rounded-full ${profile.gender === 'man' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                            <UiIcon name={profile.gender === 'man' ? 'male' : 'female'} size={24} />
                            <span className="sr-only">{t(`profile.gender.${profile.gender}`)}</span>
                          </span>
                        ) : t(`profile.gender.${profile.gender}`)}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </section>
              {Object.keys(profile.personality).some(key => key !== 'prompts') ? <section aria-labelledby="preferences-heading">
                <h2 id="preferences-heading" className="font-display text-xl font-bold tracking-tight text-slate-950">{t("driverProfile.preferences")}</h2>
                <TravelDescriptors personality={profile.personality} />
              </section> : null}
              <ProfileRatingSummary profileId={profile.id} />
            </div>
          </div>
        </article>
        {profilePromptsEnabled() ? <ProfilePrompts personality={profile.personality} /> : null}
        <div className="mx-auto mt-6 flex max-w-2xl items-start gap-3 px-1 text-sm leading-6 text-slate-600 sm:px-4">
          <UiIcon name="shield" size={20} className="mt-1 shrink-0" />
          <p>{t("profile.privacy")}</p>
        </div>
      </div>
    </main>
  )
}

