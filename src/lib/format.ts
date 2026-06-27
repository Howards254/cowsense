export const priorityTone: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-accent/15 text-accent-foreground border-accent/30",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted text-muted-foreground border-border",
};

export const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

export const relativeDay = (iso?: string) => {
  if (!iso) return "—";
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `In ${days}d`;
  return `${Math.abs(days)}d ago`;
};