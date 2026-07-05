// Shared form primitives for the wizard steps, styled to match the mockups:
//  - WField: label above a control (label slightly brighter than the auth Field)
//  - RadioCard: a selectable bordered card with a radio dot (education level, etc.)
//  - PillGroup: single-select pill toggles (years employed, sponsorship, etc.)
//  - SectionCard: a titled grouping card used on the financial/co-applicant steps

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function WField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-primary/90">
        {label}
      </label>
      {children}
    </div>
  );
}

export function RadioCard({
  title,
  sub,
  selected,
  onSelect,
}: {
  title: string;
  sub?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between rounded-xl border bg-surface-2/40 px-4 py-3.5 text-left transition-colors",
        selected ? "border-brand bg-brand/5" : "border-border hover:border-border/80"
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-text-primary">{title}</span>
        {sub ? <span className="block text-xs text-text-secondary">{sub}</span> : null}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-brand" : "border-text-secondary/50"
        )}
      >
        {selected ? <span className="h-2.5 w-2.5 rounded-full bg-brand" /> : null}
      </span>
    </button>
  );
}

export function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              active
                ? "border-text-primary bg-text-primary/5 text-text-primary"
                : "border-border text-text-secondary hover:text-text-primary"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-6">
      <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {title}
      </p>
      {children}
    </div>
  );
}
