// Page header shared by every dashboard screen: large title + muted subtitle on the
// left, optional action buttons on the right (e.g. "Download Summary" + "Contact
// Advisor"). Matches the top of each mockup.

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-lg text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
