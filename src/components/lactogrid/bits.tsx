import type { ReactNode } from "react";

export function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  subTone = "positive",
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
  subTone?: "positive" | "negative" | "muted";
}) {
  const tone =
    subTone === "positive"
      ? "text-positive"
      : subTone === "negative"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${iconBg}`}>
          {icon}
        </div>
      </div>
      {sub && <p className={`mt-2 text-xs font-medium ${tone}`}>{sub}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
  right,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className ?? ""}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
