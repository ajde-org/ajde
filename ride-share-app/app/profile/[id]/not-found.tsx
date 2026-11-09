import Link from 'next/link'
import { StatusPanel } from '@/components/status-panel'
import { getI18n } from '@/lib/i18n/server'

export default async function ProfileNotFound() {
  const { t } = await getI18n()
  return <StatusPanel eyebrow={t('profile.label')} title={t('profile.notFound')} actions={<Link href="/rides" className="btn-primary">{t('detail.browse')}</Link>}>
    <p>{t('profile.notFoundBody')}</p>
  </StatusPanel>
}
