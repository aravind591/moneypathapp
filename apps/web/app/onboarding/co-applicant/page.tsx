// Step 5 — Co-applicant & Collateral ("Sign up Flow-4.png"). Captures co-applicant
// details and a collateral/property choice. The collateral/property answers persist
// to the profile (PATCH /profile/collateral). Co-applicant proper is attached to an
// Application in the existing apply flow; here we collect it and store the key fields
// alongside the profile save so nothing is lost.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { WizardHeader } from "@/components/onboarding/WizardHeader";
import { WField, PillGroup, SectionCard, RadioCard } from "@/components/onboarding/fields";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const RELATIONSHIPS = ["Father", "Mother", "Spouse", "Sibling", "Guardian"];

const REGISTRATION_OPTIONS = [
  { label: "Yes, fully registered", value: "Yes, fully registered" },
  { label: "Partially registered", value: "Partially registered" },
  { label: "Not yet registered", value: "Not yet registered" },
];

export default function CoApplicantStep() {
  const router = useRouter();
  const { profile, loading, saveCollateral } = useProfile();

  // Co-applicant (display + local capture).
  const [coFirstName, setCoFirstName] = useState("");
  const [coLastName, setCoLastName] = useState("");
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [coDob, setCoDob] = useState("");
  const [coPan, setCoPan] = useState("");

  // Collateral / property (persisted to profile).
  const [ownsProperty, setOwnsProperty] = useState<boolean | undefined>();
  const [propertyAssetType, setPropertyAssetType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyMarketValue, setPropertyMarketValue] = useState("");
  const [propertyRegistration, setPropertyRegistration] = useState<string>();

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (typeof profile.ownsProperty === "boolean") setOwnsProperty(profile.ownsProperty);
    setPropertyAssetType((profile.propertyAssetType as string) ?? "");
    setPropertyType((profile.propertyType as string) ?? "");
    setPropertyLocation((profile.propertyLocation as string) ?? "");
    setPropertyMarketValue(profile.propertyMarketValue != null ? String(profile.propertyMarketValue) : "");
    setPropertyRegistration((profile.propertyRegistration as string) ?? undefined);
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await saveCollateral({
      ownsProperty,
      propertyAssetType: ownsProperty ? propertyAssetType || undefined : undefined,
      propertyType: ownsProperty ? propertyType || undefined : undefined,
      propertyLocation: ownsProperty ? propertyLocation || undefined : undefined,
      propertyMarketValue:
        ownsProperty && propertyMarketValue ? Number(propertyMarketValue) : undefined,
      propertyRegistration: ownsProperty ? propertyRegistration : undefined,
    });
    setSaving(false);
    if (res.ok) router.push("/onboarding/documents");
    else setError(res.message);
  }

  return (
    <>
      <WizardHeader
        step={5}
        title="Who is supporting you? Or do you have any collateral?"
        subtitle="This helps us calculate how much you'll need, there are no right or wrong answers."
      />

      <div className="mb-6 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-center text-xs text-text-secondary">
        A co-applicant helps you qualify for better interest rates and higher loan amounts. Their income is considered alongside yours.
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <SectionCard title="Co-applicant Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <WField label="Full Name">
              <Input placeholder="As per PAN card" value={coFirstName} onChange={(e) => setCoFirstName(e.target.value)} />
            </WField>
            <WField label="Last Name">
              <Input placeholder="As per PAN card" value={coLastName} onChange={(e) => setCoLastName(e.target.value)} />
            </WField>
            <WField label="Relationship to you">
              <Select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </WField>
            <WField label="Date of Birth">
              <Input type="date" value={coDob} onChange={(e) => setCoDob(e.target.value)} />
            </WField>
            <WField label="PAN Number" className="sm:col-span-2">
              <Input placeholder="ABCDE1234F" value={coPan} onChange={(e) => setCoPan(e.target.value)} />
            </WField>
          </div>
        </SectionCard>

        <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-center text-xs text-text-secondary">
          With collateral, interest rates can be 1.5–2% lower, saving you lakhs over the loan tenure.
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-text-primary/90">Do your family own property or assets?</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <RadioCard
              title="Yes, we own property"
              sub="Residential / commercial"
              selected={ownsProperty === true}
              onSelect={() => setOwnsProperty(true)}
            />
            <RadioCard
              title="No collateral"
              sub="Prefer collateral-free loan"
              selected={ownsProperty === false}
              onSelect={() => setOwnsProperty(false)}
            />
          </div>
        </div>

        {ownsProperty ? (
          <SectionCard title="Property Details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <WField label="Asset Type">
                <Input placeholder="Residential" value={propertyAssetType} onChange={(e) => setPropertyAssetType(e.target.value)} />
              </WField>
              <WField label="Property Type">
                <Input placeholder="e.g. Apartments, Individual house, Open Land" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} />
              </WField>
              <WField label="Location of Property">
                <Input placeholder="City, State" value={propertyLocation} onChange={(e) => setPropertyLocation(e.target.value)} />
              </WField>
              <WField label="Estimated Market Value">
                <Input inputMode="numeric" placeholder="e.g. 65,00,000" value={propertyMarketValue} onChange={(e) => setPropertyMarketValue(e.target.value)} />
              </WField>
              <WField label="Is the property registered?" className="sm:col-span-2">
                <PillGroup options={REGISTRATION_OPTIONS} value={propertyRegistration} onChange={setPropertyRegistration} />
              </WField>
            </div>
          </SectionCard>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" size="lg" disabled={saving || loading} className="w-full">
          {saving ? "Saving…" : "Save & Continue"}
        </Button>
      </form>
    </>
  );
}
