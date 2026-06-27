import { apiFetch } from "./api";
import type { FollowUp } from "@/types";

export const followupService = {
  list: (): Promise<FollowUp[]> => apiFetch<FollowUp[]>("/followups"),
};
