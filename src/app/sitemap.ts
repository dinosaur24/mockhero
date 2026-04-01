import type { MetadataRoute } from "next";
import { articles } from "./blog/articles";
import { getAllFieldTypeSlugs } from "@/lib/engine/field-type-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mockhero.dev";

  const blogEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs/api-reference`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/authentication`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/field-types`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/errors`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}/docs/rate-limits`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}/docs/templates`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/mcp`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: `${baseUrl}/llms-full.txt`,
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date(),
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      priority: 0.3,
    },
    {
      url: `${baseUrl}/tools/schema-detector`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/data-types`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/calculator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...blogEntries,
    // Programmatic SEO: individual field type pages (156+)
    ...getAllFieldTypeSlugs().map((type) => ({
      url: `${baseUrl}/tools/data-types/${type}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
