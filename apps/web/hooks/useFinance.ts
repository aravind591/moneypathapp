// Finance data hooks: disbursement, processing-fee, and credit-check reads.
// Each returns null/empty when there's no data so screens fall back to mock.

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  // Distinguish a real request failure (network/500) from a legitimate "no data
  // yet" (200 with null). Pages can then show an error instead of an empty state.
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setError(false);
    api
      .get(path)
      .then((res) => {
        if (!cancelled) setData(res.data.data ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        // A 401 is handled globally (redirect to login); don't flag it as an error
        // here. Anything else (500/network) is a real error worth surfacing.
        if (err?.response?.status !== 401) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);
  return { data, loading, error };
}

export interface DisbursementData {
  sanctionedAmount: number;
  totalDisbursed: number;
  remainingBalance: number;
  percentReleased: number;
  disbursements: Array<{
    id: string;
    ordinal: number;
    label: string;
    detail?: string | null;
    amountRupees: number;
    scheduledDate?: string | null;
    releasedDate?: string | null;
    status: "SCHEDULED" | "RELEASED";
  }>;
  remittances: Array<{
    id: string;
    beneficiary: string;
    detail?: string | null;
    country?: string | null;
    currency?: string | null;
    amountInr: number;
    amountForeign?: number | null;
    exchangeRate?: number | null;
    transferDate?: string | null;
    transactionRef?: string | null;
    status: "UPCOMING" | "COMPLETED";
  }>;
}

export interface FeeData {
  totalFee: number;
  amountPaid: number;
  remaining: number;
  percentPaid: number;
  payments: Array<{
    id: string;
    amountRupees: number;
    method?: string | null;
    transactionRef?: string | null;
    status: "PENDING" | "PAID";
    paidAt?: string | null;
    createdAt: string;
  }>;
}

export interface CreditCheckData {
  overallProgressPct: number;
  status: string;
  startedAt: string;
  items: Array<{
    id: string;
    party: "STUDENT" | "CO_APPLICANT";
    title: string;
    detail?: string | null;
    state: "DONE" | "IN_PROGRESS" | "UPCOMING";
    badge?: string | null;
  }>;
  insights: Array<{ id: string; kind: "POSITIVE" | "ATTENTION" | "INFO"; text: string }>;
}

export const useDisbursement = () => useResource<DisbursementData>("/disbursements/mine");
export const useFeePayments = () => useResource<FeeData>("/fee-payments/mine");
export const useCreditCheck = () => useResource<CreditCheckData>("/credit-check/mine");
