'use client';

import { InvoiceList } from '@/components/invoices/InvoiceList';
import { useClientInvoices } from '@/lib/queries/client';

export default function ClientInvoicesPage() {
  const q = useClientInvoices();
  return <InvoiceList side="client" data={q.data} isPending={q.isPending} error={q.error} onRetry={() => q.refetch()} />;
}
