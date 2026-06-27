import { apiFetch } from "./api";
import type {
  UrgentIntelligence,
  PrioritizationReasoning,
  InputDemandResponse,
} from "@/types";

export const intelligenceService = {
  urgent: (): Promise<UrgentIntelligence> =>
    apiFetch<UrgentIntelligence>("/intelligence/urgent"),

  prioritization: (farmerId: string): Promise<PrioritizationReasoning> =>
    apiFetch<PrioritizationReasoning>(`/agent/prioritization/${farmerId}`),

  inputDemand: (): Promise<InputDemandResponse> =>
    apiFetch<InputDemandResponse>("/agent/input-demand"),

  highDemandInputs: (): Promise<{ inputId: string; inputName: string; category: string; totalDemand: number; trend: string }[]> =>
    apiFetch("/agent/input-demand/high-demand"),

  inputDemandByCounty: (county: string): Promise<{ county: string; inputs: { county: string; inputId: string; inputName: string; demandCount: number }[]; summary: { county: string; demand: number; farmers: number } | null }> =>
    apiFetch(`/agent/input-demand/county/${encodeURIComponent(county)}`),

  weather: (): Promise<{ county: string; temperature: number; condition: string; climateRisk: string; humidity: number }[]> =>
    apiFetch("/agent/weather"),

  climateRisks: (): Promise<{ county: string; climateEvent: string | null; activeRisks: string[]; severity: string }[]> =>
    apiFetch("/agent/climate-risks"),
};
