// Onboarding-profile data + per-step saves. Wraps the /profile API so wizard
// pages call typed save functions without touching axios. Each save returns the
// updated profile (including completedStep) so the UI can advance.

"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

// Loosely-typed profile record (we read a subset of fields per step).
export interface ProfileRecord {
  id: string;
  completedStep: number;
  [key: string]: unknown;
}

interface SaveResult {
  ok: boolean;
  message: string;
  profile?: ProfileRecord;
}

async function patch(url: string, body: unknown): Promise<SaveResult> {
  try {
    const res = await api.patch(url, body);
    return { ok: true, message: "Saved.", profile: res.data.data };
  } catch (error: any) {
    return {
      ok: false,
      message: error.response?.data?.message ?? "Could not save.",
    };
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/profile");
      setProfile(res.data.data ?? null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveBasicInfo = useCallback(
    (data: unknown) => patch("/profile/basic-info", data),
    []
  );
  const saveAcademic = useCallback(
    (data: unknown) => patch("/profile/academic", data),
    []
  );
  const saveStudyDestination = useCallback(
    (data: unknown) => patch("/profile/study-destination", data),
    []
  );
  const saveFinancial = useCallback(
    (data: unknown) => patch("/profile/financial", data),
    []
  );
  const saveCollateral = useCallback(
    (data: unknown) => patch("/profile/collateral", data),
    []
  );
  const completeDocuments = useCallback(async (): Promise<SaveResult> => {
    try {
      const res = await api.post("/profile/complete-documents");
      return { ok: true, message: "Complete.", profile: res.data.data };
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message ?? "Could not complete.",
      };
    }
  }, []);

  return {
    profile,
    loading,
    refresh,
    saveBasicInfo,
    saveAcademic,
    saveStudyDestination,
    saveFinancial,
    saveCollateral,
    completeDocuments,
  };
}
