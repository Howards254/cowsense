import { apiFetch } from "./api";
import type { Visit } from "@/types";

export const visitService = {
  list: (): Promise<Visit[]> => apiFetch<Visit[]>("/visits"),

  complete: (id: string): Promise<{ status: string; visitId: string }> =>
    apiFetch(`/visits/${id}`, { method: "PATCH" }),

  create: (data: {
    farmerId: string;
    scheduledFor: string;
    notes?: string;
    issuesObserved?: string[];
    recommendationsIssued?: string[];
  }): Promise<{ visitId: string; status: string }> =>
    apiFetch("/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};
