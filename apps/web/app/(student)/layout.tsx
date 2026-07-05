// Shell layout for all student dashboard screens: fixed left sidebar + scrollable
// main content area. The subtle green glow at the bottom of the page matches the
// mockups.

import { Sidebar } from "@/components/layout/Sidebar";
import { RequireStudentAuth } from "@/components/auth/AuthGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Client-side guard: redirects to /login when there's no student token, so no
    // dashboard screen (with its mock fallback) renders to a logged-out visitor.
    <RequireStudentAuth>
      <div className="flex min-h-screen bg-base">
        <Sidebar />
        <main className="relative flex-1 overflow-x-hidden">
          {/* Faint brand glow anchored bottom-centre, like the mockups. */}
          <div className="pointer-events-none fixed bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-brand/[0.04] blur-[120px]" />
          <div className="relative px-10 py-8">{children}</div>
        </main>
      </div>
    </RequireStudentAuth>
  );
}
