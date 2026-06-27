import { apiFetch } from "./api";
import type { DashboardStats, CountyDemand } from "@/types";

export const dashboardService = {
  getStats: (): Promise<DashboardStats> => apiFetch<DashboardStats>("/dashboard/stats"),
  getPriorityDistribution: (): Promise<{ name: string; value: number }[]> =>
    apiFetch("/dashboard/priority-distribution"),
  getFarmerTrend: (): Promise<{ week: string; active: number; flagged: number }[]> =>
    apiFetch("/dashboard/farmer-trend"),
  getInputDemandTrend: (): Promise<{ month: string; silage: number; dairyMeal: number; vaccines: number }[]> =>
    apiFetch("/dashboard/input-demand-trend"),
  getCountyDemand: (): Promise<CountyDemand[]> => apiFetch("/dashboard/county-demand"),
};
