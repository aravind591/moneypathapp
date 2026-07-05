// The logged-in student's account (name/email/phone + wizard progress). Powers the
// dashboard greeting and sidebar footer with REAL data instead of mock values.

"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface MeRecord {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  phone: string;
  phoneVerified: boolean;
  preferredCountry: string | null;
  profile?: { completedStep: number } | null;
}

export function useMe() {
  const [me, setMe] = useState<MeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/profile/me");
      setMe(res.data.data ?? null);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Convenience: a best-effort display name and first name for greetings.
  const displayName =
    me?.fullName ||
    [me?.firstName, me?.lastName].filter(Boolean).join(" ") ||
    null;
  const firstName = me?.firstName || displayName?.split(" ")[0] || null;

  return { me, loading, refresh, displayName, firstName };
}
