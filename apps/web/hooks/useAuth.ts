// Student auth: OTP request/verify and token handling. Wraps the API so pages call
// simple functions (sendOtp/verifyOtp/logout) without touching axios directly.

"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { api, tokenStore } from "@/lib/api";

interface SendOtpResult {
  ok: boolean;
  message: string;
}

interface VerifyOtpResult {
  ok: boolean;
  message: string;
}

interface AuthResult {
  ok: boolean;
  message: string;
}

// Fields collected by the "Sign up Account" screen.
export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  preferredCountry?: string;
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Request an OTP for the given phone number.
  const sendOtp = useCallback(async (phone: string): Promise<SendOtpResult> => {
    setLoading(true);
    try {
      const res = await api.post("/auth/send-otp", { phone });
      return { ok: true, message: res.data.message ?? "OTP sent." };
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message ?? "Could not send OTP.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify the OTP; on success store the JWT and report back.
  const verifyOtp = useCallback(
    async (phone: string, otp: string): Promise<VerifyOtpResult> => {
      setLoading(true);
      try {
        const res = await api.post("/auth/verify-otp", { phone, otp });
        tokenStore.set(res.data.data.token);
        return { ok: true, message: "Logged in." };
      } catch (error: any) {
        return {
          ok: false,
          message: error.response?.data?.message ?? "Invalid OTP.",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Register a new student (email+password). On success the API sends a phone OTP;
  // the caller then routes to the verify-number screen.
  const register = useCallback(
    async (input: RegisterInput): Promise<AuthResult> => {
      setLoading(true);
      try {
        await api.post("/auth/register", input);
        return { ok: true, message: "Account created. Verify your phone." };
      } catch (error: any) {
        return {
          ok: false,
          message: error.response?.data?.message ?? "Could not create account.",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Log in with email + password; store the JWT on success.
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setLoading(true);
      try {
        const res = await api.post("/auth/login", { email, password });
        tokenStore.set(res.data.data.token);
        return { ok: true, message: "Logged in." };
      } catch (error: any) {
        return {
          ok: false,
          message: error.response?.data?.message ?? "Invalid credentials.",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Verify the registration phone OTP; store the JWT and log the student in so
  // they can start the profile wizard.
  const verifyRegistration = useCallback(
    async (phone: string, otp: string): Promise<AuthResult> => {
      setLoading(true);
      try {
        const res = await api.post("/auth/verify-registration", { phone, otp });
        tokenStore.set(res.data.data.token);
        return { ok: true, message: "Phone verified." };
      } catch (error: any) {
        return {
          ok: false,
          message: error.response?.data?.message ?? "Invalid OTP.",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Clear the token and send the user back to login.
  const logout = useCallback(() => {
    tokenStore.clear();
    router.push("/login");
  }, [router]);

  return {
    sendOtp,
    verifyOtp,
    register,
    login,
    verifyRegistration,
    logout,
    loading,
  };
}
