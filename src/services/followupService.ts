import { apiFetch } from "./api";
import type { FollowUp } from "@/types";

export const followupService = {
  list: (): Promise<FollowUp[]> => apiFetch<FollowUp[]>("/followups"),

  complete: (id: string): Promise<{ status: string; followUpId: string }> =>
    apiFetch(`/followups/${id}`, { method: "PATCH" }),

  create: (data: {
    farmerId: string;
    recommendationId?: string;
    purpose: string;
    dueDate: string;
  }): Promise<{ followUpId: string; status: string }> =>
    apiFetch("/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};
