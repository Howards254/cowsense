import type { ReactNode } from "react";

export function ChartCard({
  title, description, children, actions,
}: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}