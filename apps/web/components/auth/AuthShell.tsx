// Two-column shell for the auth screens: green hero on the left (~63%), form
// column on the right (~37%) centered vertically. On small screens the hero is
// hidden and the form fills the width. Matches the login/sign-up mockups.

import type { ReactNode } from "react";

interface AuthShellProps {
  hero: ReactNode;
  children: ReactNode;
}

export function AuthShell({ hero, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-base p-3 lg:p-4">
      <div className="grid min-h-[calc(100vh-1.5rem)] grid-cols-1 gap-4 lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[1.7fr_1fr]">
        {hero}
        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </main>
  );
}
