// Paginated, searchable table of ALL registered students for the admin Students
// view — including students who signed up but haven't started a loan application.
// Shows onboarding progress, document count, and whether they have an application.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin, type AdminStudentRow } from "@/hooks/useAdmin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;
const TOTAL_STEPS = 6;

export function StudentTable() {
  const router = useRouter();
  const { listStudents } = useAdmin();

  const [rows, setRows] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listStudents({ search: search || undefined, page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setRows(res.students);
        setTotalPages(res.pagination.totalPages || 1);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listStudents, search, page]);

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name, email, or phone…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="sm:max-w-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-text-secondary">
            <tr className="border-b border-border">
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Onboarding</th>
              <th className="px-3 py-3">Docs</th>
              <th className="px-3 py-3">Application</th>
              <th className="px-3 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-text-secondary">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-text-secondary">
                  No students found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/admin/students/${row.id}`)}
                  className="cursor-pointer border-b border-border/50 hover:bg-surface-2"
                >
                  <td className="px-3 py-3 font-medium">
                    {row.fullName ?? "—"}
                    {!row.phoneVerified ? (
                      <span className="ml-2 rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                        unverified
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{row.email ?? "—"}</td>
                  <td className="px-3 py-3 text-text-secondary">{row.phone}</td>
                  <td className="px-3 py-3 text-text-secondary">
                    {row.onboardingStep >= TOTAL_STEPS
                      ? "Complete"
                      : `Step ${row.onboardingStep}/${TOTAL_STEPS}`}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{row.documentCount}</td>
                  <td className="px-3 py-3 text-text-secondary">
                    {row.applicationCount > 0 ? (
                      <span className="text-brand">Yes</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {new Date(row.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
