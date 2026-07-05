// Admin auth: email + password login. Stores the admin JWT under a separate key
// so admin and student sessions don't collide in the same browser.

"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";

const ADMIN_TOKEN_KEY = "moneypath_admin_token";

// Admin token helpers — kept separate from the student token store.
export const adminTokenStore = {
  get: () =>
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_KEY)
      : null,
  set: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
};

export function useAdminAuth() {
  const [loading, setLoading] = useState(false);

  // Email + password -> full admin JWT, stored on success.
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", { email, password });
      adminTokenStore.set(res.data.data.token);
      return { ok: true as const };
    } catch (error: any) {
      return {
        ok: false as const,
        message: error.response?.data?.message ?? "Login failed.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading };
}
