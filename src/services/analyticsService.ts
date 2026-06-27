import { apiFetch } from "./api";

export const analyticsService = {
  farmerTrend: (): Promise<{ week: string; active: number; flagged: number }[]> =>
    apiFetch("/analytics/farmer-trend"),
  inputDemandTrend: (): Promise<{ month: string; silage: number; dairyMeal: number; vaccines: number }[]> =>
    apiFetch("/analytics/input-demand-trend"),
  adoptionTrend: (): Promise<{ month: string; adopted: number; issued: number }[]> =>
    apiFetch("/analytics/adoption-trend"),
  countyDemand: (): Promise<{ county: string; demand: number; farmers: number }[]> =>
    apiFetch("/analytics/county-demand"),
  priorityDistribution: (): Promise<{ name: string; value: number }[]> =>
    apiFetch("/analytics/priority-distribution"),
};
