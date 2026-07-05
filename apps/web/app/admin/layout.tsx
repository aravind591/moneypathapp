// Shell layout for all /admin routes. Applies the admin auth guard once for the
// whole section (the guard is a no-op on /admin/login, which must stay public).

import { RequireAdminAuth } from "@/components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAdminAuth>{children}</RequireAdminAuth>;
}
