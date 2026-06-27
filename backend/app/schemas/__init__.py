from datetime import date
from pydantic import BaseModel


class CowSchema(BaseModel):
    id: str
    tag: str
    breed: str
    ageYears: int
    lactating: bool
    dailyMilkLitres: float


class HerdSchema(BaseModel):
    totalCows: int
    lactating: int
    dry: int
    calves: int
    cows: list[CowSchema]


class IssueSchema(BaseModel):
    id: str
    title: str
    description: str
    category: str
    severity: str
    status: str
    detectedAt: str


class DiseaseSchema(BaseModel):
    id: str
    name: str
    detectedAt: str | None = None
    severity: str


class ProductionMetricSchema(BaseModel):
    date: str
    litres: float


class FarmerListItem(BaseModel):
    id: str
    name: str
    phone: str
    county: str
    subCounty: str
    farmSizeAcres: float
    dairyExperienceYears: int
    priority: str
    priorityScore: int
    totalCows: int
    avgMilkLitres: float
    issues: list[IssueSchema]
    recommendations: list[str] = []
    nextFollowUp: str | None = None
    herd: HerdSchema | None = None


class FarmerDetail(BaseModel):
    id: str
    name: str
    phone: str
    county: str
    subCounty: str
    farmSizeAcres: float
    dairyExperienceYears: int
    priority: str
    priorityScore: int
    herd: HerdSchema
    issues: list[IssueSchema]
    diseases: list[DiseaseSchema]
    recommendations: list[str]
    production: list[ProductionMetricSchema]
    avgMilkLitres: float
    adoptionScore: int
    nextFollowUp: str | None = None
    lastVisit: str | None = None
    joinedAt: str


class InputSchema(BaseModel):
    id: str
    name: str
    category: str
    unit: str
    estimatedCostKes: int
    demandCount: int
    trend: str


class RecommendationSchema(BaseModel):
    id: str
    title: str
    reasoning: str
    priority: str
    status: str
    expectedOutcome: str
    requiredInputs: list[str]
    farmerCount: int
    issuedAt: str


class FollowUpSchema(BaseModel):
    id: str
    farmerId: str
    farmerName: str
    county: str
    recommendationId: str | None = None
    dueDate: str
    status: str
    purpose: str


class VisitSchema(BaseModel):
    id: str
    farmerId: str
    scheduledFor: str
    status: str
    notes: str | None = None
    issuesObserved: list[str]
    recommendationsIssued: list[str]


class DashboardStatsSchema(BaseModel):
    highPriorityFarmers: int
    pendingFollowUps: int
    recommendationsIssued: int
    inputAlerts: int
    farmersReached: int
    avgMilkProduction: float


class PriorityBucket(BaseModel):
    name: str
    value: int


class TrendPoint(BaseModel):
    week: str
    active: int
    flagged: int


class InputTrendPoint(BaseModel):
    month: str
    silage: int
    dairyMeal: int
    vaccines: int


class AdoptionTrendPoint(BaseModel):
    month: str
    adopted: int
    issued: int


class CountyDemandSchema(BaseModel):
    county: str
    demand: int
    farmers: int
