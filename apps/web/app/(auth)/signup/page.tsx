// Student registration — "Sign up Flow.png" (account form) + "Sign up Flow-1.png"
// (verify number). Two internal steps:
//   1. "account"  → collect details, POST /auth/register (sends phone OTP)
//   2. "verify"   → 6-digit OTP, POST /auth/verify-registration (logs in)
// On success, routes into the 6-step profile wizard at /onboarding.
// Google sign-up is a non-functional placeholder per current scope.

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
import { OtpBoxes } from "@/components/auth/OtpBoxes";

// Hero numbered-step cards from the mockup.
const HERO_CARDS = [
  { title: "Create you're Account", step: 1 },
  { title: "Build you're Profile", step: 2 },
  { title: "Explore Loan Matches", step: 3 },
];

export default function SignupPage() {
  const router = useRouter();
  const { register, verifyRegistration, loading } = useAuth();

  const [step, setStep] = useState<"account" | "verify">("account");

  // Account form state.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("");

  // Verify state.
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await register({
      firstName,
      lastName,
      email,
      phone,
      password,
      preferredCountry: preferredCountry || undefined,
    });
    if (res.ok) {
      setStep("verify");
      setMessage("We sent a code to your phone. (Dev: check the API console.)");
    } else {
      setError(res.message);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await verifyRegistration(phone, otp);
    if (res.ok) router.push("/onboarding");
    else setError(res.message);
  }

  return (
    <AuthShell
      hero={
        <AuthHero
          headline={
            <>
              Get Started
              <br />
              with Us
            </>
          }
          asideTitle="Complete these easy steps to register your account"
          cards={HERO_CARDS}
        />
      }
    >
      {step === "account" ? (
        <>
          <h1 className="text-center text-3xl font-bold text-text-primary">Sign up Account</h1>
          <p className="mb-8 mt-1 text-center text-sm text-text-secondary">
            Enter your personal data to create your account
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" htmlFor="firstName">
                <Input
                  id="firstName"
                  placeholder="eg:John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Field>
              <Field label="Last Name" htmlFor="lastName">
                <Input
                  id="lastName"
                  placeholder="eg:Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Field>
            </div>

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

            <Field label="Phone number" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="eg:876xxxxxx90"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <PasswordInput
                id="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            <Field label="Preferred Country" htmlFor="country" error={error ?? undefined}>
              <Input
                id="country"
                placeholder="Enter your destination"
                value={preferredCountry}
                onChange={(e) => setPreferredCountry(e.target.value)}
              />
            </Field>
            <p className="-mt-3 text-xs text-text-secondary">
              Must have atleast 8 characters
            </p>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Creating…" : "Sign up"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-text-primary hover:text-brand">
              Log in
            </Link>
          </p>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-secondary">or sign up with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Non-functional placeholder per current scope. */}
          <Button type="button" variant="secondary" size="lg" className="w-full" disabled>
            <span className="mr-1 font-bold text-[#4285F4]">G</span> Google
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-center text-3xl font-bold text-text-primary">Verify your number</h1>
          <p className="mb-8 mt-1 text-center text-sm text-text-secondary">
            We have sent a 6 digit code
          </p>

          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <OtpBoxes value={otp} onChange={setOtp} />
            {error ? <p className="text-center text-xs text-danger">{error}</p> : null}
            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Verifying…" : "Verify & Continue"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={handleRegister}
              className="font-semibold text-text-primary hover:text-brand"
            >
              Resend
            </button>
          </p>
          <p className="mt-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3 text-center text-xs text-text-secondary">
            Your code expires in 10 minutes. Check your inbox
          </p>
        </>
      )}

      {message ? (
        <p className="mt-4 text-center text-xs text-brand">{message}</p>
      ) : null}
    </AuthShell>
  );
}
