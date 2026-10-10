import { DeliveryPage } from '@/features/page-client/delivery/DeliveryPage'
import { first } from '@/features/page-client/lib/safePath'

/** Page de livraison publique (P6) : /l/:token */
export default async function Page(props: PageProps<'/l/[token]'>) {
  const { token } = await props.params
  const sp = await props.searchParams
  return <DeliveryPage token={token} bigScreen={first(sp.ecran) === 'grand'} returning={first(sp.retour) === '1'} />
}
