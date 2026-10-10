import { ClientSpacePage } from '@/features/page-client/client-space/ClientSpacePage'

/** Espace client (G7) : /c/:accessToken */
export default async function Page(props: PageProps<'/c/[accessToken]'>) {
  const { accessToken } = await props.params
  return <ClientSpacePage accessToken={accessToken} />
}
