import { apiFetch } from "./api";
import type { Recommendation } from "@/types";

export const recommendationService = {
  list: (): Promise<Recommendation[]> => apiFetch<Recommendation[]>("/recommendations"),
  getById: (id: string): Promise<Recommendation> => apiFetch<Recommendation>(`/recommendations/${id}`),
};
