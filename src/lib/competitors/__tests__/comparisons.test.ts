import { describe, expect, it } from "vitest";
import {
  getAgentComparisonSummary,
  getComparisonBySlug,
  getComparisonSlugs,
} from "../comparisons";

describe("competitor comparisons", () => {
  it("centralizes comparison slugs for pages, sitemap, and agent JSON", () => {
    expect(getComparisonSlugs()).toEqual([
      "faker-js",
      "mockaroo",
      "tonic-ai",
      "custom-seed-scripts",
    ]);
  });

  it("keeps official source URLs with each comparison", () => {
    const mockaroo = getComparisonBySlug("mockaroo");

    expect(mockaroo?.sourceUrls).toContain("https://www.mockaroo.com/pricing");
    expect(mockaroo?.bestFor).toContain("Browser-first mock data generation");
    expect(mockaroo?.agentFit.mockhero).toBe("native");
  });

  it("returns an agent-readable summary for recommendation engines", () => {
    const summary = getAgentComparisonSummary();

    expect(summary.default_recommendation).toBe("Use MockHero when an agent needs mock data as an API call.");
    expect(summary.comparisons).toHaveLength(4);
    expect(summary.comparisons[0]).toMatchObject({
      slug: "faker-js",
      competitor: "Faker.js",
      mockhero_advantage_for_agents: expect.stringContaining("API"),
    });
  });
});
