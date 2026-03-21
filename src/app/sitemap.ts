import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mockhero.dev";

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
  ];
}
