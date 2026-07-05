// Lender data. Fetches the lender catalogue and the student's matched lenders.
// Components fall back to mock data when these return empty (e.g. no login).

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface LenderRecord {
  id: string;
  name: string;
  interestRate: number;
  maxAmountRupees: number;
  processingFeePct: number;
  speedTier: "FAST" | "MODERATE" | "SLOW";
  logoUrl?: string | null;
}

export interface LenderMatch {
  matchPercent: number;
  name: string;
  interestRate: number;
  maxAmountRupees: number;
  processingFeePct: number;
  speedTier: "FAST" | "MODERATE" | "SLOW";
}

export function useLenders() {
  const [lenders, setLenders] = useState<LenderRecord[]>([]);
  const [matches, setMatches] = useState<LenderMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, match] = await Promise.all([
          api.get("/lenders").catch(() => ({ data: { data: [] } })),
          api.get("/lenders/matches").catch(() => ({ data: { data: [] } })),
        ]);
        if (!cancelled) {
          setLenders(list.data.data ?? []);
          setMatches(match.data.data ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { lenders, matches, loading };
}
