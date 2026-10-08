import React from 'react';
import { DevSidebar } from '@/components/DevSidebar';

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 68px)', position: 'relative' }}>
      <DevSidebar />
      <div style={{ flex: 1, minWidth: 0, paddingBottom: '48px', overflowX: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
