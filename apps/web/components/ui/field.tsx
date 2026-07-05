// Form field wrapper: label + control slot + inline error message.
// Keeps every form row visually consistent.

"use client";

import * as React from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-text-secondary"
      >
        {label}
      </label>
      {children}
      {/* Field-level validation message shown in red when present. */}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
