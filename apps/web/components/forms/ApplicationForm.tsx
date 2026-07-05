// Multi-step loan application form: personal -> loan -> co-applicant -> review.
// Persists progress to localStorage so a closed tab doesn't lose data, validates
// each step with Zod before advancing, and submits the full payload at the end.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fullApplicationSchema,
  personalDetailsSchema,
  loanDetailsSchema,
  coApplicantSchema,
  RELATIONSHIP_OPTIONS,
  type FullApplication,
} from "@/lib/validators";
import { useApplication } from "@/hooks/useApplication";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { formatRupees } from "@/lib/utils";

const STEPS = ["Personal", "Loan", "Co-applicant", "Review"];
const STORAGE_KEY = "moneypath_application_draft";

// The per-step schema used to validate just the fields visible on that step.
const STEP_SCHEMAS = [personalDetailsSchema, loanDetailsSchema, coApplicantSchema];

export function ApplicationForm() {
  const router = useRouter();
  const { submitApplication } = useApplication();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    trigger,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<FullApplication>({
    resolver: zodResolver(fullApplicationSchema),
    mode: "onTouched",
  });

  // Restore any saved draft once on mount.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        reset(JSON.parse(saved));
      } catch {
        // Ignore a corrupt draft — start fresh.
      }
    }
  }, [reset]);

  // Persist every change to localStorage so progress survives a tab close.
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Validate only the current step's fields before moving forward.
  async function handleNext() {
    const schema = STEP_SCHEMAS[step];
    const fields = Object.keys(schema.shape) as (keyof FullApplication)[];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // Final submit — send everything to the API, clear the draft, go to documents.
  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await submitApplication(getValues());
      localStorage.removeItem(STORAGE_KEY);
      router.push("/documents");
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message ?? "Could not submit application."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const values = getValues();

  return (
    <div className="mx-auto w-full max-w-2xl rounded-card border border-border bg-surface p-6 sm:p-8">
      <StepIndicator steps={STEPS} currentStep={step} />

      {/* Step 1 — Personal details */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Field label="Full name" error={errors.fullName?.message}>
            <Input {...register("fullName")} placeholder="Siddarth Rao" />
          </Field>
          <Field label="Date of birth" error={errors.dateOfBirth?.message}>
            <Input type="date" {...register("dateOfBirth")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} placeholder="you@example.com" />
          </Field>
          <Field label="Current address" error={errors.address?.message}>
            <Input {...register("address")} placeholder="House, street, city, PIN" />
          </Field>
        </div>
      )}

      {/* Step 2 — Loan details */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Field label="Loan amount (₹)" error={errors.loanAmount?.message}>
            <Input
              type="number"
              min={50000}
              max={15000000}
              {...register("loanAmount")}
              placeholder="1100000"
            />
          </Field>
          <Field label="Course name" error={errors.courseName?.message}>
            <Input {...register("courseName")} placeholder="MS Computer Science" />
          </Field>
          <Field label="Institution name" error={errors.institutionName?.message}>
            <Input {...register("institutionName")} placeholder="MIT" />
          </Field>
          <Field label="Course duration" error={errors.courseDuration?.message}>
            <Input {...register("courseDuration")} placeholder="2 years" />
          </Field>
          <Field label="Course start date" error={errors.courseStartDate?.message}>
            <Input type="date" {...register("courseStartDate")} />
          </Field>
        </div>
      )}

      {/* Step 3 — Co-applicant details */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <Field label="Co-applicant full name" error={errors.coFullName?.message}>
            <Input {...register("coFullName")} placeholder="Rajesh Rao" />
          </Field>
          <Field label="Relationship" error={errors.relationship?.message}>
            <Select {...register("relationship")} defaultValue="">
              <option value="" disabled>
                Select relationship
              </option>
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Co-applicant phone" error={errors.coPhone?.message}>
            <Input {...register("coPhone")} placeholder="9123456780" />
          </Field>
          <Field label="Occupation" error={errors.occupation?.message}>
            <Input {...register("occupation")} placeholder="Engineer" />
          </Field>
          <Field label="Monthly income (₹)" error={errors.monthlyIncome?.message}>
            <Input type="number" {...register("monthlyIncome")} placeholder="150000" />
          </Field>
        </div>
      )}

      {/* Step 4 — Review */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <ReviewSection
            title="Personal"
            rows={[
              ["Full name", values.fullName],
              ["Date of birth", values.dateOfBirth],
              ["Email", values.email],
              ["Address", values.address],
            ]}
          />
          <ReviewSection
            title="Loan"
            rows={[
              [
                "Loan amount",
                values.loanAmount ? formatRupees(Number(values.loanAmount)) : "",
              ],
              ["Course", values.courseName],
              ["Institution", values.institutionName],
              ["Duration", values.courseDuration],
              ["Start date", values.courseStartDate],
            ]}
          />
          <ReviewSection
            title="Co-applicant"
            rows={[
              ["Name", values.coFullName],
              ["Relationship", values.relationship],
              ["Phone", values.coPhone],
              ["Occupation", values.occupation],
              [
                "Monthly income",
                values.monthlyIncome
                  ? formatRupees(Number(values.monthlyIncome))
                  : "",
              ],
            ]}
          />
          {submitError ? (
            <p className="text-sm text-danger">{submitError}</p>
          ) : null}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={step === 0}
          type="button"
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext} type="button">
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} type="button">
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
        )}
      </div>
    </div>
  );
}

// A labelled block of read-only key/value rows used on the review step.
function ReviewSection({
  title,
  rows,
}: {
  title: string;
  rows: [string, string | undefined][];
}) {
  return (
    <div className="rounded-xl border border-border bg-base p-4">
      <h3 className="mb-3 text-sm font-semibold text-brand">{title}</h3>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-text-secondary">{label}</dt>
            <dd className="text-text-primary">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
