// CowSense AI — Type definitions
export type Priority = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type FollowUpStatus = "scheduled" | "overdue" | "completed";
export type VisitStatus = "scheduled" | "completed" | "cancelled";
export type RecommendationStatus = "pending" | "issued" | "adopted" | "declined";

export interface ExtensionAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  counties: string[];
  avatarUrl?: string;
}

export interface Cow {
  id: string;
  tag: string;
  breed: string;
  ageYears: number;
  lactating: boolean;
  dailyMilkLitres: number;
}

export interface Herd {
  totalCows: number;
  lactating: number;
  dry: number;
  calves: number;
  cows: Cow[];
}

export interface Disease {
  id: string;
  name: string;
  detectedAt: string;
  severity: Priority;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: "feed" | "health" | "production" | "water" | "breeding" | "market";
  severity: Priority;
  status: IssueStatus;
  detectedAt: string;
}

export interface Input {
  id: string;
  name: string;
  category: "feed" | "supplement" | "vaccine" | "seed" | "equipment";
  unit: string;
  estimatedCostKes: number;
  demandCount: number;
  trend: "up" | "down" | "stable";
}

export interface Recommendation {
  id: string;
  title: string;
  reasoning: string;
  priority: Priority;
  status: RecommendationStatus;
  expectedOutcome: string;
  requiredInputs: string[]; // input ids
  farmerCount: number;
  issuedAt: string;
}

export interface Visit {
  id: string;
  farmerId: string;
  scheduledFor: string;
  status: VisitStatus;
  notes?: string;
  issuesObserved: string[];
  recommendationsIssued: string[];
}

export interface FollowUp {
  id: string;
  farmerId: string;
  farmerName: string;
  county: string;
  recommendationId?: string;
  dueDate: string;
  status: FollowUpStatus;
  purpose: string;
}

export interface ProductionMetric {
  date: string;
  litres: number;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  county: string;
  subCounty: string;
  farmSizeAcres: number;
  dairyExperienceYears: number;
  priority: Priority;
  priorityScore: number; // 0-100
  herd: Herd;
  issues: Issue[];
  diseases: Disease[];
  recommendations: string[]; // recommendation ids
  production: ProductionMetric[];
  avgMilkLitres: number;
  adoptionScore: number; // 0-100
  nextFollowUp?: string;
  lastVisit?: string;
  joinedAt: string;
}

export interface DashboardStats {
  highPriorityFarmers: number;
  pendingFollowUps: number;
  recommendationsIssued: number;
  inputAlerts: number;
  farmersReached: number;
  avgMilkProduction: number;
}

export interface CountyDemand {
  county: string;
  demand: number;
  farmers: number;
}