// Step 2 — Academic & Official Details ("Sign up Flow-5.png"). School + UG grade
// blocks and optional test scores. Saves to PATCH /profile/academic.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { WizardHeader } from "@/components/onboarding/WizardHeader";
import { WField } from "@/components/onboarding/fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GradeBlock {
  tenthPercentage: string;
  tenthBoard: string;
  twelfthPercentage: string;
  twelfthStream: string;
}

const EMPTY_BLOCK: GradeBlock = {
  tenthPercentage: "",
  tenthBoard: "",
  twelfthPercentage: "",
  twelfthStream: "",
};

const TEST_KEYS = ["ielts", "toefl", "gre", "gmat", "sat", "duolingo"] as const;
type TestKey = (typeof TEST_KEYS)[number];

function GradeFields({
  value,
  onChange,
}: {
  value: GradeBlock;
  onChange: (v: GradeBlock) => void;
}) {
  const set = (k: keyof GradeBlock) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <WField label="10th Percentage / CGPA">
        <Input placeholder="eg:87.7%" value={value.tenthPercentage} onChange={set("tenthPercentage")} />
      </WField>
      <WField label="10th Board">
        <Input placeholder="eg:CBSE" value={value.tenthBoard} onChange={set("tenthBoard")} />
      </WField>
      <WField label="12th Percentage / CGPA">
        <Input placeholder="eg:91.2%" value={value.twelfthPercentage} onChange={set("twelfthPercentage")} />
      </WField>
      <WField label="12th Stream">
        <Input placeholder="eg:Science" value={value.twelfthStream} onChange={set("twelfthStream")} />
      </WField>
    </div>
  );
}

export default function AcademicStep() {
  const router = useRouter();
  const { profile, loading, saveAcademic } = useProfile();

  const [school, setSchool] = useState<GradeBlock>(EMPTY_BLOCK);
  const [ug, setUg] = useState<GradeBlock>(EMPTY_BLOCK);
  const [tests, setTests] = useState<Record<TestKey, string>>({
    ielts: "", toefl: "", gre: "", gmat: "", sat: "", duolingo: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.schoolRecords) setSchool({ ...EMPTY_BLOCK, ...(profile.schoolRecords as GradeBlock) });
    if (profile.ugRecords) setUg({ ...EMPTY_BLOCK, ...(profile.ugRecords as GradeBlock) });
    if (profile.testScores) setTests((t) => ({ ...t, ...(profile.testScores as Record<TestKey, string>) }));
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    // Drop empty test scores so we only persist what was entered.
    const testScores = Object.fromEntries(
      Object.entries(tests).filter(([, v]) => v.trim() !== "")
    );
    const res = await saveAcademic({
      schoolRecords: school,
      ugRecords: ug,
      testScores,
    });
    setSaving(false);
    if (res.ok) router.push("/onboarding/study-destination");
    else setError(res.message);
  }

  return (
    <>
      <WizardHeader
        step={2}
        title="Academic Details"
        subtitle="Your academic history is one of the key factors for loan approval. Fill in what's applicable."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-text-primary">School Records</h2>
          <GradeFields value={school} onChange={setSchool} />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Undergraduate</h2>
          <GradeFields value={ug} onChange={setUg} />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-text-primary">
            Test Scores <span className="text-sm font-normal text-text-secondary">(enter what&apos;s applicable)</span>
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEST_KEYS.map((key) => (
              <WField key={key} label={key.toUpperCase()}>
                <Input
                  placeholder="Score"
                  value={tests[key]}
                  onChange={(e) => setTests((t) => ({ ...t, [key]: e.target.value }))}
                />
              </WField>
            ))}
          </div>
        </section>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" size="lg" disabled={saving || loading} className="w-full">
          {saving ? "Saving…" : "Save & Continue"}
        </Button>
      </form>
    </>
  );
}
