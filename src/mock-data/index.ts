import type {
  Farmer,
  Input,
  Recommendation,
  FollowUp,
  Visit,
  DashboardStats,
  CountyDemand,
  ExtensionAgent,
} from "@/types";

export const agent: ExtensionAgent = {
  id: "agent-1",
  name: "Brian Otieno",
  email: "brian.otieno@digicow.co.ke",
  phone: "+254 712 345 678",
  organization: "DigiCow",
  counties: ["Nakuru", "Kiambu", "Nyandarua"],
};

export const inputs: Input[] = [
  { id: "inp-1", name: "Silage Bags (50kg)", category: "feed", unit: "bag", estimatedCostKes: 850, demandCount: 142, trend: "up" },
  { id: "inp-2", name: "Napier Cuttings", category: "seed", unit: "bundle", estimatedCostKes: 300, demandCount: 98, trend: "up" },
  { id: "inp-3", name: "FMD Vaccine", category: "vaccine", unit: "dose", estimatedCostKes: 250, demandCount: 67, trend: "stable" },
  { id: "inp-4", name: "Dairy Meal (70kg)", category: "feed", unit: "bag", estimatedCostKes: 3200, demandCount: 211, trend: "up" },
  { id: "inp-5", name: "Mineral Supplement", category: "supplement", unit: "kg", estimatedCostKes: 450, demandCount: 54, trend: "down" },
  { id: "inp-6", name: "Deworming Bolus", category: "vaccine", unit: "dose", estimatedCostKes: 180, demandCount: 89, trend: "stable" },
];

export const recommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Introduce Silage Conservation",
    reasoning:
      "Detected declining milk yield across 3 visits combined with reported low feed reserves heading into the dry season. Silage will buffer feed availability for the next 4 months.",
    priority: "high",
    status: "issued",
    expectedOutcome: "Stabilize milk yield at 12-15L/day per cow through the dry season",
    requiredInputs: ["inp-1", "inp-2"],
    farmerCount: 34,
    issuedAt: "2025-06-18",
  },
  {
    id: "rec-2",
    title: "Supplement Dairy Feed with Concentrate",
    reasoning:
      "Average production dropped 22% in the last 30 days. Body condition score on visit notes suggests energy deficit, not disease.",
    priority: "high",
    status: "pending",
    expectedOutcome: "+3-5L/day per lactating cow within 14 days",
    requiredInputs: ["inp-4", "inp-5"],
    farmerCount: 21,
    issuedAt: "2025-06-22",
  },
  {
    id: "rec-3",
    title: "Improve Water Access Points",
    reasoning: "Farmers report walking >2km for watering. Hydration deficit correlates with the production drop.",
    priority: "medium",
    status: "adopted",
    expectedOutcome: "Reduce walking distance & improve daily water intake",
    requiredInputs: [],
    farmerCount: 12,
    issuedAt: "2025-06-10",
  },
  {
    id: "rec-4",
    title: "FMD Vaccination Drive",
    reasoning: "Vaccination overdue >90 days for 67 cows across the cluster. Outbreak risk elevated.",
    priority: "critical",
    status: "issued",
    expectedOutcome: "Herd-level immunity restored before rainy season",
    requiredInputs: ["inp-3"],
    farmerCount: 18,
    issuedAt: "2025-06-24",
  },
];

const today = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const buildProduction = (base: number): { date: string; litres: number }[] =>
  Array.from({ length: 14 }, (_, i) => ({
    date: daysFromNow(-13 + i),
    litres: Math.max(2, Math.round((base + (Math.sin(i / 2) * 2) - i * 0.15) * 10) / 10),
  }));

export const farmers: Farmer[] = [
  {
    id: "f-1",
    name: "Wanjiku Mwangi",
    phone: "+254 720 112 233",
    county: "Kiambu",
    subCounty: "Limuru",
    farmSizeAcres: 3.5,
    dairyExperienceYears: 12,
    priority: "critical",
    priorityScore: 92,
    herd: {
      totalCows: 8, lactating: 5, dry: 2, calves: 1,
      cows: [
        { id: "c-1", tag: "WM-01", breed: "Friesian", ageYears: 5, lactating: true, dailyMilkLitres: 11 },
        { id: "c-2", tag: "WM-02", breed: "Ayrshire", ageYears: 4, lactating: true, dailyMilkLitres: 9.5 },
      ],
    },
    issues: [
      { id: "i-1", title: "Declining Milk Production", description: "22% drop in 30 days", category: "production", severity: "high", status: "open", detectedAt: daysFromNow(-5) },
      { id: "i-2", title: "Low Feed Reserves", description: "Silage stock <2 weeks", category: "feed", severity: "critical", status: "open", detectedAt: daysFromNow(-3) },
    ],
    diseases: [],
    recommendations: ["rec-1", "rec-2"],
    production: buildProduction(13),
    avgMilkLitres: 10.2,
    adoptionScore: 78,
    nextFollowUp: daysFromNow(1),
    lastVisit: daysFromNow(-6),
    joinedAt: "2023-02-14",
  },
  {
    id: "f-2",
    name: "Peter Kamau",
    phone: "+254 711 998 877",
    county: "Nakuru",
    subCounty: "Rongai",
    farmSizeAcres: 5,
    dairyExperienceYears: 18,
    priority: "high",
    priorityScore: 81,
    herd: { totalCows: 12, lactating: 7, dry: 3, calves: 2, cows: [] },
    issues: [
      { id: "i-3", title: "Vaccination Overdue", description: "FMD vaccine 95 days overdue", category: "health", severity: "critical", status: "open", detectedAt: daysFromNow(-10) },
    ],
    diseases: [],
    recommendations: ["rec-4"],
    production: buildProduction(15),
    avgMilkLitres: 13.4,
    adoptionScore: 65,
    nextFollowUp: daysFromNow(0),
    lastVisit: daysFromNow(-12),
    joinedAt: "2022-08-03",
  },
  {
    id: "f-3",
    name: "Akinyi Otieno",
    phone: "+254 733 445 566",
    county: "Mombasa",
    subCounty: "Kisauni",
    farmSizeAcres: 2,
    dairyExperienceYears: 6,
    priority: "high",
    priorityScore: 76,
    herd: { totalCows: 4, lactating: 3, dry: 1, calves: 0, cows: [] },
    issues: [
      { id: "i-4", title: "Drought Risk", description: "Forecast shows 3-week dry spell", category: "water", severity: "high", status: "open", detectedAt: daysFromNow(-2) },
    ],
    diseases: [],
    recommendations: ["rec-3"],
    production: buildProduction(9),
    avgMilkLitres: 7.8,
    adoptionScore: 82,
    nextFollowUp: daysFromNow(3),
    lastVisit: daysFromNow(-4),
    joinedAt: "2024-01-22",
  },
  {
    id: "f-4",
    name: "Mary Njeri",
    phone: "+254 722 334 455",
    county: "Nyandarua",
    subCounty: "Ol Kalou",
    farmSizeAcres: 4,
    dairyExperienceYears: 9,
    priority: "medium",
    priorityScore: 58,
    herd: { totalCows: 6, lactating: 4, dry: 1, calves: 1, cows: [] },
    issues: [
      { id: "i-5", title: "Low Feed Reserves", description: "Napier shortage", category: "feed", severity: "medium", status: "in_progress", detectedAt: daysFromNow(-7) },
    ],
    diseases: [],
    recommendations: ["rec-1"],
    production: buildProduction(11),
    avgMilkLitres: 9.7,
    adoptionScore: 71,
    nextFollowUp: daysFromNow(5),
    lastVisit: daysFromNow(-9),
    joinedAt: "2023-11-08",
  },
  {
    id: "f-5",
    name: "David Kiptoo",
    phone: "+254 700 223 344",
    county: "Trans Nzoia",
    subCounty: "Kitale",
    farmSizeAcres: 8,
    dairyExperienceYears: 22,
    priority: "low",
    priorityScore: 32,
    herd: { totalCows: 18, lactating: 12, dry: 4, calves: 2, cows: [] },
    issues: [],
    diseases: [],
    recommendations: [],
    production: buildProduction(17),
    avgMilkLitres: 15.6,
    adoptionScore: 94,
    nextFollowUp: daysFromNow(14),
    lastVisit: daysFromNow(-3),
    joinedAt: "2021-05-19",
  },
  {
    id: "f-6",
    name: "Grace Wambui",
    phone: "+254 715 667 788",
    county: "Kiambu",
    subCounty: "Githunguri",
    farmSizeAcres: 2.5,
    dairyExperienceYears: 4,
    priority: "medium",
    priorityScore: 54,
    herd: { totalCows: 5, lactating: 3, dry: 1, calves: 1, cows: [] },
    issues: [
      { id: "i-6", title: "Breeding Delay", description: "Heifer not in heat 90+ days", category: "breeding", severity: "medium", status: "open", detectedAt: daysFromNow(-4) },
    ],
    diseases: [],
    recommendations: [],
    production: buildProduction(10),
    avgMilkLitres: 8.9,
    adoptionScore: 60,
    nextFollowUp: daysFromNow(2),
    lastVisit: daysFromNow(-8),
    joinedAt: "2024-03-12",
  },
];

export const followUps: FollowUp[] = [
  { id: "fu-1", farmerId: "f-2", farmerName: "Peter Kamau", county: "Nakuru", recommendationId: "rec-4", dueDate: daysFromNow(0), status: "overdue", purpose: "Confirm FMD vaccination scheduled" },
  { id: "fu-2", farmerId: "f-1", farmerName: "Wanjiku Mwangi", county: "Kiambu", recommendationId: "rec-2", dueDate: daysFromNow(1), status: "scheduled", purpose: "Verify dairy meal supplementation" },
  { id: "fu-3", farmerId: "f-6", farmerName: "Grace Wambui", county: "Kiambu", dueDate: daysFromNow(2), status: "scheduled", purpose: "Breeding consult" },
  { id: "fu-4", farmerId: "f-3", farmerName: "Akinyi Otieno", county: "Mombasa", recommendationId: "rec-3", dueDate: daysFromNow(3), status: "scheduled", purpose: "Water access check-in" },
  { id: "fu-5", farmerId: "f-4", farmerName: "Mary Njeri", county: "Nyandarua", recommendationId: "rec-1", dueDate: daysFromNow(-2), status: "overdue", purpose: "Silage adoption review" },
  { id: "fu-6", farmerId: "f-5", farmerName: "David Kiptoo", county: "Trans Nzoia", dueDate: daysFromNow(-7), status: "completed", purpose: "Routine herd review" },
];

export const visits: Visit[] = [
  { id: "v-1", farmerId: "f-1", scheduledFor: daysFromNow(-6), status: "completed", notes: "Body condition declining. Feed stock low.", issuesObserved: ["i-1", "i-2"], recommendationsIssued: ["rec-1"] },
  { id: "v-2", farmerId: "f-2", scheduledFor: daysFromNow(2), status: "scheduled", issuesObserved: [], recommendationsIssued: [] },
  { id: "v-3", farmerId: "f-3", scheduledFor: daysFromNow(-4), status: "completed", notes: "Water source 2.3km away.", issuesObserved: ["i-4"], recommendationsIssued: ["rec-3"] },
  { id: "v-4", farmerId: "f-4", scheduledFor: daysFromNow(5), status: "scheduled", issuesObserved: [], recommendationsIssued: [] },
];

export const dashboardStats: DashboardStats = {
  highPriorityFarmers: farmers.filter(f => f.priority === "high" || f.priority === "critical").length,
  pendingFollowUps: followUps.filter(f => f.status !== "completed").length,
  recommendationsIssued: recommendations.filter(r => r.status !== "pending").length,
  inputAlerts: inputs.filter(i => i.trend === "up").length,
  farmersReached: farmers.length,
  avgMilkProduction: Math.round((farmers.reduce((s, f) => s + f.avgMilkLitres, 0) / farmers.length) * 10) / 10,
};

export const countyDemand: CountyDemand[] = [
  { county: "Nakuru", demand: 312, farmers: 48 },
  { county: "Kiambu", demand: 278, farmers: 41 },
  { county: "Nyandarua", demand: 196, farmers: 32 },
  { county: "Trans Nzoia", demand: 154, farmers: 27 },
  { county: "Mombasa", demand: 88, farmers: 15 },
];

export const priorityDistribution = [
  { name: "Critical", value: farmers.filter(f => f.priority === "critical").length },
  { name: "High", value: farmers.filter(f => f.priority === "high").length },
  { name: "Medium", value: farmers.filter(f => f.priority === "medium").length },
  { name: "Low", value: farmers.filter(f => f.priority === "low").length },
];

export const farmerTrend = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  active: 80 + i * 6 + Math.round(Math.sin(i) * 5),
  flagged: 12 + Math.round(Math.cos(i) * 4),
}));

export const inputDemandTrend = Array.from({ length: 6 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  silage: 80 + i * 14,
  dairyMeal: 110 + i * 18,
  vaccines: 40 + Math.round(Math.sin(i) * 10) + i * 3,
}));

export const adoptionTrend = Array.from({ length: 6 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  adopted: 30 + i * 8,
  issued: 50 + i * 9,
}));