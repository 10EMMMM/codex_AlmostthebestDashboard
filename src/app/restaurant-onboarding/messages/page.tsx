
'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function MessagesPage() {
  return (
    <DashboardLayout title="Messages">
      <div className="flex-grow flex justify-center items-center p-8">
        <p>This is the messages page.</p>
      </div>
    </DashboardLayout>
  );
}

