// Admin student detail — account info, onboarding profile summary, and the
// documents the student uploaded directly (view / verify / flag via the shared
// DocumentViewer). Lets staff review student-owned documents even when the
// student has not started a loan application.

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { DocumentViewer } from "@/components/admin/DocumentViewer";
import { Button } from "@/components/ui/button";

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-text-primary">{value}</dd>
    </div>
  );
}

const EDUCATION_LABELS: Record<string, string> = {
  COMPLETED_UG: "Completed UG",
  FINAL_YEAR_UG: "Final year UG",
  COMPLETED_12TH: "Completed 12th",
  WORKING_PROFESSIONAL: "Working Professional",
};

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const { getStudentDetail } = useAdmin();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStudent(await getStudentDetail(params.id));
    } finally {
      setLoading(false);
    }
  }, [getStudentDetail, params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !student) {
    return (
      <main className="min-h-screen px-4 py-8">
        <p className="mx-auto max-w-5xl text-text-secondary">Loading…</p>
      </main>
    );
  }
  if (!student) {
    return (
      <main className="min-h-screen px-4 py-8">
        <p className="mx-auto max-w-5xl text-text-secondary">Student not found.</p>
      </main>
    );
  }

  const profile = student.profile;
  const displayName =
    student.fullName ||
    [student.firstName, student.lastName].filter(Boolean).join(" ") ||
    student.phone;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">← Back</Button>
          </Link>
          {!student.phoneVerified ? (
            <span className="rounded bg-warning/15 px-2 py-1 text-xs font-medium text-warning">
              Phone unverified
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl font-bold">{displayName}</h1>
        <p className="mb-6 text-sm text-text-secondary">
          {student.email ?? "—"} · {student.phone}
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Documents — the core of this view */}
            <section className="rounded-card border border-border bg-surface p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                Documents ({student.documents.length})
              </h3>
              {student.documents.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No documents uploaded yet.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {student.documents.map((doc: any) => (
                    <DocumentViewer key={doc.id} document={doc} onChanged={load} />
                  ))}
                </div>
              )}
            </section>

            {/* Onboarding profile summary */}
            {profile ? (
              <section className="rounded-card border border-border bg-surface p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Onboarding Profile
                </h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Info label="Completed step" value={`${profile.completedStep} / 6`} />
                  <Info
                    label="Date of birth"
                    value={
                      profile.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN")
                        : "—"
                    }
                  />
                  <Info label="Nationality" value={profile.nationality ?? "—"} />
                  <Info label="Current city" value={profile.currentCity ?? "—"} />
                  <Info label="Home state" value={profile.homeState ?? "—"} />
                  <Info
                    label="Education"
                    value={
                      profile.educationLevel
                        ? EDUCATION_LABELS[profile.educationLevel] ?? profile.educationLevel
                        : "—"
                    }
                  />
                  <Info label="Destination" value={profile.destinationCountry ?? "—"} />
                  <Info label="Course" value={profile.intendedCourse ?? "—"} />
                  <Info label="University" value={profile.intendedUniversity ?? "—"} />
                  <Info label="Intake" value={profile.intake ?? "—"} />
                  <Info label="Occupation" value={profile.occupation ?? "—"} />
                  <Info
                    label="Annual income"
                    value={profile.annualIncome != null ? `₹${profile.annualIncome}` : "—"}
                  />
                </dl>
              </section>
            ) : (
              <section className="rounded-card border border-border bg-surface p-5">
                <p className="text-sm text-text-secondary">
                  Student hasn&apos;t started the onboarding profile yet.
                </p>
              </section>
            )}
          </div>

          {/* Right column: account summary */}
          <div className="lg:col-span-1">
            <section className="rounded-card border border-border bg-surface p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                Account
              </h3>
              <dl className="flex flex-col gap-3 text-sm">
                <Info label="Email" value={student.email ?? "—"} />
                <Info label="Phone" value={student.phone} />
                <Info
                  label="Preferred country"
                  value={student.preferredCountry ?? "—"}
                />
                <Info
                  label="Joined"
                  value={new Date(student.createdAt).toLocaleDateString("en-IN")}
                />
                <Info
                  label="Applications"
                  value={
                    student.applications.length > 0 ? (
                      <Link
                        href={`/admin/applications/${student.applications[0].id}`}
                        className="text-brand hover:underline"
                      >
                        View application →
                      </Link>
                    ) : (
                      "None yet"
                    )
                  }
                />
              </dl>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
