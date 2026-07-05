// Admin login — email + password.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Verify credentials, then enter the admin dashboard.
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError(res.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-1 text-center text-2xl font-bold">Admin Console</h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Sign in to manage applications.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@moneypath.local"
              required
            />
          </Field>
          <Field label="Password" htmlFor="password" error={error ?? undefined}>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Checking…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
