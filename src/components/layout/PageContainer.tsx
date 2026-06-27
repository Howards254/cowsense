import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  title, description, actions, children, className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-[1500px] mx-auto", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight truncate">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}