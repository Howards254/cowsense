import { apiFetch } from "./api";
import type { Visit } from "@/types";

export const visitService = {
  list: (): Promise<Visit[]> => apiFetch<Visit[]>("/visits"),
};
