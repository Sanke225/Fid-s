import { notFound } from 'next/navigation'
import { MockFilePage } from '@/features/page-client/dev/MockPages'
import { USE_MOCK } from '@/features/page-client/lib/env'

export default async function Page(props: PageProps<'/mock/fichier/[name]'>) {
  if (!USE_MOCK) notFound()
  const { name } = await props.params
  return <MockFilePage name={name} />
}
