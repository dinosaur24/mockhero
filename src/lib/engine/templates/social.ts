import type { TemplateDefinition } from "./types";

export const socialTemplate: TemplateDefinition = {
  id: "social",
  name: "Social Network",
  description:
    "Social platform with users, posts, likes, follows, and direct messages. Country field drives locale-aware names across the network.",
  tables: ["users", "posts", "likes", "follows", "messages"],
  default_counts: {
    users: 150,
    posts: 600,
    likes: 3000,
    follows: 2000,
    messages: 1000,
  },
  schema: {
    tables: [
      {
        name: "users",
        count: 150,
        fields: [
          { name: "id", type: "uuid" },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "BR", "JP", "DE", "FR", "KR", "ES"],
              weights: [25, 12, 14, 12, 10, 9, 10, 8],
            },
          },
          { name: "username", type: "username" },
          { name: "first_name", type: "first_name" },
          { name: "last_name", type: "last_name" },
          { name: "email", type: "email" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "display_name", type: "full_name" },
          { name: "bio", type: "bio" },
          { name: "is_verified", type: "boolean", params: { probability: 0.03 } },
          { name: "created_at", type: "datetime", params: { min: "2023-01-01", max: "2026-03-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "posts",
        count: 600,
        fields: [
          { name: "id", type: "uuid" },
          { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "content", type: "sentence" },
          { name: "hashtag", type: "hashtag" },
          { name: "created_at", type: "datetime", params: { min: "2024-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "likes",
        count: 3000,
        fields: [
          { name: "id", type: "uuid" },
          { name: "user_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "post_id", type: "ref", params: { table: "posts", field: "id" } },
          { name: "created_at", type: "datetime", params: { min: "2024-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "follows",
        count: 2000,
        fields: [
          { name: "id", type: "uuid" },
          { name: "follower_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "following_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "created_at", type: "datetime", params: { min: "2023-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "messages",
        count: 1000,
        fields: [
          { name: "id", type: "uuid" },
          { name: "sender_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "receiver_id", type: "ref", params: { table: "users", field: "id" } },
          { name: "body", type: "sentence" },
          { name: "is_read", type: "boolean", params: { probability: 0.72 } },
          { name: "sent_at", type: "datetime", params: { min: "2025-01-01", max: "2026-03-20" } },
        ],
      },
    ],
  },
};
