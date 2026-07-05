// MoneyPath wordmark: green chevron mark + "MONEYPATH" text, matching the mockup.

interface LogoProps {
  showText?: boolean;
  className?: string;
}

export function Logo({ showText = true, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {/* Double-chevron mountain mark in brand green. */}
      <svg width="40" height="32" viewBox="0 0 40 32" fill="none" aria-hidden>
        <path d="M2 30 L14 6 L22 20 L20 24 L14 14 L8 30 Z" fill="#3ee27a" />
        <path d="M18 30 L28 10 L38 30 L31 30 L28 23 L25 30 Z" fill="#3ee27a" />
      </svg>
      {showText ? (
        <span className="text-xl font-extrabold tracking-tight text-text-primary">
          MONEYPATH
        </span>
      ) : null}
    </div>
  );
}
