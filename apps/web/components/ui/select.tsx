// Themed native select. Native keeps it simple and mobile-friendly (the plan notes
// most students are on phones).

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-base px-4 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/40 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
