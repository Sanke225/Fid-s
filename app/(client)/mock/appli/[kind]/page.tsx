import { notFound } from 'next/navigation'
import { MockAppPage } from '@/features/page-client/dev/MockPages'
import { USE_MOCK } from '@/features/page-client/lib/env'
import { first } from '@/features/page-client/lib/safePath'

export default async function Page(props: PageProps<'/mock/appli/[kind]'>) {
  if (!USE_MOCK) notFound()
  const { kind } = await props.params
  const { p } = await props.searchParams
  return <MockAppPage kind={kind} projectName={first(p) ?? null} />
}
