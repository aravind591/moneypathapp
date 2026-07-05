// Admin data operations: the application queue, detail, stage updates, and document
// view/verify. Wraps the /admin API so admin pages call simple typed functions.

"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";

// A row in the admin queue.
export interface AdminApplicationRow {
  id: string;
  studentName: string | null;
  studentPhone: string;
  loanAmount: number;
  institutionName: string;
  currentStage: string;
  status: string;
  documentCount: number;
  appliedAt: string;
}

export interface AdminQueueResult {
  applications: AdminApplicationRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface QueueFilters {
  status?: string;
  currentStage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// A registered student in the admin Students view.
export interface AdminStudentRow {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string;
  phoneVerified: boolean;
  preferredCountry: string | null;
  onboardingStep: number;
  documentCount: number;
  applicationCount: number;
  createdAt: string;
}

export interface AdminStudentsResult {
  students: AdminStudentRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useAdmin() {
  // Fetch the paginated, filtered application queue.
  const listApplications = useCallback(
    async (filters: QueueFilters): Promise<AdminQueueResult> => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.currentStage) params.set("currentStage", filters.currentStage);
      if (filters.search) params.set("search", filters.search);
      params.set("page", String(filters.page ?? 1));
      params.set("limit", String(filters.limit ?? 20));
      const res = await api.get(`/admin/applications?${params.toString()}`);
      return res.data.data;
    },
    []
  );

  // Fetch the paginated list of all registered students (incl. no-application ones).
  const listStudents = useCallback(
    async (filters: {
      search?: string;
      page?: number;
      limit?: number;
    }): Promise<AdminStudentsResult> => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      params.set("page", String(filters.page ?? 1));
      params.set("limit", String(filters.limit ?? 20));
      const res = await api.get(`/admin/students?${params.toString()}`);
      return res.data.data;
    },
    []
  );

  // Fetch full detail for one application.
  const getDetail = useCallback(async (id: string) => {
    const res = await api.get(`/admin/applications/${id}`);
    return res.data.data;
  }, []);

  // Fetch one student's account + profile + owned documents.
  const getStudentDetail = useCallback(async (id: string) => {
    const res = await api.get(`/admin/students/${id}`);
    return res.data.data;
  }, []);

  // Move an application to a new stage (or reject it).
  const updateStage = useCallback(
    async (
      id: string,
      newStage: string,
      note?: string,
      rejectionReason?: string
    ) => {
      const res = await api.patch(`/admin/applications/${id}/stage`, {
        newStage,
        note,
        rejectionReason,
      });
      return res.data.data;
    },
    []
  );

  // Get a fresh short-lived signed URL to view/download a document.
  const getDocumentUrl = useCallback(async (documentId: string) => {
    const res = await api.get(`/admin/documents/${documentId}/url`);
    return res.data.data as { url: string; fileName: string; mimeType: string };
  }, []);

  // Mark a document verified or flag it with a note.
  const verifyDocument = useCallback(
    async (documentId: string, isVerified: boolean, verificationNote?: string) => {
      const res = await api.patch(`/admin/documents/${documentId}/verify`, {
        isVerified,
        verificationNote,
      });
      return res.data.data;
    },
    []
  );

  // Record the bank's sanction terms on an application.
  const updateSanction = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const res = await api.patch(`/admin/applications/${id}/sanction`, data);
      return res.data.data;
    },
    []
  );

  // Add a disbursement tranche.
  const createDisbursement = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const res = await api.post(`/admin/applications/${id}/disbursements`, data);
      return res.data.data;
    },
    []
  );

  // Record a processing-fee payment.
  const createFeePayment = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const res = await api.post(`/admin/applications/${id}/fee-payments`, data);
      return res.data.data;
    },
    []
  );

  // Create/update the credit assessment (items + insights replaced wholesale).
  const upsertCreditCheck = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const res = await api.put(`/admin/applications/${id}/credit-check`, data);
      return res.data.data;
    },
    []
  );

  return {
    listApplications,
    listStudents,
    getStudentDetail,
    getDetail,
    updateStage,
    getDocumentUrl,
    verifyDocument,
    updateSanction,
    createDisbursement,
    createFeePayment,
    upsertCreditCheck,
  };
}
