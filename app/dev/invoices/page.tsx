'use client';

import { InvoiceList } from '@/components/invoices/InvoiceList';
import { useDevInvoices } from '@/lib/queries/client';

export default function DevInvoicesPage() {
  const q = useDevInvoices();
  return <InvoiceList side="dev" data={q.data} isPending={q.isPending} error={q.error} onRetry={() => q.refetch()} />;
}
