import { cn } from "@/lib/utils";
import { priorityTone } from "@/lib/format";
import type { Priority } from "@/types";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize",
      priorityTone[priority],
      className,
    )}>
      {priority}
    </span>
  );
}