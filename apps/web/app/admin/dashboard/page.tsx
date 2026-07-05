// Admin dashboard — two tabs: the loan application queue, and the full list of
// registered students (including those who signed up but haven't applied yet).

"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ApplicationTable } from "@/components/admin/ApplicationTable";
import { StudentTable } from "@/components/admin/StudentTable";
import { adminTokenStore } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Tab = "applications" | "students";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("applications");

  function logout() {
    adminTokenStore.clear();
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <button
            onClick={logout}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border">
          {(
            [
              { key: "applications", label: "Applications" },
              { key: "students", label: "Students" },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-brand text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "applications" ? (
          <>
            <h1 className="text-2xl font-bold">Applications</h1>
            <p className="mb-6 text-sm text-text-secondary">
              Review applications, verify documents, and advance loan stages.
            </p>
            <ApplicationTable />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="mb-6 text-sm text-text-secondary">
              Everyone who has registered — including students who haven&apos;t started a loan application yet.
            </p>
            <StudentTable />
          </>
        )}
      </div>
    </main>
  );
}
