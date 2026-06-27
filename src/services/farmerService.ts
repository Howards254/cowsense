import { apiFetch } from "./api";
import type { Farmer } from "@/types";

export const farmerService = {
  list: (): Promise<Farmer[]> => apiFetch<Farmer[]>("/farmers"),
  getById: (id: string): Promise<Farmer> => apiFetch<Farmer>(`/farmers/${id}`),
};
