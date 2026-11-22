'use client'

import { StatusPanel } from '@/components/status-panel'
import { useErrorI18n } from '@/lib/i18n/error-provider'

export default function ProfileError({ reset }: { error: Error; reset: () => void }) {
  const { t } = useErrorI18n()
  return <StatusPanel tone="error" eyebrow={t('profile.connectionError')} title={t('profile.loadFailed')} actions={<button type="button" onClick={reset} className="btn-primary">{t('common.retry')}</button>}>
    <p>{t('profile.unavailable')}</p>
  </StatusPanel>
}
