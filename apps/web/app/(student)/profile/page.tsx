// Profile — the logged-in student's real account information, from GET /profile/me
// (the same source the dashboard greeting and sidebar footer use).

"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMe } from "@/hooks/useMe";

// One labelled field row.
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-text-secondary">
        {label}
      </span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { me, loading, displayName } = useMe();

  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader title="Profile" subtitle="Your personal information" />

      {loading ? (
        <Card>
          <p className="py-10 text-center text-sm text-text-secondary">
            Loading your profile…
          </p>
        </Card>
      ) : !me ? (
        <Card>
          <p className="py-10 text-center text-sm text-text-secondary">
            We couldn&apos;t load your profile. Please sign in again.
          </p>
        </Card>
      ) : (
        <Card>
          {/* Header: initials avatar + name/email */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-lg font-semibold text-text-primary">
              {(displayName ?? me.phone)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <CardTitle>{displayName ?? "Your account"}</CardTitle>
              <p className="text-sm text-text-secondary">
                {me.email ?? "No email on file"}
              </p>
            </div>
          </div>

          {/* Detail grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="First name" value={me.firstName ?? "—"} />
            <Field label="Last name" value={me.lastName ?? "—"} />
            <Field label="Email" value={me.email ?? "—"} />
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-text-secondary">
                Phone
              </span>
              <span className="flex items-center gap-2 text-sm text-text-primary">
                {me.phone}
                <StatusBadge
                  label={me.phoneVerified ? "Verified" : "Unverified"}
                  tone={me.phoneVerified ? "brand" : "warning"}
                  dot
                />
              </span>
            </div>
            <Field
              label="Preferred country"
              value={me.preferredCountry ?? "—"}
            />
            <Field
              label="Onboarding"
              value={
                me.profile
                  ? `Step ${me.profile.completedStep} of 6 completed`
                  : "Not started"
              }
            />
          </div>
        </Card>
      )}
    </div>
  );
}
