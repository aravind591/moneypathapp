// MoneyPath brand logo — renders the wordmark image from /public/moneypath-logo.png
// (green double-chevron mark + white "MONEYPATH" text on transparent, ~7:1 aspect).

import Image from "next/image";

interface LogoProps {
  /** Kept for API compatibility; the wordmark PNG already includes the text. */
  showText?: boolean;
  className?: string;
  /** Rendered height in px (width scales to keep the aspect ratio). Default 30. */
  height?: number;
}

// Intrinsic size of public/moneypath-logo.png.
const NATURAL_WIDTH = 1088;
const NATURAL_HEIGHT = 157;

export function Logo({ className, height = 30 }: LogoProps) {
  const width = Math.round((NATURAL_WIDTH / NATURAL_HEIGHT) * height);
  return (
    <Image
      src="/moneypath-logo.png"
      alt="MoneyPath"
      width={width}
      height={height}
      priority
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
