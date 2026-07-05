// Small UI helpers shared across components.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind class strings, resolving conflicts (later class wins).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format a number as Indian Rupees, e.g. 1100000 -> "₹11,00,000".
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
