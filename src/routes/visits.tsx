import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, MapPin, ClipboardCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { visitService } from "@/services/visitService";
import { farmerService } from "@/services/farmerService";
import { formatDate, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Visit } from "@/types";

export const Route = createFileRoute("/visits")({
  head: () => ({ meta: [{ title: "Visits · CowSense AI" }] }),
  component: VisitsPage,
});

function VisitsPage() {
  const queryClient = useQueryClient();
  const { data: visits = [] } = useQuery({
    queryKey: ["visits"],
    queryFn: () => visitService.list(),
  });
  const { data: farmers = [] } = useQuery({
    queryKey: ["farmers"],
    queryFn: () => farmerService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { farmerId: string; scheduledFor: string; notes: string }) =>
      visitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      setDialogOpen(false);
      setNewVisit({ farmerId: "", scheduledFor: "", notes: "" });
      toast.success("Visit logged");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => visitService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      toast.success("Visit completed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({ farmerId: "", scheduledFor: "", notes: "" });

  const scheduled = visits.filter((v) => v.status === "scheduled");
  const recent = visits.filter((v) => v.status === "completed");

  return (
    <PageContainer
      title="Visits"
      description="Plan and log field visits."
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <CalendarPlus className="size-4 mr-1.5" />
              Log visit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log a new visit</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newVisit.farmerId && newVisit.scheduledFor) {
                  createMutation.mutate(newVisit);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Farmer</Label>
                <Select
                  value={newVisit.farmerId}
                  onValueChange={(v) => setNewVisit({ ...newVisit, farmerId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} · {f.county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newVisit.scheduledFor}
                  onChange={(e) => setNewVisit({ ...newVisit, scheduledFor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={newVisit.notes}
                  onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save visit"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="Scheduled"
          items={scheduled}
          farmers={farmers}
          onComplete={(id) => completeMutation.mutate(id)}
          completePending={completeMutation.isPending}
        />
        <Section title="Recent visits" items={recent} farmers={farmers} />
      </div>
    </PageContainer>
  );
}

function Section({
  title,
  items,
  farmers,
  onComplete,
  completePending,
}: {
  title: string;
  items: Visit[];
  farmers: { id: string; name: string; county: string }[];
  onComplete?: (id: string) => void;
  completePending?: boolean;
}) {
  return (
    <section>
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map((v) => {
          const farmer = farmers.find((f) => f.id === v.farmerId);
          return (
            <div key={v.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    to="/farmers/$id"
                    params={{ id: v.farmerId }}
                    className="font-medium hover:text-primary"
                  >
                    {farmer?.name}
                  </Link>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" /> {farmer?.county}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded capitalize",
                      v.status === "completed"
                        ? "bg-secondary/30 text-secondary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {v.status}
                  </span>
                  {v.status === "scheduled" && onComplete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onComplete(v.id)}
                      disabled={completePending}
                    >
                      {completePending ? "..." : "Complete"}
                    </Button>
                  )}
                </div>
              </div>
              {v.notes && (
                <p className="text-sm text-muted-foreground mt-2 flex gap-2">
                  <ClipboardCheck className="size-4 shrink-0 text-primary" />
                  {v.notes}
                </p>
              )}
              <div className="mt-3 text-xs text-muted-foreground">
                {formatDate(v.scheduledFor)} · {relativeDay(v.scheduledFor)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
