// =====================================================================
// CowSense AI — Neo4j Seed Database
// =====================================================================
// Run: cat seed.cypher | cypher-shell -u neo4j -p changeme
// =====================================================================

// =====================================================================
// 1. CONSTRAINTS
// =====================================================================
CREATE CONSTRAINT farmer_id IF NOT EXISTS FOR (f:Farmer) REQUIRE f.farmerId IS UNIQUE;
CREATE CONSTRAINT agent_id IF NOT EXISTS FOR (a:ExtensionAgent) REQUIRE a.agentId IS UNIQUE;
CREATE CONSTRAINT county_id IF NOT EXISTS FOR (c:County) REQUIRE c.countyId IS UNIQUE;
CREATE CONSTRAINT herd_id IF NOT EXISTS FOR (h:Herd) REQUIRE h.herdId IS UNIQUE;
CREATE CONSTRAINT cow_id IF NOT EXISTS FOR (c:Cow) REQUIRE c.cowId IS UNIQUE;
CREATE CONSTRAINT issue_id IF NOT EXISTS FOR (i:Issue) REQUIRE i.issueId IS UNIQUE;
CREATE CONSTRAINT disease_id IF NOT EXISTS FOR (d:Disease) REQUIRE d.diseaseId IS UNIQUE;
CREATE CONSTRAINT recommendation_id IF NOT EXISTS FOR (r:Recommendation) REQUIRE r.recommendationId IS UNIQUE;
CREATE CONSTRAINT input_id IF NOT EXISTS FOR (i:Input) REQUIRE i.inputId IS UNIQUE;
CREATE CONSTRAINT followup_id IF NOT EXISTS FOR (f:FollowUp) REQUIRE f.followUpId IS UNIQUE;
CREATE CONSTRAINT adoption_id IF NOT EXISTS FOR (a:AdoptionRecord) REQUIRE a.adoptionId IS UNIQUE;
CREATE CONSTRAINT visit_id IF NOT EXISTS FOR (v:Visit) REQUIRE v.visitId IS UNIQUE;
CREATE CONSTRAINT metric_id IF NOT EXISTS FOR (m:ProductionMetric) REQUIRE m.metricId IS UNIQUE;
CREATE CONSTRAINT climate_id IF NOT EXISTS FOR (c:ClimateEvent) REQUIRE c.climateId IS UNIQUE;

// =====================================================================
// 2. INDEXES
// =====================================================================
CREATE INDEX farmer_name IF NOT EXISTS FOR (f:Farmer) ON (f.fullName);
CREATE INDEX county_name IF NOT EXISTS FOR (c:County) ON (c.name);
CREATE INDEX issue_name IF NOT EXISTS FOR (i:Issue) ON (i.name);
CREATE INDEX disease_name IF NOT EXISTS FOR (d:Disease) ON (d.name);
CREATE INDEX recommendation_priority IF NOT EXISTS FOR (r:Recommendation) ON (r.priority);
CREATE INDEX farmer_priority IF NOT EXISTS FOR (f:Farmer) ON (f.priority);
CREATE INDEX farmer_county IF NOT EXISTS FOR (f:Farmer) ON (f.county);

// =====================================================================
// 3. COUNTIES
// =====================================================================
MERGE (:County {countyId: 'C001', name: 'Nakuru'});
MERGE (:County {countyId: 'C002', name: 'Kiambu'});
MERGE (:County {countyId: 'C003', name: 'Nyandarua'});
MERGE (:County {countyId: 'C004', name: 'Trans Nzoia'});
MERGE (:County {countyId: 'C005', name: 'Mombasa'});

// =====================================================================
// 4. ISSUES
// =====================================================================
MERGE (:Issue {issueId: 'i-1', name: 'Declining Milk Production', description: 'Milk yield decreasing over consecutive observations', category: 'production'});
MERGE (:Issue {issueId: 'i-2', name: 'Low Feed Reserves', description: 'Insufficient feed stock to sustain herd', category: 'feed'});
MERGE (:Issue {issueId: 'i-3', name: 'Vaccination Overdue', description: 'Scheduled vaccination not administered', category: 'health'});
MERGE (:Issue {issueId: 'i-4', name: 'Drought Risk', description: 'Prolonged dry spell affecting farm operations', category: 'water'});
MERGE (:Issue {issueId: 'i-5', name: 'Heat Stress', description: 'High temperatures affecting livestock', category: 'health'});
MERGE (:Issue {issueId: 'i-6', name: 'Water Shortage', description: 'Insufficient water access for herd', category: 'water'});
MERGE (:Issue {issueId: 'i-7', name: 'Low Feed Quality', description: 'Available feed lacks nutritional value', category: 'feed'});
MERGE (:Issue {issueId: 'i-8', name: 'Poor Record Keeping', description: 'Inadequate farm records and data tracking', category: 'market'});
MERGE (:Issue {issueId: 'i-9', name: 'High Disease Incidence', description: 'Recurring disease cases in herd', category: 'health'});
MERGE (:Issue {issueId: 'i-10', name: 'Breeding Delay', description: 'Extended interval between breeding cycles', category: 'breeding'});

// =====================================================================
// 5. DISEASES
// =====================================================================
MERGE (:Disease {diseaseId: 'd-1', name: 'Mastitis'});
MERGE (:Disease {diseaseId: 'd-2', name: 'East Coast Fever'});
MERGE (:Disease {diseaseId: 'd-3', name: 'Foot and Mouth Disease'});
MERGE (:Disease {diseaseId: 'd-4', name: 'Brucellosis'});
MERGE (:Disease {diseaseId: 'd-5', name: 'Lumpy Skin Disease'});
MERGE (:Disease {diseaseId: 'd-6', name: 'Anaplasmosis'});

// =====================================================================
// 6. INPUTS
// =====================================================================
MERGE (:Input {inputId: 'inp-1', name: 'Silage Bags (50kg)', category: 'feed', unit: 'bag', estimatedCostKes: 850});
MERGE (:Input {inputId: 'inp-2', name: 'Napier Cuttings', category: 'seed', unit: 'bundle', estimatedCostKes: 300});
MERGE (:Input {inputId: 'inp-3', name: 'FMD Vaccine', category: 'vaccine', unit: 'dose', estimatedCostKes: 250});
MERGE (:Input {inputId: 'inp-4', name: 'Dairy Meal (70kg)', category: 'feed', unit: 'bag', estimatedCostKes: 3200});
MERGE (:Input {inputId: 'inp-5', name: 'Mineral Supplement', category: 'supplement', unit: 'kg', estimatedCostKes: 450});
MERGE (:Input {inputId: 'inp-6', name: 'Deworming Bolus', category: 'vaccine', unit: 'dose', estimatedCostKes: 180});

// =====================================================================
// 7. RECOMMENDATIONS
// =====================================================================
CREATE (rec1:Recommendation {
  recommendationId: 'rec-1',
  title: 'Introduce Silage Conservation',
  reasoning: 'Detected declining milk yield across 3 visits combined with reported low feed reserves heading into the dry season. Silage will buffer feed availability for the next 4 months.',
  priority: 'high',
  status: 'issued',
  expectedOutcome: 'Stabilize milk yield at 12-15L/day per cow through the dry season',
  farmerCount: 3,
  issuedAt: '2026-06-18'
});

CREATE (rec2:Recommendation {
  recommendationId: 'rec-2',
  title: 'Supplement Dairy Feed with Concentrate',
  reasoning: 'Average production dropped 22% in the last 30 days. Body condition score on visit notes suggests energy deficit, not disease.',
  priority: 'high',
  status: 'pending',
  expectedOutcome: '+3-5L/day per lactating cow within 14 days',
  farmerCount: 2,
  issuedAt: '2026-06-22'
});

CREATE (rec3:Recommendation {
  recommendationId: 'rec-3',
  title: 'Improve Water Access Points',
  reasoning: 'Farmers report walking >2km for watering. Hydration deficit correlates with the production drop.',
  priority: 'medium',
  status: 'adopted',
  expectedOutcome: 'Reduce walking distance and improve daily water intake',
  farmerCount: 1,
  issuedAt: '2026-06-10'
});

CREATE (rec4:Recommendation {
  recommendationId: 'rec-4',
  title: 'FMD Vaccination Drive',
  reasoning: 'Vaccination overdue >90 days for cows across the cluster. Outbreak risk elevated.',
  priority: 'critical',
  status: 'issued',
  expectedOutcome: 'Herd-level immunity restored before rainy season',
  farmerCount: 1,
  issuedAt: '2026-06-24'
});

// =====================================================================
// 8. CLIMATE EVENTS
// =====================================================================
CREATE (cl:ClimateEvent {
  climateId: 'CL001',
  type: 'Dry Season',
  severity: 'High',
  startDate: date('2026-07-01'),
  endDate: date('2026-09-30')
});

// =====================================================================
// 9. EXTENSION AGENTS (passwordHash for demo: "cowsense123")
// =====================================================================
CREATE (agent1:ExtensionAgent {
  agentId: 'EA001',
  fullName: 'Brian Otieno',
  email: 'brian.otieno@digicow.co.ke',
  phone: '+254 712 345 678',
  organization: 'DigiCow',
  county: 'Nakuru',
  passwordHash: '$2b$12$/DhwVIKNj4uEb/fTsYasVu4k6YqmWvuIHLh.01I64hnI8dMmCaDOu'
});

CREATE (agent2:ExtensionAgent {
  agentId: 'EA002',
  fullName: 'Mary Njeri',
  phone: '0700000001',
  email: 'mary.njeri@digicow.co.ke',
  organization: 'DigiCow',
  county: 'Kiambu',
  passwordHash: '$2b$12$/DhwVIKNj4uEb/fTsYasVu4k6YqmWvuIHLh.01I64hnI8dMmCaDOu'
});

// =====================================================================
// 10. FARMERS
// =====================================================================
CREATE (f1:Farmer {
  farmerId: 'f-1',
  fullName: 'Wanjiku Mwangi',
  phone: '+254 720 112 233',
  county: 'Kiambu',
  subCounty: 'Limuru',
  ward: 'Limuru Central',
  age: 42,
  gender: 'Female',
  farmSizeAcres: 3.5,
  dairyExperienceYears: 12,
  priority: 'critical',
  priorityScore: 92,
  adoptionScore: 78,
  avgMilkLitres: 10.2,
  lastVisit: date('2026-06-21'),
  joinedAt: '2023-02-14'
});

CREATE (f2:Farmer {
  farmerId: 'f-2',
  fullName: 'Peter Kamau',
  phone: '+254 711 998 877',
  county: 'Nakuru',
  subCounty: 'Rongai',
  ward: 'Rongai',
  age: 51,
  gender: 'Male',
  farmSizeAcres: 5,
  dairyExperienceYears: 18,
  priority: 'high',
  priorityScore: 81,
  adoptionScore: 65,
  avgMilkLitres: 13.4,
  lastVisit: date('2026-06-15'),
  joinedAt: '2022-08-03'
});

CREATE (f3:Farmer {
  farmerId: 'f-3',
  fullName: 'Akinyi Otieno',
  phone: '+254 733 445 566',
  county: 'Mombasa',
  subCounty: 'Kisauni',
  ward: 'Bamburi',
  age: 34,
  gender: 'Female',
  farmSizeAcres: 2,
  dairyExperienceYears: 6,
  priority: 'high',
  priorityScore: 76,
  adoptionScore: 82,
  avgMilkLitres: 7.8,
  lastVisit: date('2026-06-23'),
  joinedAt: '2024-01-22'
});

CREATE (f4:Farmer {
  farmerId: 'f-4',
  fullName: 'Mary Njeri',
  phone: '+254 722 334 455',
  county: 'Nyandarua',
  subCounty: 'Ol Kalou',
  ward: 'Ol Kalou',
  age: 38,
  gender: 'Female',
  farmSizeAcres: 4,
  dairyExperienceYears: 9,
  priority: 'medium',
  priorityScore: 58,
  adoptionScore: 71,
  avgMilkLitres: 9.7,
  lastVisit: date('2026-06-18'),
  joinedAt: '2023-11-08'
});

CREATE (f5:Farmer {
  farmerId: 'f-5',
  fullName: 'David Kiptoo',
  phone: '+254 700 223 344',
  county: 'Trans Nzoia',
  subCounty: 'Kitale',
  ward: 'Kitale Town',
  age: 55,
  gender: 'Male',
  farmSizeAcres: 8,
  dairyExperienceYears: 22,
  priority: 'low',
  priorityScore: 32,
  adoptionScore: 94,
  avgMilkLitres: 15.6,
  lastVisit: date('2026-06-24'),
  joinedAt: '2021-05-19'
});

CREATE (f6:Farmer {
  farmerId: 'f-6',
  fullName: 'Grace Wambui',
  phone: '+254 715 667 788',
  county: 'Kiambu',
  subCounty: 'Githunguri',
  ward: 'Githunguri',
  age: 29,
  gender: 'Female',
  farmSizeAcres: 2.5,
  dairyExperienceYears: 4,
  priority: 'medium',
  priorityScore: 54,
  adoptionScore: 60,
  avgMilkLitres: 8.9,
  lastVisit: date('2026-06-19'),
  joinedAt: '2024-03-12'
});

// =====================================================================
// 11. HERDS
// =====================================================================
CREATE (h1:Herd {herdId: 'h-1', totalCows: 8, lactating: 5, dry: 2, calves: 1});
CREATE (h2:Herd {herdId: 'h-2', totalCows: 12, lactating: 7, dry: 3, calves: 2});
CREATE (h3:Herd {herdId: 'h-3', totalCows: 4, lactating: 3, dry: 1, calves: 0});
CREATE (h4:Herd {herdId: 'h-4', totalCows: 6, lactating: 4, dry: 1, calves: 1});
CREATE (h5:Herd {herdId: 'h-5', totalCows: 18, lactating: 12, dry: 4, calves: 2});
CREATE (h6:Herd {herdId: 'h-6', totalCows: 5, lactating: 3, dry: 1, calves: 1});

// =====================================================================
// 12. COWS
// =====================================================================
// Wanjiku's herd (h-1)
CREATE (c1:Cow {cowId: 'c-1', tag: 'WM-01', breed: 'Friesian', ageYears: 5, lactating: true, dailyMilkLitres: 11, vaccinated: true});
CREATE (c2:Cow {cowId: 'c-2', tag: 'WM-02', breed: 'Ayrshire', ageYears: 4, lactating: true, dailyMilkLitres: 9.5, vaccinated: true});
CREATE (c3:Cow {cowId: 'c-3', tag: 'WM-03', breed: 'Friesian', ageYears: 3, lactating: true, dailyMilkLitres: 10.2, vaccinated: true});
CREATE (c4:Cow {cowId: 'c-4', tag: 'WM-04', breed: 'Guernsey', ageYears: 6, lactating: false, dailyMilkLitres: 0, vaccinated: false});

// Peter's herd (h-2)
CREATE (c5:Cow {cowId: 'c-5', tag: 'PK-01', breed: 'Friesian', ageYears: 6, lactating: true, dailyMilkLitres: 14, vaccinated: true});
CREATE (c6:Cow {cowId: 'c-6', tag: 'PK-02', breed: 'Ayrshire', ageYears: 4, lactating: true, dailyMilkLitres: 13, vaccinated: true});
CREATE (c7:Cow {cowId: 'c-7', tag: 'PK-03', breed: 'Friesian', ageYears: 3, lactating: true, dailyMilkLitres: 15, vaccinated: false});
CREATE (c8:Cow {cowId: 'c-8', tag: 'PK-04', breed: 'Jersey', ageYears: 5, lactating: true, dailyMilkLitres: 11.5, vaccinated: true});

// Akinyi's herd (h-3)
CREATE (c9:Cow {cowId: 'c-9', tag: 'AO-01', breed: 'Ayrshire', ageYears: 4, lactating: true, dailyMilkLitres: 8, vaccinated: true});
CREATE (c10:Cow {cowId: 'c-10', tag: 'AO-02', breed: 'Friesian', ageYears: 3, lactating: true, dailyMilkLitres: 9, vaccinated: true});

// Mary's herd (h-4)
CREATE (c11:Cow {cowId: 'c-11', tag: 'MN-01', breed: 'Friesian', ageYears: 5, lactating: true, dailyMilkLitres: 10, vaccinated: true});
CREATE (c12:Cow {cowId: 'c-12', tag: 'MN-02', breed: 'Ayrshire', ageYears: 3, lactating: true, dailyMilkLitres: 9.5, vaccinated: true});

// David's herd (h-5)
CREATE (c13:Cow {cowId: 'c-13', tag: 'DK-01', breed: 'Friesian', ageYears: 7, lactating: true, dailyMilkLitres: 16, vaccinated: true});
CREATE (c14:Cow {cowId: 'c-14', tag: 'DK-02', breed: 'Jersey', ageYears: 4, lactating: true, dailyMilkLitres: 14.5, vaccinated: true});
CREATE (c15:Cow {cowId: 'c-15', tag: 'DK-03', breed: 'Ayrshire', ageYears: 5, lactating: true, dailyMilkLitres: 15.5, vaccinated: true});

// Grace's herd (h-6)
CREATE (c16:Cow {cowId: 'c-16', tag: 'GW-01', breed: 'Friesian', ageYears: 4, lactating: true, dailyMilkLitres: 9, vaccinated: true});
CREATE (c17:Cow {cowId: 'c-17', tag: 'GW-02', breed: 'Ayrshire', ageYears: 2, lactating: true, dailyMilkLitres: 8.5, vaccinated: true});

// =====================================================================
// 13. PRODUCTION METRICS (7 days per farmer)
// =====================================================================
WITH [
  {farmerId: 'f-1', base: 10.2},
  {farmerId: 'f-2', base: 13.4},
  {farmerId: 'f-3', base: 7.8},
  {farmerId: 'f-4', base: 9.7},
  {farmerId: 'f-5', base: 15.6},
  {farmerId: 'f-6', base: 8.9}
] AS farmerBases
UNWIND farmerBases AS fm
MATCH (f:Farmer {farmerId: fm.farmerId})
WITH f, fm.base AS base
UNWIND range(0, 6) AS dayOffset
CREATE (pm:ProductionMetric {
  metricId: f.farmerId + '-pm-' + toString(dayOffset),
  milkLitresPerDay: round((base + sin(dayOffset * 0.7) * 1.5 - dayOffset * 0.2) * 10) / 10,
  dateRecorded: date('2026-06-27') - duration({days: 6 - dayOffset})
})
CREATE (f)-[:HAS_PRODUCTION]->(pm);

// =====================================================================
// 14. FOLLOW-UPS
// =====================================================================
CREATE (fu1:FollowUp {
  followUpId: 'fu-1',
  purpose: 'Confirm FMD vaccination scheduled',
  dueDate: date('2026-06-27'),
  status: 'overdue'
});

CREATE (fu2:FollowUp {
  followUpId: 'fu-2',
  purpose: 'Verify dairy meal supplementation',
  dueDate: date('2026-06-28'),
  status: 'scheduled'
});

CREATE (fu3:FollowUp {
  followUpId: 'fu-3',
  purpose: 'Breeding consult',
  dueDate: date('2026-06-29'),
  status: 'scheduled'
});

CREATE (fu4:FollowUp {
  followUpId: 'fu-4',
  purpose: 'Water access check-in',
  dueDate: date('2026-06-30'),
  status: 'scheduled'
});

CREATE (fu5:FollowUp {
  followUpId: 'fu-5',
  purpose: 'Silage adoption review',
  dueDate: date('2026-06-25'),
  status: 'overdue'
});

CREATE (fu6:FollowUp {
  followUpId: 'fu-6',
  purpose: 'Routine herd review',
  dueDate: date('2026-06-20'),
  status: 'completed'
});

// =====================================================================
// 15. VISITS
// =====================================================================
CREATE (v1:Visit {
  visitId: 'v-1',
  scheduledFor: date('2026-06-21'),
  status: 'completed',
  notes: 'Body condition declining. Feed stock low.'
});

CREATE (v2:Visit {
  visitId: 'v-2',
  scheduledFor: date('2026-06-29'),
  status: 'scheduled',
  notes: ''
});

CREATE (v3:Visit {
  visitId: 'v-3',
  scheduledFor: date('2026-06-23'),
  status: 'completed',
  notes: 'Water source 2.3km away.'
});

CREATE (v4:Visit {
  visitId: 'v-4',
  scheduledFor: date('2026-07-02'),
  status: 'scheduled',
  notes: ''
});

// =====================================================================
// 16. ADOPTION RECORDS
// =====================================================================
CREATE (ad1:AdoptionRecord {
  adoptionId: 'ad-1',
  adoptedAt: date('2026-06-14'),
  outcome: 'Partial',
  notes: 'Installed 200L water tank but still relies on river'
});

CREATE (ad2:AdoptionRecord {
  adoptionId: 'ad-2',
  adoptedAt: date('2026-06-22'),
  outcome: 'Successful',
  notes: 'Completed silage pit construction, 3 tonnes ensiled'
});

// =====================================================================
// 17. RELATIONSHIPS — Extension Agent → Farmer
// =====================================================================
MATCH (a:ExtensionAgent {agentId: 'EA001'}), (f:Farmer {farmerId: 'f-1'}) MERGE (a)-[:MANAGES]->(f);
MATCH (a:ExtensionAgent {agentId: 'EA001'}), (f:Farmer {farmerId: 'f-2'}) MERGE (a)-[:MANAGES]->(f);
MATCH (a:ExtensionAgent {agentId: 'EA001'}), (f:Farmer {farmerId: 'f-3'}) MERGE (a)-[:MANAGES]->(f);
MATCH (a:ExtensionAgent {agentId: 'EA002'}), (f:Farmer {farmerId: 'f-4'}) MERGE (a)-[:MANAGES]->(f);
MATCH (a:ExtensionAgent {agentId: 'EA002'}), (f:Farmer {farmerId: 'f-5'}) MERGE (a)-[:MANAGES]->(f);
MATCH (a:ExtensionAgent {agentId: 'EA002'}), (f:Farmer {farmerId: 'f-6'}) MERGE (a)-[:MANAGES]->(f);

// =====================================================================
// 18. RELATIONSHIPS — Farmer → County
// =====================================================================
MATCH (f:Farmer {farmerId: 'f-1'}), (c:County {name: 'Kiambu'}) MERGE (f)-[:LOCATED_IN]->(c);
MATCH (f:Farmer {farmerId: 'f-2'}), (c:County {name: 'Nakuru'}) MERGE (f)-[:LOCATED_IN]->(c);
MATCH (f:Farmer {farmerId: 'f-3'}), (c:County {name: 'Mombasa'}) MERGE (f)-[:LOCATED_IN]->(c);
MATCH (f:Farmer {farmerId: 'f-4'}), (c:County {name: 'Nyandarua'}) MERGE (f)-[:LOCATED_IN]->(c);
MATCH (f:Farmer {farmerId: 'f-5'}), (c:County {name: 'Trans Nzoia'}) MERGE (f)-[:LOCATED_IN]->(c);
MATCH (f:Farmer {farmerId: 'f-6'}), (c:County {name: 'Kiambu'}) MERGE (f)-[:LOCATED_IN]->(c);

// =====================================================================
// 19. RELATIONSHIPS — Farmer → Herd
// =====================================================================
MATCH (f:Farmer {farmerId: 'f-1'}), (h:Herd {herdId: 'h-1'}) MERGE (f)-[:OWNS]->(h);
MATCH (f:Farmer {farmerId: 'f-2'}), (h:Herd {herdId: 'h-2'}) MERGE (f)-[:OWNS]->(h);
MATCH (f:Farmer {farmerId: 'f-3'}), (h:Herd {herdId: 'h-3'}) MERGE (f)-[:OWNS]->(h);
MATCH (f:Farmer {farmerId: 'f-4'}), (h:Herd {herdId: 'h-4'}) MERGE (f)-[:OWNS]->(h);
MATCH (f:Farmer {farmerId: 'f-5'}), (h:Herd {herdId: 'h-5'}) MERGE (f)-[:OWNS]->(h);
MATCH (f:Farmer {farmerId: 'f-6'}), (h:Herd {herdId: 'h-6'}) MERGE (f)-[:OWNS]->(h);

// =====================================================================
// 20. RELATIONSHIPS — Herd → Cow
// =====================================================================
MATCH (h:Herd {herdId: 'h-1'}), (c:Cow {cowId: 'c-1'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-1'}), (c:Cow {cowId: 'c-2'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-1'}), (c:Cow {cowId: 'c-3'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-1'}), (c:Cow {cowId: 'c-4'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-2'}), (c:Cow {cowId: 'c-5'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-2'}), (c:Cow {cowId: 'c-6'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-2'}), (c:Cow {cowId: 'c-7'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-2'}), (c:Cow {cowId: 'c-8'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-3'}), (c:Cow {cowId: 'c-9'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-3'}), (c:Cow {cowId: 'c-10'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-4'}), (c:Cow {cowId: 'c-11'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-4'}), (c:Cow {cowId: 'c-12'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-5'}), (c:Cow {cowId: 'c-13'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-5'}), (c:Cow {cowId: 'c-14'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-5'}), (c:Cow {cowId: 'c-15'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-6'}), (c:Cow {cowId: 'c-16'}) MERGE (h)-[:CONTAINS]->(c);
MATCH (h:Herd {herdId: 'h-6'}), (c:Cow {cowId: 'c-17'}) MERGE (h)-[:CONTAINS]->(c);

// =====================================================================
// 21. RELATIONSHIPS — Farmer → Issues (with per-farmer context on rel)
// =====================================================================
// Wanjiku: Declining Milk Production + Low Feed Reserves
MATCH (f:Farmer {farmerId: 'f-1'}), (i:Issue {issueId: 'i-1'})
MERGE (f)-[:EXPERIENCING {severity: 'high', status: 'open', detectedAt: date('2026-06-22')}]->(i);
MATCH (f:Farmer {farmerId: 'f-1'}), (i:Issue {issueId: 'i-2'})
MERGE (f)-[:EXPERIENCING {severity: 'critical', status: 'open', detectedAt: date('2026-06-24')}]->(i);

// Peter: Vaccination Overdue
MATCH (f:Farmer {farmerId: 'f-2'}), (i:Issue {issueId: 'i-3'})
MERGE (f)-[:EXPERIENCING {severity: 'critical', status: 'open', detectedAt: date('2026-06-17')}]->(i);

// Akinyi: Drought Risk
MATCH (f:Farmer {farmerId: 'f-3'}), (i:Issue {issueId: 'i-4'})
MERGE (f)-[:EXPERIENCING {severity: 'high', status: 'open', detectedAt: date('2026-06-25')}]->(i);

// Mary: Low Feed Reserves (Napier shortage)
MATCH (f:Farmer {farmerId: 'f-4'}), (i:Issue {issueId: 'i-2'})
MERGE (f)-[:EXPERIENCING {severity: 'medium', status: 'in_progress', detectedAt: date('2026-06-20')}]->(i);

// Grace: Breeding Delay
MATCH (f:Farmer {farmerId: 'f-6'}), (i:Issue {issueId: 'i-10'})
MERGE (f)-[:EXPERIENCING {severity: 'medium', status: 'open', detectedAt: date('2026-06-23')}]->(i);

// =====================================================================
// 22. RELATIONSHIPS — Farmer → Disease (AT_RISK_OF)
// =====================================================================
MATCH (f:Farmer {farmerId: 'f-1'}), (d:Disease {name: 'Mastitis'})
MERGE (f)-[:AT_RISK_OF {level: 'High', score: 72, detectedAt: date('2026-06-20')}]->(d);
MATCH (f:Farmer {farmerId: 'f-2'}), (d:Disease {name: 'Foot and Mouth Disease'})
MERGE (f)-[:AT_RISK_OF {level: 'Critical', score: 88, detectedAt: date('2026-06-15')}]->(d);
MATCH (f:Farmer {farmerId: 'f-3'}), (d:Disease {name: 'East Coast Fever'})
MERGE (f)-[:AT_RISK_OF {level: 'Medium', score: 45, detectedAt: date('2026-06-22')}]->(d);

// =====================================================================
// 23. RELATIONSHIPS — Farmer → Recommendations
// =====================================================================
MATCH (f:Farmer {farmerId: 'f-1'}), (r:Recommendation {recommendationId: 'rec-1'}) MERGE (f)-[:HAS_RECOMMENDATION]->(r);
MATCH (f:Farmer {farmerId: 'f-1'}), (r:Recommendation {recommendationId: 'rec-2'}) MERGE (f)-[:HAS_RECOMMENDATION]->(r);
MATCH (f:Farmer {farmerId: 'f-2'}), (r:Recommendation {recommendationId: 'rec-4'}) MERGE (f)-[:HAS_RECOMMENDATION]->(r);
MATCH (f:Farmer {farmerId: 'f-3'}), (r:Recommendation {recommendationId: 'rec-3'}) MERGE (f)-[:HAS_RECOMMENDATION]->(r);
MATCH (f:Farmer {farmerId: 'f-4'}), (r:Recommendation {recommendationId: 'rec-1'}) MERGE (f)-[:HAS_RECOMMENDATION]->(r);

// =====================================================================
// 24. RELATIONSHIPS — Issue → Recommendation (SUGGESTS)
// =====================================================================
MATCH (i:Issue {issueId: 'i-2'}), (r:Recommendation {recommendationId: 'rec-1'}) MERGE (i)-[:SUGGESTS]->(r);
MATCH (i:Issue {issueId: 'i-1'}), (r:Recommendation {recommendationId: 'rec-2'}) MERGE (i)-[:SUGGESTS]->(r);
MATCH (i:Issue {issueId: 'i-4'}), (r:Recommendation {recommendationId: 'rec-3'}) MERGE (i)-[:SUGGESTS]->(r);
MATCH (i:Issue {issueId: 'i-3'}), (r:Recommendation {recommendationId: 'rec-4'}) MERGE (i)-[:SUGGESTS]->(r);

// =====================================================================
// 25. RELATIONSHIPS — Recommendation → Input
// =====================================================================
MATCH (r:Recommendation {recommendationId: 'rec-1'}), (i:Input {inputId: 'inp-1'}) MERGE (r)-[:REQUIRES]->(i);
MATCH (r:Recommendation {recommendationId: 'rec-1'}), (i:Input {inputId: 'inp-2'}) MERGE (r)-[:REQUIRES]->(i);
MATCH (r:Recommendation {recommendationId: 'rec-2'}), (i:Input {inputId: 'inp-4'}) MERGE (r)-[:REQUIRES]->(i);
MATCH (r:Recommendation {recommendationId: 'rec-2'}), (i:Input {inputId: 'inp-5'}) MERGE (r)-[:REQUIRES]->(i);
MATCH (r:Recommendation {recommendationId: 'rec-4'}), (i:Input {inputId: 'inp-3'}) MERGE (r)-[:REQUIRES]->(i);

// =====================================================================
// 26. RELATIONSHIPS — Farmer → FollowUp
// =====================================================================
MATCH (f:Farmer {farmerId: 'f-2'}), (fu:FollowUp {followUpId: 'fu-1'}) MERGE (f)-[:HAS_FOLLOWUP]->(fu);
MATCH (f:Farmer {farmerId: 'f-1'}), (fu:FollowUp {followUpId: 'fu-2'}) MERGE (f)-[:HAS_FOLLOWUP]->(fu);
MATCH (f:Farmer {farmerId: 'f-6'}), (fu:FollowUp {followUpId: 'fu-3'}) MERGE (f)-[:HAS_FOLLOWUP]->(fu);
MATCH (f:Farmer {farmerId: 'f-3'}), (fu:FollowUp {followUpId: 'fu-4'}) MERGE (f)-[:HAS_FOLLOWUP]->(fu);
MATCH (f:Farmer {farmerId: 'f-4'}), (fu:FollowUp {followUpId: 'fu-5'}) MERGE (f)-[:HAS_FOLLOWUP]->(fu);
MATCH (f:Farmer {farmerId: 'f-5'}), (fu:FollowUp {followUpId: 'fu-6'}) MERGE (f)-[:HAS_FOLLOWUP]->(fu);

// =====================================================================
// 27. RELATIONSHIPS — Recommendation → FollowUp
// =====================================================================
MATCH (r:Recommendation {recommendationId: 'rec-4'}), (fu:FollowUp {followUpId: 'fu-1'}) MERGE (r)-[:TRACKED_BY]->(fu);
MATCH (r:Recommendation {recommendationId: 'rec-2'}), (fu:FollowUp {followUpId: 'fu-2'}) MERGE (r)-[:TRACKED_BY]->(fu);
MATCH (r:Recommendation {recommendationId: 'rec-3'}), (fu:FollowUp {followUpId: 'fu-4'}) MERGE (r)-[:TRACKED_BY]->(fu);
MATCH (r:Recommendation {recommendationId: 'rec-1'}), (fu:FollowUp {followUpId: 'fu-5'}) MERGE (r)-[:TRACKED_BY]->(fu);

// =====================================================================
// 28. RELATIONSHIPS — Farmer → Visit
// =====================================================================
MATCH (f:Farmer {farmerId: 'f-1'}), (v:Visit {visitId: 'v-1'}) MERGE (f)-[:HAS_VISIT]->(v);
MATCH (f:Farmer {farmerId: 'f-2'}), (v:Visit {visitId: 'v-2'}) MERGE (f)-[:HAS_VISIT]->(v);
MATCH (f:Farmer {farmerId: 'f-3'}), (v:Visit {visitId: 'v-3'}) MERGE (f)-[:HAS_VISIT]->(v);
MATCH (f:Farmer {farmerId: 'f-4'}), (v:Visit {visitId: 'v-4'}) MERGE (f)-[:HAS_VISIT]->(v);

// =====================================================================
// 29. RELATIONSHIPS — Visit → Issues observed & Recommendations issued
// =====================================================================
MATCH (v:Visit {visitId: 'v-1'}), (i:Issue {issueId: 'i-1'}) MERGE (v)-[:OBSERVED]->(i);
MATCH (v:Visit {visitId: 'v-1'}), (i:Issue {issueId: 'i-2'}) MERGE (v)-[:OBSERVED]->(i);
MATCH (v:Visit {visitId: 'v-1'}), (r:Recommendation {recommendationId: 'rec-1'}) MERGE (v)-[:ISSUED]->(r);
MATCH (v:Visit {visitId: 'v-3'}), (i:Issue {issueId: 'i-4'}) MERGE (v)-[:OBSERVED]->(i);
MATCH (v:Visit {visitId: 'v-3'}), (r:Recommendation {recommendationId: 'rec-3'}) MERGE (v)-[:ISSUED]->(r);

// =====================================================================
// 30. RELATIONSHIPS — County → ClimateEvent
// =====================================================================
MATCH (c:County {name: 'Nakuru'}), (cl:ClimateEvent {climateId: 'CL001'}) MERGE (c)-[:AFFECTED_BY]->(cl);

// =====================================================================
// 31. RELATIONSHIPS — Farmer → AdoptionRecord → Recommendation
// =====================================================================
MATCH (f:Farmer {farmerId: 'f-3'}), (ad:AdoptionRecord {adoptionId: 'ad-1'}) MERGE (f)-[:ADOPTED]->(ad);
MATCH (ad:AdoptionRecord {adoptionId: 'ad-1'}), (r:Recommendation {recommendationId: 'rec-3'}) MERGE (ad)-[:OF]->(r);
MATCH (f:Farmer {farmerId: 'f-4'}), (ad:AdoptionRecord {adoptionId: 'ad-2'}) MERGE (f)-[:ADOPTED]->(ad);
MATCH (ad:AdoptionRecord {adoptionId: 'ad-2'}), (r:Recommendation {recommendationId: 'rec-1'}) MERGE (ad)-[:OF]->(r);

// =====================================================================
// DONE — graph seeded
// =====================================================================
RETURN 'CowSense AI seed complete.' AS result;
