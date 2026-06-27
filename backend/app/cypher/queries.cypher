// =====================================================================
// CowSense AI — Cypher Query Library
// =====================================================================
// Each query is documented with its purpose and expected return shape.
// Parameters use $paramName syntax.
// =====================================================================


// =====================================================================
// FARMER QUERIES
// =====================================================================

// --- farmers.list ---
// Returns all farmers with summary data for the farmers list page.
// Params: none
// Returns: {id, name, phone, county, subCounty, farmSizeAcres,
//           dairyExperienceYears, priority, priorityScore, totalCows,
//           avgMilkLitres, issues[], recommendations[], nextFollowUp}
MATCH (f:Farmer)
OPTIONAL MATCH (f)-[:OWNS]->(h:Herd)
OPTIONAL MATCH (f)-[e:EXPERIENCING]->(i:Issue)
OPTIONAL MATCH (f)-[:HAS_RECOMMENDATION]->(r:Recommendation)
WITH f, h, i, e, r
ORDER BY f.priorityScore DESC, i.issueId
WITH f, h,
  collect(CASE WHEN i IS NOT NULL THEN {
    id: i.issueId,
    title: i.name,
    description: i.description,
    category: i.category,
    severity: e.severity,
    status: e.status,
    detectedAt: toString(e.detectedAt)
  } END) AS rawIssues,
  collect(DISTINCT r.recommendationId) AS recIds
OPTIONAL MATCH (f)-[:HAS_FOLLOWUP]->(fu:FollowUp)
WHERE fu.status IN ['scheduled', 'overdue']
WITH f, h, rawIssues, recIds, fu
ORDER BY fu.dueDate ASC
WITH f, h, [x IN rawIssues WHERE x IS NOT NULL] AS issues,
  [x IN recIds WHERE x IS NOT NULL] AS recommendations,
  collect(fu.dueDate)[0] AS nextFuDate
RETURN {
  id: f.farmerId,
  name: f.fullName,
  phone: f.phone,
  county: f.county,
  subCounty: f.subCounty,
  farmSizeAcres: f.farmSizeAcres,
  dairyExperienceYears: f.dairyExperienceYears,
  priority: f.priority,
  priorityScore: f.priorityScore,
  totalCows: h.totalCows,
  avgMilkLitres: f.avgMilkLitres,
  issues: issues,
  recommendations: recommendations,
  nextFollowUp: CASE WHEN nextFuDate IS NOT NULL THEN toString(nextFuDate) ELSE NULL END,
  herd: {
    totalCows: h.totalCows,
    lactating: h.lactating,
    dry: h.dry,
    calves: h.calves,
    cows: []
  }
} AS result
ORDER BY f.priorityScore DESC;


// --- farmers.getById ---
// Returns full farmer detail for the farmer profile page.
// Params: {farmerId: string}
// Returns: full farmer object with herd, cows, issues, diseases,
//          recommendations, production, follow-ups
MATCH (f:Farmer {farmerId: $farmerId})
OPTIONAL MATCH (f)-[:OWNS]->(h:Herd)
OPTIONAL MATCH (h)-[:CONTAINS]->(c:Cow)
OPTIONAL MATCH (f)-[e:EXPERIENCING]->(i:Issue)
OPTIONAL MATCH (f)-[rsk:AT_RISK_OF]->(d:Disease)
OPTIONAL MATCH (f)-[:HAS_RECOMMENDATION]->(r:Recommendation)
OPTIONAL MATCH (f)-[:HAS_PRODUCTION]->(pm:ProductionMetric)
OPTIONAL MATCH (f)-[:HAS_FOLLOWUP]->(fu:FollowUp)
WHERE fu.status IN ['scheduled', 'overdue']
WITH f, h, c, i, e, rsk, d, r, pm, fu
ORDER BY pm.dateRecorded ASC, fu.dueDate ASC
WITH f, h,
  collect(DISTINCT {
    id: c.cowId,
    tag: c.tag,
    breed: c.breed,
    ageYears: c.ageYears,
    lactating: c.lactating,
    dailyMilkLitres: c.dailyMilkLitres
  }) AS cows,
  collect(DISTINCT CASE WHEN i IS NOT NULL THEN {
    id: i.issueId,
    title: i.name,
    description: i.description,
    category: i.category,
    severity: e.severity,
    status: e.status,
    detectedAt: toString(e.detectedAt)
  } END) AS rawIssues,
  collect(DISTINCT CASE WHEN d IS NOT NULL THEN {
    id: d.diseaseId,
    name: d.name,
    detectedAt: toString(rsk.detectedAt),
    severity: rsk.level
  } END) AS rawDiseases,
  collect(DISTINCT r.recommendationId) AS recIds,
  collect(DISTINCT {
    date: toString(pm.dateRecorded),
    litres: pm.milkLitresPerDay
  }) AS production,
  collect(DISTINCT fu.dueDate)[0] AS nextFuDate
WITH f, h, cows, rawIssues, rawDiseases, recIds, production, nextFuDate
WHERE h IS NOT NULL
RETURN {
  id: f.farmerId,
  name: f.fullName,
  phone: f.phone,
  county: f.county,
  subCounty: f.subCounty,
  farmSizeAcres: f.farmSizeAcres,
  dairyExperienceYears: f.dairyExperienceYears,
  priority: f.priority,
  priorityScore: f.priorityScore,
  herd: {
    totalCows: h.totalCows,
    lactating: h.lactating,
    dry: h.dry,
    calves: h.calves,
    cows: cows
  },
  issues: [x IN rawIssues WHERE x IS NOT NULL],
  diseases: [x IN rawDiseases WHERE x IS NOT NULL],
  recommendations: recIds,
  production: production,
  avgMilkLitres: f.avgMilkLitres,
  adoptionScore: f.adoptionScore,
  nextFollowUp: CASE WHEN nextFuDate IS NOT NULL THEN toString(nextFuDate) ELSE NULL END,
  lastVisit: CASE WHEN f.lastVisit IS NOT NULL THEN toString(f.lastVisit) ELSE NULL END,
  joinedAt: f.joinedAt
} AS result;


// =====================================================================
// DASHBOARD QUERIES
// =====================================================================

// --- dashboard.stats ---
// Aggregated stats for the dashboard header.
// Params: none
// Returns: {highPriorityFarmers, pendingFollowUps, recommendationsIssued,
//           inputAlerts, farmersReached, avgMilkProduction}
MATCH (f:Farmer)
WITH count(f) AS totalFarmers, coalesce(avg(f.avgMilkLitres), 0.0) AS avgMilk,
  sum(CASE WHEN f.priority IN ['critical', 'high'] THEN 1 ELSE 0 END) AS highPriority
CALL { MATCH (fu:FollowUp) WHERE fu.status IN ['scheduled', 'overdue'] RETURN count(fu) AS pendingFu }
CALL { MATCH (r:Recommendation) WHERE r.status IN ['issued', 'adopted'] RETURN count(r) AS recsIssued }
CALL { MATCH (i:Input) WHERE i.estimatedCostKes > 0 RETURN sum(CASE WHEN i.category IN ['feed', 'vaccine'] THEN 1 ELSE 0 END) AS alerts }
RETURN {
  highPriorityFarmers: highPriority,
  pendingFollowUps: pendingFu,
  recommendationsIssued: recsIssued,
  inputAlerts: alerts,
  farmersReached: totalFarmers,
  avgMilkProduction: round(avgMilk * 10) / 10
} AS result;


// --- dashboard.priorityDistribution ---
// Count of farmers per priority level.
// Params: none
// Returns: [{name, value}]
MATCH (f:Farmer)
WITH f.priority AS name, count(f) AS value
RETURN {name: name, value: value} AS bucket
ORDER BY value DESC;


// --- dashboard.farmerTrend ---
// Farmer activity trend computed from production metrics.
// Params: none
// Returns: [{week, active, flagged}]
MATCH (pm:ProductionMetric)
WITH pm.dateRecorded AS d
ORDER BY d
WITH collect(DISTINCT d) AS dates
UNWIND range(0, size(dates)-1) AS idx
WITH dates[idx] AS weekDate, idx
OPTIONAL MATCH (f:Farmer)-[:HAS_PRODUCTION]->(pm2:ProductionMetric)
WHERE pm2.dateRecorded = weekDate
WITH weekDate, idx, count(DISTINCT f) AS activeCount
OPTIONAL MATCH (f2:Farmer)-[e:EXPERIENCING]->(i:Issue)
WHERE e.detectedAt <= weekDate AND e.status = 'open'
WITH weekDate, idx, activeCount, count(DISTINCT f2) AS flaggedCount
RETURN {
  week: 'W' + toString(idx + 1),
  active: activeCount,
  flagged: flaggedCount
} AS result
ORDER BY idx;


// --- dashboard.inputDemandTrend ---
// Input demand trend. Computed from recommendation→input relationships.
// Params: none
// Returns: [{month, silage, dairyMeal, vaccines}]
MATCH (r:Recommendation)-[:REQUIRES]->(i:Input)
WITH i.category AS cat, count(r) AS demand
RETURN {
  month: 'Month',
  silage: coalesce(sum(CASE WHEN cat = 'feed' THEN demand ELSE 0 END), 0),
  dairyMeal: coalesce(sum(CASE WHEN cat = 'supplement' THEN demand ELSE 0 END), 0),
  vaccines: coalesce(sum(CASE WHEN cat = 'vaccine' THEN demand ELSE 0 END), 0)
} AS result;


// --- dashboard.countyDemand ---
// Farmer count and input demand per county.
// Params: none
// Returns: [{county, demand, farmers}]
MATCH (f:Farmer)
OPTIONAL MATCH (f)-[:HAS_RECOMMENDATION]->(r:Recommendation)-[:REQUIRES]->(i:Input)
WITH f.county AS county, count(DISTINCT f) AS farmers, count(i) AS demand
RETURN {county: county, farmers: farmers, demand: demand} AS data
ORDER BY farmers DESC;


// =====================================================================
// RECOMMENDATION QUERIES
// =====================================================================

// --- recommendations.list ---
// All recommendations with farmer count and required inputs.
// Params: none
// Returns: [{id, title, reasoning, priority, status, expectedOutcome,
//            requiredInputs[], farmerCount, issuedAt}]
MATCH (r:Recommendation)
OPTIONAL MATCH (r)-[:REQUIRES]->(i:Input)
WITH r, collect(i.inputId) AS inputs
RETURN {
  id: r.recommendationId,
  title: r.title,
  reasoning: r.reasoning,
  priority: r.priority,
  status: r.status,
  expectedOutcome: r.expectedOutcome,
  requiredInputs: inputs,
  farmerCount: r.farmerCount,
  issuedAt: r.issuedAt
} AS result
ORDER BY r.priority DESC;


// --- recommendations.getById ---
// Single recommendation with full detail.
// Params: {recId: string}
// Returns: {id, title, reasoning, priority, status, expectedOutcome,
//           requiredInputs[], farmerCount, issuedAt}
MATCH (r:Recommendation {recommendationId: $recId})
OPTIONAL MATCH (r)-[:REQUIRES]->(i:Input)
OPTIONAL MATCH (f:Farmer)-[:HAS_RECOMMENDATION]->(r)
OPTIONAL MATCH (r)-[:TRACKED_BY]->(fu:FollowUp)
WITH r, collect(DISTINCT i.inputId) AS inputs,
  collect(DISTINCT f.farmerId) AS farmerIds,
  collect(DISTINCT {id: fu.followUpId, status: fu.status, dueDate: toString(fu.dueDate)}) AS followUps
RETURN {
  id: r.recommendationId,
  title: r.title,
  reasoning: r.reasoning,
  priority: r.priority,
  status: r.status,
  expectedOutcome: r.expectedOutcome,
  requiredInputs: inputs,
  farmerCount: size(farmerIds),
  issuedAt: r.issuedAt,
  farmerIds: farmerIds,
  followUps: followUps
} AS result;


// =====================================================================
// FOLLOW-UP QUERIES
// =====================================================================

// --- followups.list ---
// All follow-ups with farmer info.
// Params: none
// Returns: [{id, farmerId, farmerName, county, recommendationId, dueDate, status, purpose}]
MATCH (f:Farmer)-[:HAS_FOLLOWUP]->(fu:FollowUp)
OPTIONAL MATCH (r:Recommendation)-[:TRACKED_BY]->(fu)
WITH f, fu, r.recommendationId AS recId
ORDER BY fu.dueDate ASC
RETURN {
  id: fu.followUpId,
  farmerId: f.farmerId,
  farmerName: f.fullName,
  county: f.county,
  recommendationId: recId,
  dueDate: toString(fu.dueDate),
  status: fu.status,
  purpose: fu.purpose
} AS result;


// =====================================================================
// VISIT QUERIES
// =====================================================================

// --- visits.list ---
// All visits with farmer info.
// Params: none
// Returns: [{id, farmerId, scheduledFor, status, notes, issuesObserved[], recommendationsIssued[]}]
MATCH (f:Farmer)-[:HAS_VISIT]->(v:Visit)
OPTIONAL MATCH (v)-[:OBSERVED]->(i:Issue)
OPTIONAL MATCH (v)-[:ISSUED]->(r:Recommendation)
WITH f, v, collect(DISTINCT i.issueId) AS issueIds, collect(DISTINCT r.recommendationId) AS recIds
ORDER BY v.scheduledFor DESC
RETURN {
  id: v.visitId,
  farmerId: f.farmerId,
  scheduledFor: toString(v.scheduledFor),
  status: v.status,
  notes: v.notes,
  issuesObserved: issueIds,
  recommendationsIssued: recIds
} AS result;


// =====================================================================
// INTELLIGENCE QUERIES (AI Agent support)
// =====================================================================

// --- intelligence.farmerUrgent ---
// Returns the most urgent farmer with full context for AI reasoning.
// Params: none
// Returns: {farmer, issues[], diseases[], recommendations[],
//           production[], riskFactors[]}
MATCH (f:Farmer)
WHERE f.priority IN ['critical', 'high']
OPTIONAL MATCH (f)-[e:EXPERIENCING]->(i:Issue)
OPTIONAL MATCH (f)-[rsk:AT_RISK_OF]->(d:Disease)
OPTIONAL MATCH (f)-[:HAS_RECOMMENDATION]->(r:Recommendation)
OPTIONAL MATCH (f)-[:HAS_PRODUCTION]->(pm:ProductionMetric)
WITH f, i, e, d, rsk, r, pm
ORDER BY f.priorityScore DESC, pm.dateRecorded ASC
WITH f,
  collect(DISTINCT CASE WHEN i IS NOT NULL THEN {
    id: i.issueId,
    name: i.name,
    description: i.description,
    category: i.category,
    severity: e.severity,
    status: e.status
  } END) AS rawIssues,
  collect(DISTINCT CASE WHEN d IS NOT NULL THEN {
    id: d.diseaseId,
    name: d.name,
    riskLevel: rsk.level,
    riskScore: rsk.score
  } END) AS rawDiseases,
  collect(DISTINCT {
    id: r.recommendationId,
    title: r.title,
    priority: r.priority,
    status: r.status,
    expectedOutcome: r.expectedOutcome
  }) AS rawRecs,
  collect(DISTINCT {
    date: toString(pm.dateRecorded),
    litres: pm.milkLitresPerDay
  }) AS production
RETURN {
  farmer: {
    id: f.farmerId,
    name: f.fullName,
    county: f.county,
    farmSizeAcres: f.farmSizeAcres,
    dairyExperienceYears: f.dairyExperienceYears,
    priorityScore: f.priorityScore,
    avgMilkLitres: f.avgMilkLitres,
    adoptionScore: f.adoptionScore
  },
  issues: [x IN rawIssues WHERE x IS NOT NULL],
  diseases: [x IN rawDiseases WHERE x IS NOT NULL],
  recommendations: rawRecs,
  production: production
} AS result
LIMIT 1;


// --- intelligence.inputDemandByCounty ---
// Input demand aggregated by county.
// Params: none
// Returns: [{county, inputId, inputName, demandCount}]
MATCH (f:Farmer)-[:HAS_RECOMMENDATION]->(r:Recommendation)-[:REQUIRES]->(i:Input)
WITH f.county AS cty, i.inputId AS iid, i.name AS iname, count(*) AS cnt
RETURN cty AS county, iid AS inputId, iname AS inputName, cnt AS demandCount
ORDER BY county, demandCount DESC;


// =====================================================================
// ANALYTICS QUERIES
// =====================================================================

// --- analytics.farmerTrend ---
// Weekly farmer activity trend.
// Params: none
// Returns: [{week, active, flagged}]
MATCH (pm:ProductionMetric)
WITH pm.dateRecorded AS d
ORDER BY d
WITH collect(DISTINCT d) AS dates
UNWIND range(0, size(dates)-1) AS idx
WITH dates[idx] AS weekDate, idx
OPTIONAL MATCH (f:Farmer)-[:HAS_PRODUCTION]->(pm2:ProductionMetric)
WHERE pm2.dateRecorded = weekDate
WITH weekDate, idx, count(DISTINCT f) AS activeCount
OPTIONAL MATCH (f2:Farmer)-[e:EXPERIENCING]->(i:Issue)
WHERE e.detectedAt <= weekDate AND e.status = 'open'
WITH weekDate, idx, activeCount, count(DISTINCT f2) AS flaggedCount
RETURN {
  week: 'W' + toString(idx + 1),
  active: activeCount,
  flagged: flaggedCount
} AS result
ORDER BY idx;


// --- analytics.inputDemandTrend ---
// Input demand aggregated by category.
// Params: none
// Returns: [{month, silage, dairyMeal, vaccines}]
MATCH (r:Recommendation)-[:REQUIRES]->(i:Input)
WITH i.category AS cat, count(r) AS cnt
WITH collect({cat: cat, cnt: cnt}) AS raw
RETURN {
  month: 'Total',
  silage: coalesce(reduce(s = 0, x IN raw | s + CASE WHEN x.cat = 'feed' THEN x.cnt ELSE 0 END), 0),
  dairyMeal: coalesce(reduce(s = 0, x IN raw | s + CASE WHEN x.cat = 'supplement' THEN x.cnt ELSE 0 END), 0),
  vaccines: coalesce(reduce(s = 0, x IN raw | s + CASE WHEN x.cat = 'vaccine' THEN x.cnt ELSE 0 END), 0)
} AS result;


// --- analytics.adoptionTrend ---
// Recommendation adoption summary.
// Params: none
// Returns: [{month, adopted, issued}]
MATCH (r:Recommendation)
WITH count(r) AS total
OPTIONAL MATCH (a:AdoptionRecord)
WITH total, count(a) AS adopted
RETURN {
  month: 'Total',
  adopted: adopted,
  issued: total
} AS result;


// --- analytics.extensionAgent ---
// Returns the current extension agent info.
// Params: none
// Returns: {id, name, email, phone, organization, counties[]}
MATCH (a:ExtensionAgent)
WITH a, count { (a)-[:MANAGES]->() } AS farmerCount
RETURN {
  id: a.agentId,
  name: a.fullName,
  email: a.email,
  phone: a.phone,
  organization: a.organization,
  counties: CASE WHEN a.county IS NOT NULL THEN [a.county] ELSE [] END
} AS result
ORDER BY farmerCount DESC
LIMIT 1;


// =====================================================================
// AGENT QUERIES
// =====================================================================

// --- prioritization.allFarmers ---
// Returns all farmers with full context for priority scoring.
// Params: none
// Returns: [{farmerId, fullName, county, issues[], followups[], diseases[],
//            production[], climateEvent, lastVisit, avgMilkLitres}]
MATCH (f:Farmer)
OPTIONAL MATCH (f)-[e:EXPERIENCING]->(i:Issue)
OPTIONAL MATCH (f)-[:HAS_FOLLOWUP]->(fu:FollowUp)
OPTIONAL MATCH (f)-[rsk:AT_RISK_OF]->(d:Disease)
OPTIONAL MATCH (f)-[:LOCATED_IN]->(c:County)
OPTIONAL MATCH (c)-[:AFFECTED_BY]->(cl:ClimateEvent)
OPTIONAL MATCH (f)-[:HAS_PRODUCTION]->(pm:ProductionMetric)
WITH f, i, e, fu, d, rsk, cl, pm
ORDER BY pm.dateRecorded ASC
WITH f,
  collect(DISTINCT CASE WHEN i IS NOT NULL THEN {
    id: i.issueId, title: i.name, description: i.description,
    category: i.category, severity: e.severity, status: e.status
  } END) AS rawIssues,
  collect(DISTINCT CASE WHEN fu IS NOT NULL THEN {
    id: fu.followUpId, purpose: fu.purpose, dueDate: toString(fu.dueDate), status: fu.status
  } END) AS rawFollowups,
  collect(DISTINCT CASE WHEN d IS NOT NULL THEN {
    id: d.diseaseId, name: d.name, riskLevel: rsk.level, riskScore: rsk.score
  } END) AS rawDiseases,
  collect(DISTINCT {date: toString(pm.dateRecorded), litres: pm.milkLitresPerDay}) AS production,
  cl.type AS climateEvent
RETURN {
  farmerId: f.farmerId,
  fullName: f.fullName,
  county: f.county,
  farmSizeAcres: f.farmSizeAcres,
  dairyExperienceYears: f.dairyExperienceYears,
  avgMilkLitres: f.avgMilkLitres,
  issues: [x IN rawIssues WHERE x IS NOT NULL],
  followups: [x IN rawFollowups WHERE x IS NOT NULL],
  diseases: [x IN rawDiseases WHERE x IS NOT NULL],
  production: production,
  climateEvent: climateEvent,
  lastVisit: toString(f.lastVisit),
  joinedAt: f.joinedAt
} AS result
ORDER BY f.priorityScore DESC;


// --- recommendations.forFarmer ---
// Matches a farmer's issues to recommendations via SUGGESTS.
// Params: {farmerId: string}
// Returns: [{recommendation, matchedIssues[], requiredInputs[]}]
MATCH (f:Farmer {farmerId: $farmerId})
MATCH (f)-[e:EXPERIENCING]->(i:Issue)
MATCH (i)-[:SUGGESTS]->(r:Recommendation)
OPTIONAL MATCH (r)-[:REQUIRES]->(inp:Input)
WITH r, i, e, inp
ORDER BY r.priority DESC
WITH r,
  collect(DISTINCT {id: i.issueId, name: i.name, severity: e.severity, category: i.category}) AS matchedIssues,
  collect(DISTINCT {id: inp.inputId, name: inp.name, category: inp.category, estimatedCostKes: inp.estimatedCostKes}) AS requiredInputs
RETURN {
  recommendation: {
    id: r.recommendationId,
    title: r.title,
    reasoning: r.reasoning,
    priority: r.priority,
    status: r.status,
    expectedOutcome: r.expectedOutcome,
    issuedAt: r.issuedAt
  },
  matchedIssues: matchedIssues,
  requiredInputs: requiredInputs
} AS result;
