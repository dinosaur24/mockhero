import type { TemplateDefinition } from "./types";

export const saasTemplate: TemplateDefinition = {
  id: "saas",
  name: "SaaS",
  description:
    "Multi-tenant SaaS with organizations, team members, subscriptions, and invoices. Invoices reference subscriptions. Country field triggers locale-aware user data.",
  tables: ["organizations", "members", "subscriptions", "invoices"],
  default_counts: {
    organizations: 20,
    members: 100,
    subscriptions: 20,
    invoices: 120,
  },
  schema: {
    tables: [
      {
        name: "organizations",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "company_name" },
          { name: "slug", type: "slug" },
          { name: "domain", type: "domain" },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "DE", "FR", "JP", "BR", "AU"],
              weights: [30, 15, 13, 10, 10, 10, 12],
            },
          },
          { name: "created_at", type: "datetime", params: { min: "2023-01-01", max: "2026-01-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "members",
        count: 100,
        fields: [
          { name: "id", type: "uuid" },
          { name: "org_id", type: "ref", params: { table: "organizations", field: "id" } },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "DE", "FR", "JP", "BR", "AU"],
              weights: [30, 15, 13, 10, 10, 10, 12],
            },
          },
          { name: "first_name", type: "first_name" },
          { name: "last_name", type: "last_name" },
          { name: "email", type: "email" },
          {
            name: "role",
            type: "enum",
            params: {
              values: ["owner", "admin", "member", "viewer"],
              weights: [5, 15, 60, 20],
            },
          },
          { name: "job_title", type: "job_title" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "invited_at", type: "datetime", params: { min: "2023-06-01", max: "2026-03-01" } },
        ],
      },
      {
        name: "subscriptions",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "org_id", type: "ref", params: { table: "organizations", field: "id" } },
          {
            name: "plan",
            type: "enum",
            params: {
              values: ["starter", "pro", "enterprise"],
              weights: [40, 40, 20],
            },
          },
          {
            name: "status",
            type: "enum",
            params: {
              values: ["active", "past_due", "cancelled", "trialing"],
              weights: [65, 10, 15, 10],
            },
          },
          {
            name: "interval",
            type: "enum",
            params: { values: ["monthly", "yearly"], weights: [60, 40] },
          },
          {
            name: "amount",
            type: "enum",
            params: {
              values: ["29.00", "79.00", "199.00", "290.00", "790.00", "1990.00"],
              weights: [25, 25, 10, 15, 15, 10],
            },
          },
          { name: "currency", type: "currency" },
          { name: "current_period_start", type: "datetime", params: { min: "2026-02-01", max: "2026-03-20" } },
          { name: "current_period_end", type: "date_future", params: { min: 1, max: 30 } },
          { name: "trial_end", type: "date_future", params: { min: 1, max: 14 } },
          { name: "started_at", type: "datetime", params: { min: "2024-01-01", max: "2026-03-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "invoices",
        count: 120,
        fields: [
          { name: "id", type: "uuid" },
          { name: "invoice_number", type: "sequence", params: { prefix: "INV-", start: 1001 } },
          { name: "subscription_id", type: "ref", params: { table: "subscriptions", field: "id" } },
          {
            name: "amount",
            type: "enum",
            params: {
              values: ["29.00", "79.00", "199.00", "290.00", "790.00", "1990.00"],
              weights: [25, 25, 10, 15, 15, 10],
            },
          },
          { name: "currency", type: "currency" },
          {
            name: "status",
            type: "enum",
            params: {
              values: ["paid", "pending", "overdue", "void"],
              weights: [72, 13, 10, 5],
            },
          },
          { name: "issued_at", type: "datetime", params: { min: "2024-06-01", max: "2026-03-20" } },
          { name: "due_date", type: "date_future", params: { min: 1, max: 30 } },
        ],
      },
    ],
  },
};
