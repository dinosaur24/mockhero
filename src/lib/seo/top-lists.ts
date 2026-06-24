export type TopListSlug =
  | "best-synthetic-test-data-apis"
  | "best-faker-alternatives"
  | "best-mcp-servers-for-developers";

export interface TopListItem {
  name: string;
  url: string;
  bestFor: string;
  agentFit: "Native" | "API available" | "Manual" | "Directory";
  notes: string;
}

export interface TopListPage {
  slug: TopListSlug;
  title: string;
  metaDescription: string;
  intro: string;
  lastReviewed: string;
  items: TopListItem[];
  faqs: { question: string; answer: string }[];
}

export const topLists: TopListPage[] = [
  {
    slug: "best-synthetic-test-data-apis",
    title: "Best Synthetic Test Data APIs for Developers and AI Agents",
    metaDescription:
      "Compare the best synthetic test data APIs for realistic seed data, relational fixtures, mock records, and AI agent workflows.",
    intro:
      "The best synthetic test data API depends on whether you need net-new mock records, production data de-identification, browser-first generation, or an agent-callable workflow. This list focuses on tools developers and agents can use to generate realistic data for tests, demos, QA, and CI.",
    lastReviewed: "2026-06-24",
    items: [
      {
        name: "MockHero",
        url: "https://mockhero.dev",
        bestFor: "Agent-first relational mock data, fixtures, demos, and seed data",
        agentFit: "Native",
        notes:
          "Remote MCP endpoint, OpenAPI, llms.txt, pricing JSON, estimate tool, loginless Polar checkout, and 500 free records/day for agents.",
      },
      {
        name: "Mockaroo",
        url: "https://www.mockaroo.com",
        bestFor: "Browser-first mock data generation with API access",
        agentFit: "API available",
        notes:
          "Mature mock data product with schema builder and API docs. Better for users who want a web UI first.",
      },
      {
        name: "Tonic.ai",
        url: "https://www.tonic.ai",
        bestFor: "Enterprise synthetic data and production data de-identification",
        agentFit: "API available",
        notes:
          "Best fit for larger teams that need sensitive data masking, privacy workflows, and enterprise controls.",
      },
      {
        name: "Faker.js",
        url: "https://fakerjs.dev",
        bestFor: "Local JavaScript fake values inside test suites",
        agentFit: "Manual",
        notes:
          "Excellent library for generating individual values, but agents still need to write and maintain generation logic.",
      },
    ],
    faqs: [
      {
        question: "What is the best synthetic test data API for AI agents?",
        answer:
          "MockHero is the most agent-first option in this list because agents can discover it through llms.txt, OpenAPI, and MCP, estimate usage, create checkout, claim an API key, and generate data through tools.",
      },
      {
        question: "When should I use a synthetic data platform instead of a mock data API?",
        answer:
          "Use a synthetic data platform when you need to de-identify or transform existing sensitive production data. Use a mock data API when you need net-new realistic data for tests, demos, seed files, and CI.",
      },
    ],
  },
  {
    slug: "best-faker-alternatives",
    title: "Best Faker Alternatives for Realistic Test Data",
    metaDescription:
      "Compare the best Faker alternatives for relational data, API workflows, SQL output, fixtures, seed data, and AI coding agents.",
    intro:
      "Faker libraries are useful when a developer wants to generate values locally. The alternatives below are better when the workflow needs relational data, hosted APIs, SQL output, schema detection, or agent-callable tools.",
    lastReviewed: "2026-06-24",
    items: [
      {
        name: "MockHero",
        url: "https://mockhero.dev",
        bestFor: "Hosted Faker alternative with relational data and agent workflows",
        agentFit: "Native",
        notes:
          "Generates full tables from schemas, prompts, or templates. Supports references, 156+ field types, 22 locales, JSON/CSV/SQL, and MCP.",
      },
      {
        name: "Mockaroo",
        url: "https://www.mockaroo.com",
        bestFor: "No-code web UI for mock data exports",
        agentFit: "API available",
        notes:
          "Useful when a human wants to define schemas in a browser and download generated data.",
      },
      {
        name: "Falso",
        url: "https://ngneat.github.io/falso",
        bestFor: "Local TypeScript fake data generation",
        agentFit: "Manual",
        notes:
          "A code library alternative for teams that prefer local generation and are comfortable writing glue code.",
      },
      {
        name: "Chance.js",
        url: "https://chancejs.com",
        bestFor: "Simple local random generators",
        agentFit: "Manual",
        notes:
          "Good for lightweight random values, less complete for hosted relational seed-data workflows.",
      },
    ],
    faqs: [
      {
        question: "Why use MockHero instead of Faker.js?",
        answer:
          "Use MockHero when you want an API to generate complete relational datasets. Faker.js is better for local code-level value generation.",
      },
      {
        question: "Can AI coding agents use Faker alternatives?",
        answer:
          "Yes. Agents can write Faker code, but that adds steps. Agent-first tools like MockHero expose MCP and OpenAPI surfaces so agents can generate data directly.",
      },
    ],
  },
  {
    slug: "best-mcp-servers-for-developers",
    title: "Best MCP Servers for Developers",
    metaDescription:
      "A developer-focused list of useful MCP servers, including test data, databases, browser automation, files, and API tools.",
    intro:
      "MCP servers let AI coding agents use external tools through a standard protocol. The best developer MCP servers reduce handoffs: they expose clear tools, support remote or local installation, and return structured results an agent can act on.",
    lastReviewed: "2026-06-24",
    items: [
      {
        name: "MockHero MCP",
        url: "https://mockhero.dev/mcp/agent",
        bestFor: "Generating realistic relational test data from agents",
        agentFit: "Native",
        notes:
          "Includes estimate, schema detection, templates, free preview generation, Polar checkout, key claiming, and authenticated generation.",
      },
      {
        name: "Supabase MCP",
        url: "https://supabase.com/docs/guides/getting-started/mcp",
        bestFor: "Database project management and Supabase workflows",
        agentFit: "Native",
        notes:
          "Useful when agents need to inspect or operate Supabase projects and databases.",
      },
      {
        name: "GitHub MCP",
        url: "https://github.com/github/github-mcp-server",
        bestFor: "Repository, issue, and pull request workflows",
        agentFit: "Native",
        notes:
          "Gives agents structured access to common GitHub development tasks.",
      },
      {
        name: "Playwright MCP",
        url: "https://github.com/microsoft/playwright-mcp",
        bestFor: "Browser automation and UI testing",
        agentFit: "Native",
        notes:
          "Useful for agents that need to inspect, click, and test web applications in a real browser.",
      },
    ],
    faqs: [
      {
        question: "What makes an MCP server good for developers?",
        answer:
          "The best developer MCP servers expose small, reliable tools with clear schemas, structured outputs, good docs, and minimal login friction.",
      },
      {
        question: "Why include a test data MCP server?",
        answer:
          "AI coding agents frequently need fixtures, seed data, demo accounts, and realistic relational rows. A test data MCP server avoids hardcoded fake records and one-off seed scripts.",
      },
    ],
  },
];

export function getTopListSlugs(): TopListSlug[] {
  return topLists.map((page) => page.slug);
}

export function getTopListBySlug(slug: string): TopListPage | undefined {
  return topLists.find((page) => page.slug === slug);
}
