import { notFound } from 'next/navigation'
import { DevIndexPage } from '@/features/page-client/dev/MockPages'
import { USE_MOCK } from '@/features/page-client/lib/env'

/** Liste des scénarios simulés de la page client. */
export default function Page() {
  if (!USE_MOCK) notFound()
  return <DevIndexPage />
}
