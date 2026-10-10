import { notFound } from 'next/navigation'
import { MockInvoicePage } from '@/features/page-client/dev/MockPages'
import { USE_MOCK } from '@/features/page-client/lib/env'

/** Aperçu de facture, simulation uniquement (le vrai PDF vient de l'API). */
export default async function Page(props: PageProps<'/c/[accessToken]/facture'>) {
  if (!USE_MOCK) notFound()
  const { accessToken } = await props.params
  return <MockInvoicePage accessToken={accessToken} />
}
