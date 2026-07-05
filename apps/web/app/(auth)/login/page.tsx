// Student sign-in — faithful to "Login FLow.png". Email + password primary, with
// an OTP fallback ("or continue with OTP"). Google / Forgot Password are present
// per the design but non-functional placeholders for now.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthHero } from "@/components/auth/AuthHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

// Hero stat cards from the mockup.
const HERO_CARDS = [
  { title: "₹4.2Cr+", sub: "Disbursed to students this year", badge: "18% this quarter" },
  { title: "2,847", sub: "Students successfully funded", badge: "94% approval rate" },
  { title: "48hrs", sub: "Average approval time", badge: "Fastest in category" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, sendOtp, verifyOtp, loading } = useAuth();

  // "password" is the default; "otp" is the fallback flow (phone -> code).
  const [mode, setMode] = useState<"password" | "otp-phone" | "otp-code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (res.ok) router.push("/dashboard");
    else setError(res.message);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await sendOtp(phone);
    if (res.ok) {
      setMode("otp-code");
      setMessage("We sent a code to your phone. (Dev: check the API console.)");
    } else setError(res.message);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await verifyOtp(phone, otp);
    if (res.ok) router.push("/dashboard");
    else setError(res.message);
  }

  return (
    <AuthShell
      hero={
        <AuthHero
          headline={<>Continue you&apos;re progress</>}
          asideTitle="Move Closer To Your Dream University"
          cards={HERO_CARDS}
        />
      }
    >
      {mode === "password" ? (
        <>
          <h1 className="text-center text-3xl font-bold text-text-primary">Sign in</h1>
          <p className="mb-8 mt-1 text-center text-sm text-text-secondary">
            Enter your registered Email id and Password
          </p>

          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
            <Field label="Email-ID" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="eg:Johndoe65@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Password" htmlFor="password" error={error ?? undefined}>
              <PasswordInput
                id="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            {/* Placeholder for now — non-functional per current scope. */}
            <button
              type="button"
              className="-mt-2 self-start text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Forgot Password?
            </button>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-secondary">or continue with OTP</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => {
              setMode("otp-phone");
              setError(null);
            }}
          >
            Send OTP to Phone
          </Button>

          <p className="mt-6 text-center text-sm text-text-secondary">
            No Account yet?{" "}
            <Link href="/signup" className="font-semibold text-text-primary hover:text-brand">
              Create one
            </Link>
          </p>
        </>
      ) : mode === "otp-phone" ? (
        <>
          <h1 className="text-center text-3xl font-bold text-text-primary">Sign in with OTP</h1>
          <p className="mb-8 mt-1 text-center text-sm text-text-secondary">
            Enter your mobile number to receive a code.
          </p>
          <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
            <Field label="Mobile number" htmlFor="phone" error={error ?? undefined}>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Sending…" : "Send OTP"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setMode("password")}
            className="mt-6 w-full text-center text-sm text-text-secondary hover:text-text-primary"
          >
            ← Back to password sign in
          </button>
        </>
      ) : (
        <>
          <h1 className="text-center text-3xl font-bold text-text-primary">Enter your code</h1>
          <p className="mb-8 mt-1 text-center text-sm text-text-secondary">
            We sent a 6-digit code to {phone}.
          </p>
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <Field label="6-digit code" htmlFor="otp" error={error ?? undefined}>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center text-lg tracking-[0.5em]"
                required
              />
            </Field>
            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Verifying…" : "Verify & Continue"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setMode("otp-phone")}
            className="mt-6 w-full text-center text-sm text-text-secondary hover:text-text-primary"
          >
            ← Change number
          </button>
        </>
      )}

      {message ? (
        <p className="mt-4 text-center text-xs text-brand">{message}</p>
      ) : null}
    </AuthShell>
  );
}
