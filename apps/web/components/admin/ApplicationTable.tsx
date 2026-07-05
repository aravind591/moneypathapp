// Filterable, paginated table of all applications for the admin queue.
// Clicking a row navigates to that application's detail page.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin, type AdminApplicationRow } from "@/hooks/useAdmin";
import { STAGE_ORDER, STAGE_META } from "@/lib/stages";
import { StatusPill } from "./StatusPill";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/utils";

const PAGE_SIZE = 20;

export function ApplicationTable() {
  const router = useRouter();
  const { listApplications } = useAdmin();

  const [rows, setRows] = useState<AdminApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");

  // Load the queue whenever the page or filters change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listApplications({
      currentStage: stageFilter || undefined,
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setRows(res.applications);
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
  }, [listApplications, stageFilter, search, page]);

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={stageFilter}
          onChange={(e) => {
            setPage(1);
            setStageFilter(e.target.value);
          }}
          className="sm:max-w-xs"
        >
          <option value="">All stages</option>
          {STAGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {STAGE_META[s].label}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-text-secondary">
            <tr className="border-b border-border">
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Institution</th>
              <th className="px-3 py-3">Loan Amount</th>
              <th className="px-3 py-3">Stage</th>
              <th className="px-3 py-3">Docs</th>
              <th className="px-3 py-3">Applied</th>
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
                  No applications found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/admin/applications/${row.id}`)}
                  className="cursor-pointer border-b border-border/50 hover:bg-surface-2"
                >
                  <td className="px-3 py-3 font-medium">
                    {row.studentName ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{row.studentPhone}</td>
                  <td className="px-3 py-3">{row.institutionName}</td>
                  <td className="px-3 py-3">{formatRupees(row.loanAmount)}</td>
                  <td className="px-3 py-3">
                    <StatusPill value={row.currentStage} />
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{row.documentCount}</td>
                  <td className="px-3 py-3 text-text-secondary">
                    {new Date(row.appliedAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
