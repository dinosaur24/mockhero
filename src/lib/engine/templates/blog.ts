import type { TemplateDefinition } from "./types";

export const blogTemplate: TemplateDefinition = {
  id: "blog",
  name: "Blog",
  description:
    "Multi-author blog with posts, comments, tags, and a proper post_tags junction table. Country field on authors triggers locale-aware names.",
  tables: ["authors", "posts", "comments", "tags", "post_tags"],
  default_counts: {
    authors: 30,
    posts: 150,
    comments: 600,
    tags: 20,
    post_tags: 400,
  },
  schema: {
    tables: [
      {
        name: "authors",
        count: 30,
        fields: [
          { name: "id", type: "uuid" },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "DE", "FR", "JP", "BR"],
              weights: [30, 20, 15, 12, 12, 11],
            },
          },
          { name: "first_name", type: "first_name" },
          { name: "last_name", type: "last_name" },
          { name: "email", type: "email" },
          { name: "username", type: "username" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "bio", type: "bio" },
          { name: "created_at", type: "datetime", params: { min: "2023-01-01", max: "2026-01-01" } },
        ],
      },
      {
        name: "posts",
        count: 150,
        fields: [
          { name: "id", type: "uuid" },
          { name: "author_id", type: "ref", params: { table: "authors", field: "id" } },
          { name: "title", type: "title" },
          { name: "slug", type: "slug" },
          { name: "excerpt", type: "sentence" },
          { name: "content", type: "markdown" },
          { name: "featured_image", type: "image_url" },
          {
            name: "status",
            type: "enum",
            params: {
              values: ["draft", "published", "archived"],
              weights: [10, 80, 10],
            },
          },
          { name: "created_at", type: "datetime", params: { min: "2024-01-01", max: "2025-12-31" } },
          { name: "published_at", type: "datetime", params: { min: "2025-01-01", max: "2026-03-20" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "comments",
        count: 600,
        fields: [
          { name: "id", type: "uuid" },
          { name: "post_id", type: "ref", params: { table: "posts", field: "id" } },
          { name: "commenter_name", type: "full_name" },
          { name: "commenter_email", type: "email" },
          { name: "body", type: "paragraph" },
          {
            name: "is_approved",
            type: "boolean",
            params: { probability: 0.85 },
          },
          { name: "created_at", type: "datetime", params: { min: "2024-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "tags",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "tag" },
          { name: "slug", type: "slug" },
        ],
      },
      {
        name: "post_tags",
        count: 400,
        fields: [
          { name: "id", type: "uuid" },
          { name: "post_id", type: "ref", params: { table: "posts", field: "id" } },
          { name: "tag_id", type: "ref", params: { table: "tags", field: "id" } },
        ],
      },
    ],
  },
};
