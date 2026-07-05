// Step 4 — Financial Profile ("Sign up Flow-3.png"). Employment & income, contact
// details, and other details (existing EMI, sponsorship). Document uploads on this
// screen are wired in Phase 4 via the Documents step. Saves to PATCH /profile/financial.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { WizardHeader } from "@/components/onboarding/WizardHeader";
import { WField, PillGroup, SectionCard } from "@/components/onboarding/fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const YEARS_OPTIONS = [
  { label: "Less than 1 yr", value: "Less than 1 yr" },
  { label: "1–3 years", value: "1-3 years" },
  { label: "3–10 years", value: "3-10 years" },
  { label: "10+ years", value: "10+ years" },
];

const SPONSORSHIP_OPTIONS = [
  { label: "No sponsorship", value: "NONE" },
  { label: "Partial scholarship", value: "PARTIAL" },
  { label: "Full sponsor", value: "FULL" },
];

export default function FinancialStep() {
  const router = useRouter();
  const { profile, loading, saveFinancial } = useProfile();

  const [occupation, setOccupation] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [netSalary, setNetSalary] = useState("");
  const [yearsEmployed, setYearsEmployed] = useState<string>();
  const [contactMobile, setContactMobile] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [existingEmiMonthly, setExistingEmiMonthly] = useState("");
  const [sponsorshipType, setSponsorshipType] = useState<string>();
  const [sponsorshipAmount, setSponsorshipAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setOccupation((profile.occupation as string) ?? "");
    setEmployerName((profile.employerName as string) ?? "");
    setAnnualIncome(profile.annualIncome != null ? String(profile.annualIncome) : "");
    setNetSalary(profile.netSalary != null ? String(profile.netSalary) : "");
    setYearsEmployed((profile.yearsEmployed as string) ?? undefined);
    setContactMobile((profile.contactMobile as string) ?? "");
    setOfficialEmail((profile.officialEmail as string) ?? "");
    setExistingEmiMonthly(profile.existingEmiMonthly != null ? String(profile.existingEmiMonthly) : "");
    setSponsorshipType((profile.sponsorshipType as string) ?? undefined);
    setSponsorshipAmount((profile.sponsorshipAmount as string) ?? "");
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await saveFinancial({
      occupation: occupation || undefined,
      employerName: employerName || undefined,
      annualIncome: annualIncome ? Number(annualIncome) : undefined,
      netSalary: netSalary ? Number(netSalary) : undefined,
      yearsEmployed,
      contactMobile: contactMobile || undefined,
      officialEmail: officialEmail || undefined,
      existingEmiMonthly: existingEmiMonthly ? Number(existingEmiMonthly) : undefined,
      sponsorshipType,
      sponsorshipAmount: sponsorshipAmount || undefined,
    });
    setSaving(false);
    if (res.ok) router.push("/onboarding/co-applicant");
    else setError(res.message);
  }

  return (
    <>
      <WizardHeader
        step={4}
        title="Your Financial Picture"
        subtitle="This helps us calculate how much you'll need, there are no right or wrong answers."
      />

      <div className="mb-6 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-center text-xs text-text-secondary">
        Your financial data is encrypted and shared only with lenders you choose to apply to.
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <SectionCard title="Employment & Income">
          <div className="flex flex-col gap-5">
            <WField label="Occupation">
              <Input placeholder="Salaried — Private" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </WField>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <WField label="Employer / Business Name">
                <Input placeholder="Company or business name" value={employerName} onChange={(e) => setEmployerName(e.target.value)} />
              </WField>
              <WField label="Annual Income">
                <Input inputMode="numeric" placeholder="e.g. 12,00,000" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} />
              </WField>
              <WField label="Net Salary">
                <Input inputMode="numeric" placeholder="e.g. 12,00,000" value={netSalary} onChange={(e) => setNetSalary(e.target.value)} />
              </WField>
            </div>
            <WField label="Years in current employment">
              <PillGroup options={YEARS_OPTIONS} value={yearsEmployed} onChange={setYearsEmployed} />
            </WField>
          </div>
        </SectionCard>

        <SectionCard title="Contact Details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <WField label="Mobile Number">
              <Input type="tel" inputMode="numeric" placeholder="+91 98765 43210" value={contactMobile} onChange={(e) => setContactMobile(e.target.value)} />
            </WField>
            <WField label="Official Email Address">
              <Input type="email" placeholder="you@email.com" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} />
            </WField>
          </div>
        </SectionCard>

        <SectionCard title="Other Details">
          <div className="flex flex-col gap-5">
            <WField label="Existing EMI obligations (monthly)">
              <Input inputMode="numeric" placeholder="e.g. 15,000 (home loan, car loan...)" value={existingEmiMonthly} onChange={(e) => setExistingEmiMonthly(e.target.value)} />
            </WField>
            <WField label="Do you have any sponsorship or scholarship?">
              <PillGroup options={SPONSORSHIP_OPTIONS} value={sponsorshipType} onChange={setSponsorshipType} />
            </WField>
            <WField label="Scholarship / Sponsor amount (if any)">
              <Input placeholder="e.g. $8,000 / year" value={sponsorshipAmount} onChange={(e) => setSponsorshipAmount(e.target.value)} />
            </WField>
          </div>
        </SectionCard>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" size="lg" disabled={saving || loading} className="w-full">
          {saving ? "Saving…" : "Save & Continue"}
        </Button>
      </form>
    </>
  );
}
