// Application data + mutations. Fetches the student's application and submits a new one.

"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { FullApplication } from "@/lib/validators";

// The application shape returned by the API (loosely typed — we read a few fields).
export interface ApplicationRecord {
  id: string;
  loanAmount: number;
  courseName: string;
  institutionName: string;
  currentStage: string;
  status: string;
  [key: string]: unknown;
}

export function useApplication() {
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the logged-in student's application (null if they haven't applied).
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/applications/mine");
      setApplication(res.data.data ?? null);
    } catch {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Submit a brand-new application from the full multi-step form data.
  const submitApplication = useCallback(
    async (form: FullApplication) => {
      // Reshape the flat form into the API's expected nested payload.
      // HTML number/date inputs always yield strings, so coerce numeric fields to
      // Number and the date to an ISO string before the API's strict Zod check.
      const payload = {
        fullName: form.fullName,
        email: form.email,
        loanAmount: Number(form.loanAmount),
        courseName: form.courseName,
        institutionName: form.institutionName,
        courseDuration: form.courseDuration,
        courseStartDate: new Date(form.courseStartDate).toISOString(),
        coApplicant: {
          fullName: form.coFullName,
          relationship: form.relationship,
          phone: form.coPhone,
          occupation: form.occupation,
          monthlyIncome: Number(form.monthlyIncome),
        },
      };
      const res = await api.post("/applications", payload);
      return res.data.data as ApplicationRecord;
    },
    []
  );

  return { application, loading, refresh, submitApplication };
}
