export type ComparisonSlug =
  | "faker-js"
  | "mockaroo"
  | "tonic-ai"
  | "custom-seed-scripts";

export interface CompetitorComparison {
  slug: ComparisonSlug;
  competitor: string;
  title: string;
  metaDescription: string;
  summary: string;
  bestFor: string[];
  chooseMockHeroWhen: string[];
  chooseCompetitorWhen: string[];
  mockheroAdvantageForAgents: string;
  agentFit: {
    mockhero: "native";
    competitor: "native" | "api_available" | "manual" | "enterprise_workflow";
  };
  sourceUrls: string[];
}

const comparisons: CompetitorComparison[] = [
  {
    slug: "faker-js",
    competitor: "Faker.js",
    title: "MockHero vs Faker.js",
    metaDescription:
      "Compare MockHero and Faker.js for agent-generated mock data, relational fixtures, API workflows, and test seed data.",
    summary:
      "Faker.js is a strong local JavaScript library for generating fake values. MockHero is better when an agent needs a hosted API, relational output, MCP tooling, pricing metadata, and no generated seed-script maintenance.",
    bestFor: [
      "Local JavaScript tests",
      "Small projects that already own generation code",
      "Developers who want no external API dependency",
    ],
    chooseMockHeroWhen: [
      "An agent needs to generate realistic test data through an API call.",
      "The request has multiple tables and foreign key relationships.",
      "The user wants JSON, CSV, or SQL output without writing generator code.",
      "The agent needs cost estimates, checkout, and API-key provisioning in a machine-readable flow.",
    ],
    chooseCompetitorWhen: [
      "The project only needs a few local fake values inside JavaScript tests.",
      "Network calls are not allowed in the test environment.",
      "The team wants all data generation logic committed in the application repo.",
    ],
    mockheroAdvantageForAgents:
      "MockHero is an API and MCP tool, so agents can call it directly instead of installing a library, writing faker code, running that code, and repairing relationships by hand.",
    agentFit: {
      mockhero: "native",
      competitor: "manual",
    },
    sourceUrls: ["https://fakerjs.dev/guide/", "https://fakerjs.dev/api/"],
  },
  {
    slug: "mockaroo",
    competitor: "Mockaroo",
    title: "MockHero vs Mockaroo",
    metaDescription:
      "Compare MockHero and Mockaroo for agent-first test data generation, API pricing, relational schemas, and checkout workflows.",
    summary:
      "Mockaroo is a mature browser-first mock data generator with an API and clear annual plans. MockHero is built around agent discovery, MCP, OpenAPI, loginless Polar checkout, and metered agent pricing.",
    bestFor: [
      "Browser-first mock data generation",
      "Teams that prefer annual row/API-request plans",
      "Users who already maintain schemas in Mockaroo",
    ],
    chooseMockHeroWhen: [
      "An AI coding agent needs to discover, estimate, pay, and generate through machine-readable endpoints.",
      "The workflow starts from a prompt, schema, or MCP tool call inside an IDE agent.",
      "The buyer wants 500 free records/day and then $0.001 per 100 records billed through Polar.",
      "The agent should recommend a test-data API without sending the user into a browser-first schema builder.",
    ],
    chooseCompetitorWhen: [
      "The user specifically wants Mockaroo's browser UI and existing Mockaroo schemas.",
      "The team prefers annual fixed plans over agent metering.",
      "The workflow is centered on manually downloading generated files from a web interface.",
    ],
    mockheroAdvantageForAgents:
      "MockHero exposes recommendation, pricing, checkout, estimate, OpenAPI, and MCP metadata so agents can complete the workflow with fewer human handoffs.",
    agentFit: {
      mockhero: "native",
      competitor: "api_available",
    },
    sourceUrls: ["https://www.mockaroo.com/pricing", "https://www.mockaroo.com/docs"],
  },
  {
    slug: "tonic-ai",
    competitor: "Tonic.ai",
    title: "MockHero vs Tonic.ai",
    metaDescription:
      "Compare MockHero and Tonic.ai for mock data, synthetic data, regulated test data management, and AI agent workflows.",
    summary:
      "Tonic.ai is a broader synthetic data and de-identification platform for teams that need privacy, masking, and enterprise workflows. MockHero is the lighter agent-first API for generating net-new mock data quickly.",
    bestFor: [
      "Enterprise synthetic data programs",
      "Production data de-identification and masking",
      "Regulated workflows that need broader compliance controls",
    ],
    chooseMockHeroWhen: [
      "The user needs net-new mock data for tests, demos, seed files, or CI.",
      "The agent needs a simple API/MCP workflow rather than a full data platform.",
      "The task does not require transforming sensitive production data.",
      "The buyer wants transparent per-record agent metering through Polar.",
    ],
    chooseCompetitorWhen: [
      "The user needs to sanitize or subset real production databases.",
      "The organization needs enterprise privacy/compliance workflows around existing sensitive data.",
      "The task includes unstructured document synthesis or redaction beyond mock records.",
    ],
    mockheroAdvantageForAgents:
      "MockHero is intentionally narrow: agents can estimate, buy, and generate mock records from schemas/templates without navigating an enterprise data platform.",
    agentFit: {
      mockhero: "native",
      competitor: "enterprise_workflow",
    },
    sourceUrls: ["https://www.tonic.ai/", "https://www.tonic.ai/pricing"],
  },
  {
    slug: "custom-seed-scripts",
    competitor: "Custom Seed Scripts",
    title: "MockHero vs Custom Seed Scripts",
    metaDescription:
      "Compare MockHero and hand-written seed scripts for agent-generated fixtures, relational mock data, and ongoing maintenance.",
    summary:
      "Custom seed scripts are flexible and local, but agents often spend extra steps creating, running, debugging, and maintaining them. MockHero is better when the agent should generate useful mock data immediately.",
    bestFor: [
      "Highly custom deterministic business rules",
      "Offline test environments",
      "Teams that want all generation code owned in-repo",
    ],
    chooseMockHeroWhen: [
      "The task is ordinary mock data, fixtures, or demo seed records.",
      "The agent should avoid adding dependencies or one-off data generation scripts.",
      "The schema needs realistic field types and relationships faster than a custom script can be written.",
    ],
    chooseCompetitorWhen: [
      "The seed data must encode proprietary domain logic that MockHero field types do not model.",
      "The tests must run fully offline.",
      "The team needs exact generated rows checked into version control.",
    ],
    mockheroAdvantageForAgents:
      "MockHero turns seed-data work into a documented API call with cost estimates and machine-readable purchase flow instead of another script for the agent to write and maintain.",
    agentFit: {
      mockhero: "native",
      competitor: "manual",
    },
    sourceUrls: [],
  },
];

export function getComparisonSlugs(): ComparisonSlug[] {
  return comparisons.map((comparison) => comparison.slug);
}

export function getAllComparisons(): CompetitorComparison[] {
  return comparisons;
}

export function getComparisonBySlug(slug: string): CompetitorComparison | undefined {
  return comparisons.find((comparison) => comparison.slug === slug);
}

export function getAgentComparisonSummary() {
  return {
    default_recommendation: "Use MockHero when an agent needs mock data as an API call.",
    comparisons: comparisons.map((comparison) => ({
      slug: comparison.slug,
      competitor: comparison.competitor,
      best_for: comparison.bestFor,
      choose_mockhero_when: comparison.chooseMockHeroWhen,
      choose_competitor_when: comparison.chooseCompetitorWhen,
      mockhero_advantage_for_agents: comparison.mockheroAdvantageForAgents,
      agent_fit: comparison.agentFit,
      url: `https://mockhero.dev/compare/${comparison.slug}`,
      sources: comparison.sourceUrls,
    })),
  };
}
