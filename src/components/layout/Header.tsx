import { useQuery } from "@tanstack/react-query";
import { Bell, Search, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/services/api";

export function Header() {
  const { data: agent } = useQuery({
    queryKey: ["agent"],
    queryFn: () => apiFetch<{ name: string; organization: string }>("/agent"),
  });

  const name = agent?.name ?? "Brian Otieno";
  const org = agent?.organization ?? "DigiCow";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/90 backdrop-blur">
      <div className="h-full px-4 md:px-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search farmers, recommendations, inputs…" className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-background" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" className="hidden sm:inline-flex gap-1.5">
            <Plus className="size-4" /> New visit
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block leading-tight">
              <div className="text-sm font-medium">{name}</div>
              <div className="text-[11px] text-muted-foreground">{org}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
