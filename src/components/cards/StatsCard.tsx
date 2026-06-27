import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  label, value, icon: Icon, delta, tone = "default", hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  tone?: "default" | "primary" | "warning" | "danger" | "success";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/10 text-primary",
    warning: "bg-accent/15 text-accent-foreground",
    danger: "bg-destructive/10 text-destructive",
    success: "bg-secondary/20 text-secondary-foreground",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={cn("size-10 rounded-lg grid place-items-center shrink-0", tones[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
      {delta && <div className="mt-3 text-xs text-muted-foreground">{delta}</div>}
    </div>
  );
}