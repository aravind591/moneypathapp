// Axios instance pre-configured with the API base URL and auth header injection.
// Every request automatically carries the stored JWT so callers don't repeat it.

import axios from "axios";

const STORAGE_KEY = "moneypath_token";
const ADMIN_STORAGE_KEY = "moneypath_admin_token";

// Base URL comes from env so we never hardcode the API host.
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Guard against a silent prod misconfig: if the env var is unset in production,
// every request would quietly hit localhost:4000 and fail (masked by mock
// fallback). Surface it loudly instead.
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_API_URL
) {
  // eslint-disable-next-line no-console
  console.error(
    "NEXT_PUBLIC_API_URL is not set — API calls will fail. Set it in the deployment environment."
  );
}

export const api = axios.create({
  baseURL: apiBaseUrl,
});

// Attach the bearer token (if present) to every outgoing request. Admin routes use
// the admin token; everything else uses the student token. This lets an admin and a
// student session coexist in the same browser without clobbering each other.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const url = config.url ?? "";
    const isAdminRequest =
      url.startsWith("/admin") || url.startsWith("/auth/admin");
    const token = isAdminRequest
      ? localStorage.getItem(ADMIN_STORAGE_KEY)
      : localStorage.getItem(STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Token helpers — single source of truth for where the JWT lives.
export const tokenStore = {
  get: () =>
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null,
  set: (token: string) => localStorage.setItem(STORAGE_KEY, token),
  clear: () => localStorage.removeItem(STORAGE_KEY),
};

// On a 401 (expired/invalid token) from a *protected* endpoint, clear the stale
// token and bounce the user to the right login — instead of silently degrading to
// mock data. We deliberately DON'T redirect on the auth endpoints themselves: a
// failed login/OTP returns 401 too, and those screens show an inline error.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      const url: string = error.config?.url ?? "";
      const isAuthCall = url.startsWith("/auth"); // login/register/otp — let the page handle it
      if (!isAuthCall) {
        const isAdmin = url.startsWith("/admin");
        const loginPath = isAdmin ? "/admin/login" : "/login";
        const key = isAdmin ? ADMIN_STORAGE_KEY : STORAGE_KEY;
        localStorage.removeItem(key);
        // Avoid a redirect loop if we're already on the login page.
        if (!window.location.pathname.startsWith(loginPath)) {
          window.location.href = loginPath;
        }
      }
    }
    return Promise.reject(error);
  }
);
