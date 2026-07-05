// Client-side route guards. Tokens live in localStorage (not cookies), so edge
// middleware can't see them — the guard must run in the browser. Each guard checks
// for the relevant token on mount and redirects to the correct login if it's
// missing. It renders nothing until the check passes, so a protected page never
// flashes its (mock-fallback) contents to a logged-out visitor.

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { tokenStore } from "@/lib/api";
import { adminTokenStore } from "@/hooks/useAdminAuth";

// Shared shell: waits for a client-side auth check, redirects if it fails.
function Guard({
  hasToken,
  loginPath,
  children,
}: {
  hasToken: () => boolean;
  loginPath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (hasToken()) {
      setChecked(true);
    } else {
      // replace (not push) so Back doesn't return to the protected page.
      router.replace(loginPath);
    }
    // hasToken/loginPath are stable for a given guard instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render nothing until we've confirmed a token — avoids flashing protected UI.
  if (!checked) return null;
  return <>{children}</>;
}

// Guards student dashboard routes. Redirects to /login when no student token.
export function RequireStudentAuth({ children }: { children: React.ReactNode }) {
  return (
    <Guard hasToken={() => Boolean(tokenStore.get())} loginPath="/login">
      {children}
    </Guard>
  );
}

// Guards admin routes. The admin login page must stay public, so this is a no-op
// there and only guards the other /admin/* routes.
export function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Never guard the login page itself (it lives under /admin too).
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <Guard
      hasToken={() => Boolean(adminTokenStore.get())}
      loginPath="/admin/login"
    >
      {children}
    </Guard>
  );
}
