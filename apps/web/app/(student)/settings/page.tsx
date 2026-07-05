// Settings — placeholder page so the nav item resolves. Styled in the dashboard
// visual language; full settings UI is a future task.

"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader title="Settings" subtitle="Manage your account preferences" />
      <Card>
        <CardTitle className="mb-2">Coming soon</CardTitle>
        <p className="text-sm text-text-secondary">
          Account, notification, and security settings will live here.
        </p>
      </Card>
    </div>
  );
}
