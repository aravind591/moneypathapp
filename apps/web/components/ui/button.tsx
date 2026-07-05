// Themed button primitive. Variants cover the brand CTA, secondary, and ghost styles
// seen in the mockup (gradient-green primary, outlined secondary).

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-brand/50",
  {
    variants: {
      variant: {
        primary: "btn-brand-gradient text-base hover:brightness-110 text-black",
        secondary:
          "border border-border bg-surface text-text-primary hover:bg-surface-2",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-2",
      },
      size: {
        md: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
