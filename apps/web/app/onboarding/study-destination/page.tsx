// Step 3 — Study Destination (rail: "Country & Course"). No dedicated mockup was
// supplied; built in the same design language. Saves to PATCH /profile/study-destination.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { WizardHeader } from "@/components/onboarding/WizardHeader";
import { WField } from "@/components/onboarding/fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StudyDestinationStep() {
  const router = useRouter();
  const { profile, loading, saveStudyDestination } = useProfile();

  const [destinationCountry, setDestinationCountry] = useState("");
  const [intendedUniversity, setIntendedUniversity] = useState("");
  const [intendedCourse, setIntendedCourse] = useState("");
  const [intake, setIntake] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDestinationCountry((profile.destinationCountry as string) ?? "");
    setIntendedUniversity((profile.intendedUniversity as string) ?? "");
    setIntendedCourse((profile.intendedCourse as string) ?? "");
    setIntake((profile.intake as string) ?? "");
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await saveStudyDestination({
      destinationCountry: destinationCountry || undefined,
      intendedUniversity: intendedUniversity || undefined,
      intendedCourse: intendedCourse || undefined,
      intake: intake || undefined,
    });
    setSaving(false);
    if (res.ok) router.push("/onboarding/financial");
    else setError(res.message);
  }

  return (
    <>
      <WizardHeader
        step={3}
        title="Study Destination"
        subtitle="Where are you headed? This helps us match you with lenders who fund your destination."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <WField label="Destination Country">
            <Input placeholder="e.g. Canada" value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value)} />
          </WField>
          <WField label="Target University">
            <Input placeholder="e.g. University of Toronto" value={intendedUniversity} onChange={(e) => setIntendedUniversity(e.target.value)} />
          </WField>
          <WField label="Intended Course">
            <Input placeholder="e.g. M.S. Computer Science" value={intendedCourse} onChange={(e) => setIntendedCourse(e.target.value)} />
          </WField>
          <WField label="Intake">
            <Input placeholder="e.g. Fall 2025" value={intake} onChange={(e) => setIntake(e.target.value)} />
          </WField>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" size="lg" disabled={saving || loading} className="w-full">
          {saving ? "Saving…" : "Save & Continue"}
        </Button>
      </form>
    </>
  );
}
