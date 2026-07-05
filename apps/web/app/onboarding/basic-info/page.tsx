// Step 1 — Basic Information ("Sign up Flow-2.png"). Personal details + current
// education level (radio cards). Saves to PATCH /profile/basic-info, then routes
// to step 2.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { WizardHeader } from "@/components/onboarding/WizardHeader";
import { WField, RadioCard } from "@/components/onboarding/fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type EducationLevel =
  | "COMPLETED_UG"
  | "FINAL_YEAR_UG"
  | "COMPLETED_12TH"
  | "WORKING_PROFESSIONAL";

const EDUCATION_OPTIONS: { value: EducationLevel; title: string; sub: string }[] = [
  { value: "COMPLETED_UG", title: "Completed UG", sub: "Completed Bachelors degree" },
  { value: "FINAL_YEAR_UG", title: "Final year UG", sub: "Graduating this year" },
  { value: "COMPLETED_12TH", title: "Completed 12th", sub: "Completed higher secondary" },
  { value: "WORKING_PROFESSIONAL", title: "Working Professional", sub: "Currently Employed" },
];

export default function BasicInfoStep() {
  const router = useRouter();
  const { profile, loading, saveBasicInfo } = useProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [homeState, setHomeState] = useState("");
  const [educationLevel, setEducationLevel] = useState<EducationLevel | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Prefill from any saved progress.
  useEffect(() => {
    if (!profile) return;
    setDateOfBirth(
      typeof profile.dateOfBirth === "string"
        ? profile.dateOfBirth.slice(0, 10)
        : ""
    );
    setNationality((profile.nationality as string) ?? "");
    setCurrentCity((profile.currentCity as string) ?? "");
    setHomeState((profile.homeState as string) ?? "");
    setEducationLevel((profile.educationLevel as EducationLevel) ?? undefined);
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await saveBasicInfo({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      dateOfBirth: dateOfBirth || undefined,
      nationality: nationality || undefined,
      currentCity: currentCity || undefined,
      homeState: homeState || undefined,
      educationLevel,
    });
    setSaving(false);
    if (res.ok) router.push("/onboarding/academic");
    else setError(res.message);
  }

  return (
    <>
      <WizardHeader
        step={1}
        title="Basic Information"
        subtitle="Let's start with your personal details. This helps us identify the right loan products for you."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <WField label="First Name" htmlFor="firstName">
            <Input id="firstName" placeholder="eg:John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </WField>
          <WField label="Last Name" htmlFor="lastName">
            <Input id="lastName" placeholder="eg:Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </WField>
          <WField label="Date of Birth" htmlFor="dob">
            <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </WField>
          <WField label="Nationality" htmlFor="nationality">
            <Input id="nationality" placeholder="Indian" value={nationality} onChange={(e) => setNationality(e.target.value)} />
          </WField>
          <WField label="Current City" htmlFor="city">
            <Input id="city" placeholder="Chennai, Madurai....." value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} />
          </WField>
          <WField label="Home state" htmlFor="state">
            <Input id="state" placeholder="Tamilnadu" value={homeState} onChange={(e) => setHomeState(e.target.value)} />
          </WField>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-text-primary/90">Current Education Level</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EDUCATION_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.value}
                title={opt.title}
                sub={opt.sub}
                selected={educationLevel === opt.value}
                onSelect={() => setEducationLevel(opt.value)}
              />
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" size="lg" disabled={saving || loading} className="w-full">
          {saving ? "Saving…" : "Verify & Continue"}
        </Button>
      </form>
    </>
  );
}
