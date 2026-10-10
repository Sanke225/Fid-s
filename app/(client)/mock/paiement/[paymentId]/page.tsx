import { notFound } from 'next/navigation'
import { MockCheckoutPage } from '@/features/page-client/dev/MockPages'
import { USE_MOCK } from '@/features/page-client/lib/env'
import { safeInternalPath } from '@/features/page-client/lib/safePath'

/** Page du fournisseur simulé (checkoutUrl du fournisseur `mock`). */
export default async function Page(props: PageProps<'/mock/paiement/[paymentId]'>) {
  if (!USE_MOCK) notFound()
  const { paymentId } = await props.params
  const { retour } = await props.searchParams
  return <MockCheckoutPage paymentId={paymentId} back={safeInternalPath(retour, '/dev')} />
}
